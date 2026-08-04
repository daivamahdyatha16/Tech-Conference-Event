import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PointType, DiscountType } from "@prisma/client";
import { prisma } from "../../configs/prisma";
import { AppError } from "../../errors/AppError";

export class AuthService {
  static async register(dto: any) {
    const { fullName, email, phoneNumber, password, role, referredByCode } = dto;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("Email is already registered", 400);
    }

    let referrer = null;
    if (referredByCode) {
      referrer = await prisma.user.findUnique({
        where: { referralCode: referredByCode },
      });

      if (!referrer) {
        throw new AppError("Referral code not found", 400);
      }
    }

    const existingPhone = await prisma.user.findFirst({
        where: { phoneNumber },
    });
    if (existingPhone) {
        throw new AppError("Phone number is already in use", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const ownReferralCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName,
          email,
          phoneNumber,
          password: hashedPassword,
          role: role || "ATTENDEE",
          referralCode: ownReferralCode,
        },
      });

      if (referrer) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3);

        await tx.pointHistory.create({
          data: {
            userId: referrer.id,
            point: 10000,
            type: PointType.EARN,
            description: `Referral reward from ${user.fullName}'s registration`,
            expiredAt: expiryDate,
          },
        });

        await tx.coupon.create({
          data: {
            userId: user.id,
            discountType: DiscountType.PERCENTAGE,
            discountValue: 10,
            expiredAt: expiryDate,
          },
        });
      }

      return user;
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  static async login(dto: any) {
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

    // pointBalance & coupons are needed for the checkout UI (point redemption
    // & referral coupon usage) - REDEEM point rows are stored with expiredAt
    // null (see transaction.service.ts) so they still count toward the balance.
    const [pointAggregate, coupons] = await Promise.all([
      prisma.pointHistory.aggregate({
        where: {
          userId: user.id,
          OR: [{ expiredAt: null }, { expiredAt: { gte: now } }],
        },
        _sum: { point: true },
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
    ]);

    return {
      ...user,
      pointBalance: pointAggregate._sum.point || 0,
      coupons,
    };
  }
}