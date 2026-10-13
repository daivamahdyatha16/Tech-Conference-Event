import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { addMonths } from "date-fns";
import { UserRole } from "@prisma/client";
import { prisma } from "../../configs/prisma";
import { AuthService, generateReferralCode } from "./auth.service";
import { PointService } from "../point/point.service";
import { createUser, hasTestDatabase, resetDatabase } from "../../test/db";

const randomBytesMock = vi.hoisted(() => ({ forced: [] as Buffer[] }));

vi.mock("crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("crypto")>();
  return {
    ...actual,
    randomBytes: (size: number) =>
      randomBytesMock.forced.shift() ?? actual.randomBytes(size),
  };
});

let counter = 0;
const registerPayload = (
  overrides: Partial<{ role: "ATTENDEE" | "ORGANIZER"; referredByCode: string }> = {},
) => {
  counter += 1;
  return {
    fullName: `New User ${counter}`,
    email: `new${counter}-${Date.now()}@test.dev`,
    phoneNumber: `08${String(Date.now()).slice(-8)}${counter}`,
    password: "secret123",
    role: overrides.role ?? "ATTENDEE",
    referredByCode: overrides.referredByCode,
  } as const;
};

describe("generateReferralCode", () => {
  it("menghasilkan format REF- + 8 hex dan tidak berulang", () => {
    const codes = new Set(Array.from({ length: 1000 }, generateReferralCode));
    expect(codes.size).toBe(1000);
    for (const code of codes) expect(code).toMatch(/^REF-[0-9A-F]{8}$/);
  });
});

describe.skipIf(!hasTestDatabase)("AuthService.register (referral)", () => {
  beforeEach(resetDatabase);
  afterAll(() => prisma.$disconnect());

  it("membuat referral code unik untuk attendee baru tanpa kupon", async () => {
    const user = await AuthService.register(registerPayload());
    expect(user.referralCode).toMatch(/^REF-[0-9A-F]{8}$/);
    expect(await prisma.coupon.count({ where: { userId: user.id } })).toBe(0);
  });

  it("organizer tidak mendapat referral code", async () => {
    const user = await AuthService.register(registerPayload({ role: "ORGANIZER" }));
    expect(user.referralCode).toBeNull();
  });

  it("retry saat referral code bentrok", async () => {
    await createUser({ referralCode: "REF-AAAAAAAA" });
    randomBytesMock.forced.push(Buffer.from([0xaa, 0xaa, 0xaa, 0xaa]));

    const user = await AuthService.register(registerPayload());

    expect(randomBytesMock.forced).toHaveLength(0);
    expect(user.referralCode).not.toBe("REF-AAAAAAAA");
    expect(user.referralCode).toMatch(/^REF-[0-9A-F]{8}$/);
  });

  it("referral valid: referrer +10.000 poin, user baru dapat kupon 10% berlaku 3 bulan", async () => {
    const referrer = await createUser({ referralCode: "REF-ANDI0001" });
    const before = new Date();

    const user = await AuthService.register(
      registerPayload({ referredByCode: "REF-ANDI0001" }),
    );

    const batch = await prisma.pointBatch.findFirstOrThrow({
      where: { userId: referrer.id },
    });
    expect(batch.amount).toBe(10_000);
    expect(batch.remaining).toBe(10_000);
    expect(batch.expiredAt.getTime()).toBeGreaterThanOrEqual(
      addMonths(before, 3).getTime(),
    );
    expect(batch.expiredAt.getTime()).toBeLessThanOrEqual(
      addMonths(new Date(), 3).getTime(),
    );

    const coupon = await prisma.coupon.findFirstOrThrow({
      where: { userId: user.id },
    });
    expect(coupon.discountType).toBe("PERCENTAGE");
    expect(coupon.discountValue).toBe(10);
    expect(coupon.expiredAt.getTime()).toBe(batch.expiredAt.getTime());

    const stored = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(stored.referredById).toBe(referrer.id);
  });

  it("3 orang memakai referral yang sama: saldo 30.000", async () => {
    const referrer = await createUser({ referralCode: "REF-TRIPLE01" });
    for (let i = 0; i < 3; i++) {
      await AuthService.register(registerPayload({ referredByCode: "REF-TRIPLE01" }));
    }
    expect(await PointService.getBalance(referrer.id)).toBe(30_000);
  });

  it("menerima kode dengan huruf kecil dan spasi", async () => {
    const referrer = await createUser({ referralCode: "REF-LOWER001" });
    await AuthService.register(registerPayload({ referredByCode: "  ref-lower001 " }));
    expect(await PointService.getBalance(referrer.id)).toBe(10_000);
  });

  it("kode tidak ditemukan: 400 dan user tidak dibuat", async () => {
    const payload = registerPayload({ referredByCode: "REF-NOPE0000" });
    await expect(AuthService.register(payload)).rejects.toMatchObject({
      statusCode: 400,
      message: "Referral code not found",
    });
    expect(await prisma.user.count({ where: { email: payload.email } })).toBe(0);
  });

  it("kode milik organizer ditolak", async () => {
    await createUser({ role: UserRole.ORGANIZER, referralCode: "NUSA2026" });
    await expect(
      AuthService.register(registerPayload({ referredByCode: "NUSA2026" })),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("organizer tidak boleh register dengan referral", async () => {
    await createUser({ referralCode: "REF-ORGTRY01" });
    await expect(
      AuthService.register(
        registerPayload({ role: "ORGANIZER", referredByCode: "REF-ORGTRY01" }),
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rollback: jika pemberian kupon gagal, user dan poin tidak tersimpan", async () => {
    const referrer = await createUser({ referralCode: "REF-ROLLBK01" });
    const payload = registerPayload({ referredByCode: "REF-ROLLBK01" });
    const spy = vi
      .spyOn(PointService, "grantReferralReward")
      .mockRejectedValueOnce(new Error("boom"));

    await expect(AuthService.register(payload)).rejects.toThrow("boom");

    spy.mockRestore();
    expect(await prisma.user.count({ where: { email: payload.email } })).toBe(0);
    expect(await PointService.getBalance(referrer.id)).toBe(0);
  });
});

describe.skipIf(!hasTestDatabase)("PointService.getBalance", () => {
  beforeEach(resetDatabase);

  it("mengabaikan batch yang sudah expired", async () => {
    const user = await createUser();
    await prisma.pointBatch.createMany({
      data: [
        {
          userId: user.id,
          source: "REFERRAL",
          amount: 10_000,
          remaining: 10_000,
          expiredAt: new Date(Date.now() - 1000),
        },
        {
          userId: user.id,
          source: "REFERRAL",
          amount: 10_000,
          remaining: 7_000,
          expiredAt: new Date(Date.now() + 86_400_000),
        },
      ],
    });
    expect(await PointService.getBalance(user.id)).toBe(7_000);
  });
});
