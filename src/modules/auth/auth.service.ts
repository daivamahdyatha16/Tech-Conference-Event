import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { DiscountType, Prisma, UserRole } from "@prisma/client";
import { prisma } from "../../configs/prisma";
import { AppError } from "../../errors/AppError";
import { PointService } from "../point/point.service";
import {
  getCouponExpiry,
  REFERRAL_COUPON_PERCENTAGE,
} from "../point/point.utils";
import { RegisterInput } from "./auth.validation";

const REFERRAL_CODE_MAX_ATTEMPTS = 5;

export const generateReferralCode = () =>
  `REF-${randomBytes(4).toString("hex").toUpperCase()}`;

const isReferralCodeConflict = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002" &&
  ((error.meta?.target as string[] | string | undefined) ?? "")
    .toString()
    .includes("referral_code");

export class AuthService {
  static async register(dto: RegisterInput) {
    const { fullName, email, phoneNumber, password, role } = dto;
    const userRole = role ?? UserRole.ATTENDEE;
    const referredByCode = dto.referredByCode?.trim().toUpperCase() || undefined;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("Email is already registered", 400);
    }

    if (phoneNumber) {
      const existingPhone = await prisma.user.findFirst({
        where: { phoneNumber },
      });
      if (existingPhone) {
        throw new AppError("Phone number is already in use", 400);
      }
    }

    let referrer: { id: number } | null = null;
    if (referredByCode) {
      if (userRole === UserRole.ORGANIZER) {
        throw new AppError(
          "Event Organizers cannot register using a referral code",
          400
        );
      }

      referrer = await prisma.user.findFirst({
        where: { referralCode: referredByCode, role: UserRole.ATTENDEE },
        select: { id: true },
      });

      if (!referrer) {
        throw new AppError("Referral code not found", 400);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    for (let attempt = 0; attempt < REFERRAL_CODE_MAX_ATTEMPTS; attempt++) {
      try {
        const newUser = await prisma.$transaction(async (tx) => {
          const now = new Date();
          const user = await tx.user.create({
            data: {
              fullName,
              email,
              phoneNumber,
              password: hashedPassword,
              role: userRole,
              referralCode:
                userRole === UserRole.ATTENDEE ? generateReferralCode() : null,
              referredById: referrer?.id ?? null,
            },
          });

          if (referrer) {
            await PointService.grantReferralReward(
              tx,
              referrer.id,
              user.fullName,
              now,
            );

            await tx.coupon.create({
              data: {
                userId: user.id,
                discountType: DiscountType.PERCENTAGE,
                discountValue: REFERRAL_COUPON_PERCENTAGE,
                expiredAt: getCouponExpiry(now),
              },
            });
          }

          return user;
        });

        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
      } catch (error) {
        if (isReferralCodeConflict(error)) continue;
        throw error;
      }
    }

    throw new AppError("Failed to generate a referral code, please try again", 500);
  }

  static async login(dto: { email: string; password: string }) {
    const { email, password } = dto;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    const { password: _, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword,
    };
  }

  static async getProfile(userId: string | number) {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        referralCode: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const now = new Date();

    const [pointBalance, pointBatches, coupons, pointHistory] = await Promise.all([
      PointService.getBalance(user.id, now),
      prisma.pointBatch.findMany({
        where: { userId: user.id },
        orderBy: { expiredAt: "asc" },
        select: {
          id: true,
          source: true,
          amount: true,
          remaining: true,
          earnedAt: true,
          expiredAt: true,
        },
      }),
      prisma.coupon.findMany({
        where: {
          userId: user.id,
          isUsed: false,
          expiredAt: { gte: now },
        },
        select: {
          id: true,
          discountType: true,
          discountValue: true,
          expiredAt: true,
        },
      }),
      prisma.pointHistory.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          point: true,
          type: true,
          description: true,
          createdAt: true,
          expiredAt: true,
        },
      }),
    ]);

    return {
      ...user,
      pointBalance,
      pointBatches,
      coupons,
      pointHistory,
    };
  }
}