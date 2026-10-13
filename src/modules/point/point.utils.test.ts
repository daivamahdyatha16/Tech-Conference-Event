import { describe, expect, it } from "vitest";
import {
  allocateFifo,
  calculateFinalPrice,
  getCouponExpiry,
  getPointExpiry,
  InsufficientPointsError,
  InvalidPointAmountError,
} from "./point.utils";

const ymd = (date: Date) => [
  date.getFullYear(),
  date.getMonth() + 1,
  date.getDate(),
];

describe("getPointExpiry", () => {
  it.each([
    [new Date(2023, 11, 28), [2024, 3, 28]],
    [new Date(2025, 10, 30), [2026, 2, 28]],
    [new Date(2023, 10, 30), [2024, 2, 29]],
    [new Date(2026, 4, 31), [2026, 8, 31]],
    [new Date(2026, 7, 31), [2026, 11, 30]],
    [new Date(2026, 9, 31), [2027, 1, 31]],
  ])("%s + 3 bulan", (from, expected) => {
    expect(ymd(getPointExpiry(from))).toEqual(expected);
  });

  it("kupon referral juga berlaku 3 bulan", () => {
    expect(ymd(getCouponExpiry(new Date(2025, 10, 30)))).toEqual([2026, 2, 28]);
  });
});

describe("allocateFifo", () => {
  const soon = { id: 1, remaining: 10_000, expiredAt: new Date("2026-03-01") };
  const later = { id: 2, remaining: 10_000, expiredAt: new Date("2026-06-01") };

  it("memotong batch yang paling cepat expired lebih dulu", () => {
    expect(allocateFifo([later, soon], 15_000)).toEqual([
      { batchId: 1, amount: 10_000 },
      { batchId: 2, amount: 5_000 },
    ]);
  });

  it("memakai id sebagai tie-breaker untuk expiry yang sama", () => {
    const twin = { ...soon, id: 0 };
    expect(allocateFifo([soon, twin], 5_000)).toEqual([
      { batchId: 0, amount: 5_000 },
    ]);
  });

  it("melewati batch yang sudah habis", () => {
    expect(allocateFifo([{ ...soon, remaining: 0 }, later], 1_000)).toEqual([
      { batchId: 2, amount: 1_000 },
    ]);
  });

  it("menolak jika melebihi saldo", () => {
    expect(() => allocateFifo([soon], 10_001)).toThrow(InsufficientPointsError);
  });

  it("menolak jumlah negatif atau desimal", () => {
    expect(() => allocateFifo([soon], -1)).toThrow(InvalidPointAmountError);
    expect(() => allocateFifo([soon], 1.5)).toThrow(InvalidPointAmountError);
  });
});

describe("calculateFinalPrice", () => {
  it("contoh requirement: 300.000 dengan 20.000 poin menjadi 280.000", () => {
    const result = calculateFinalPrice({
      subtotal: 300_000,
      requestedPoints: 20_000,
      availablePoints: 20_000,
    });
    expect(result).toEqual({
      promotionDiscount: 0,
      couponDiscount: 0,
      pointUsed: 20_000,
      totalPrice: 280_000,
    });
  });

  it("menolak poin yang melebihi saldo", () => {
    expect(() =>
      calculateFinalPrice({
        subtotal: 300_000,
        requestedPoints: 30_000,
        availablePoints: 20_000,
      }),
    ).toThrow(InsufficientPointsError);
  });

  it("membatasi poin agar harga akhir tidak negatif", () => {
    const result = calculateFinalPrice({
      subtotal: 50_000,
      requestedPoints: 80_000,
      availablePoints: 80_000,
    });
    expect(result.pointUsed).toBe(50_000);
    expect(result.totalPrice).toBe(0);
  });

  it("menolak poin negatif, desimal, atau NaN", () => {
    for (const requestedPoints of [-1, 1.5, Number.NaN]) {
      expect(() =>
        calculateFinalPrice({
          subtotal: 100_000,
          requestedPoints,
          availablePoints: 100_000,
        }),
      ).toThrow(InvalidPointAmountError);
    }
  });

  it("urutan promo, kupon 10%, lalu poin", () => {
    const result = calculateFinalPrice({
      subtotal: 300_000,
      promotion: { type: "NOMINAL", value: 50_000 },
      coupon: { type: "PERCENTAGE", value: 10 },
      requestedPoints: 20_000,
      availablePoints: 20_000,
    });
    expect(result).toEqual({
      promotionDiscount: 50_000,
      couponDiscount: 25_000,
      pointUsed: 20_000,
      totalPrice: 205_000,
    });
  });

  it("diskon nominal tidak melebihi harga", () => {
    const result = calculateFinalPrice({
      subtotal: 30_000,
      promotion: { type: "NOMINAL", value: 50_000 },
      coupon: { type: "PERCENTAGE", value: 10 },
      requestedPoints: 0,
      availablePoints: 0,
    });
    expect(result.promotionDiscount).toBe(30_000);
    expect(result.couponDiscount).toBe(0);
    expect(result.totalPrice).toBe(0);
  });

  it("membulatkan diskon persentase", () => {
    const result = calculateFinalPrice({
      subtotal: 333_333,
      coupon: { type: "PERCENTAGE", value: 10 },
      requestedPoints: 0,
      availablePoints: 0,
    });
    expect(result.couponDiscount).toBe(33_333);
    expect(Number.isInteger(result.totalPrice)).toBe(true);
  });
});
