import { Prisma, TransactionStatus } from "@prisma/client";
import { ReviewRepository } from "./review.repository";
import { CreateReviewDTO } from "./review.interface";
import { prisma } from "../../configs/prisma";
import { AppError } from "../../errors/AppError";
import { NotFoundError } from "../../errors/NotFoundError";

export class ReviewService {
  private reviewRepository: ReviewRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
  }

  async create(dto: CreateReviewDTO, userId: number) {
    const conference = await prisma.conference.findUnique({
      where: { id: dto.conferenceId },
    });

    if (!conference) {
      throw new NotFoundError("Conference not found");
    }

    if (new Date() < conference.endDate) {
      throw new AppError(
        "A review can only be submitted after the conference has ended",
        400,
      );
    }

    const approvedTransaction = await prisma.transaction.findFirst({
      where: {
        userId,
        conferenceId: dto.conferenceId,
        status: TransactionStatus.APPROVED,
      },
    });

    if (!approvedTransaction) {
      throw new AppError(
        "You have not purchased a ticket for this conference, or your payment has not been approved yet",
        400,
      );
    }

    const existingReview = await this.reviewRepository.findUserReview(
      userId,
      dto.conferenceId,
    );

    if (existingReview) {
      throw new AppError(
        "You have already reviewed this conference",
        400,
      );
    }

    return this.reviewRepository.create({
      rating: dto.rating,
      comment: dto.comment,
      user: {
        connect: {
          id: userId,
        },
      },
      conference: {
        connect: {
          id: dto.conferenceId,
        },
      },
    });
  }

  async findAll(page: number, limit: number, conferenceId?: number) {
    const skip = (page - 1) * limit;

    return this.reviewRepository.findMany(skip, limit, conferenceId);
  }

  async findById(id: number) {
    const review = await this.reviewRepository.findById(id);

    if (!review) {
      throw new NotFoundError("Review not found");
    }

    return review;
  }

  async update(id: number, data: Prisma.ReviewUpdateInput, userId: number) {
    const review = await this.findById(id);

    if (review.userId !== userId) {
      throw new AppError("You do not have permission to update this review", 403);
    }

    return this.reviewRepository.update(id, data);
  }

  async delete(id: number, userId: number) {
    const review = await this.findById(id);

    if (review.userId !== userId) {
      throw new AppError("You do not have permission to delete this review", 403);
    }

    return this.reviewRepository.delete(id);
  }
}