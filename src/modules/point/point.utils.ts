import { addMonths } from "date-fns";

export const POINT_VALIDITY_MONTHS = 3;
export const COUPON_VALIDITY_MONTHS = 3;
export const REFERRAL_REWARD_POINTS = 10_000;
export const REFERRAL_COUPON_PERCENTAGE = 10;

export type DiscountRule = {
  type: "PERCENTAGE" | "NOMINAL";
  value: number;
} | null;

export interface AllocatableBatch {
  id: number;
  remaining: number;
  expiredAt: Date;
}

export interface BatchAllocation {
  batchId: number;
  amount: number;
}

export class InsufficientPointsError extends Error {
  constructor() {
    super("You do not have enough points");
  }
}

export class InvalidPointAmountError extends Error {
  constructor() {
    super("Invalid point amount");
  }
}

export const getPointExpiry = (from: Date) =>
  addMonths(from, POINT_VALIDITY_MONTHS);

export const getCouponExpiry = (from: Date) =>
  addMonths(from, COUPON_VALIDITY_MONTHS);

export function allocateFifo(
  batches: AllocatableBatch[],
  amount: number,
): BatchAllocation[] {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new InvalidPointAmountError();
  }

  const sorted = [...batches].sort(
    (a, b) => a.expiredAt.getTime() - b.expiredAt.getTime() || a.id - b.id,
  );
  const total = sorted.reduce((sum, batch) => sum + batch.remaining, 0);

  if (amount > total) {
    throw new InsufficientPointsError();
  }

  const allocations: BatchAllocation[] = [];
  let left = amount;

  for (const batch of sorted) {
    if (left === 0) break;
    const take = Math.min(batch.remaining, left);
    if (take > 0) {
      allocations.push({ batchId: batch.id, amount: take });
      left -= take;
    }
  }

  return allocations;
}

const applyDiscount = (base: number, rule: DiscountRule | undefined) => {
  if (!rule) return 0;
  const raw =
    rule.type === "PERCENTAGE" ? (base * rule.value) / 100 : rule.value;
  return Math.min(base, Math.max(0, Math.round(raw)));
};

export function calculateFinalPrice(input: {
  subtotal: number;
  promotion?: DiscountRule;
  coupon?: DiscountRule;
  requestedPoints: number;
  availablePoints: number;
}) {
  const { subtotal, promotion, coupon, requestedPoints, availablePoints } =
    input;

  if (!Number.isInteger(requestedPoints) || requestedPoints < 0) {
    throw new InvalidPointAmountError();
  }

  if (requestedPoints > availablePoints) {
    throw new InsufficientPointsError();
  }

  const promotionDiscount = applyDiscount(subtotal, promotion);
  const afterPromotion = subtotal - promotionDiscount;
  const couponDiscount = applyDiscount(afterPromotion, coupon);
  const afterCoupon = afterPromotion - couponDiscount;
  const pointUsed = Math.min(requestedPoints, afterCoupon);

  return {
    promotionDiscount,
    couponDiscount,
    pointUsed,
    totalPrice: afterCoupon - pointUsed,
  };
}
