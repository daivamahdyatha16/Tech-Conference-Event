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
      throw new NotFoundError("Conference tidak ditemukan");
    }

    if (new Date() < conference.endDate) {
      throw new AppError(
        "Review hanya bisa diberikan setelah conference selesai",
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
        "Anda belum membeli tiket conference ini atau pembayaran belum disetujui",
        400,
      );
    }

    const existingReview = await this.reviewRepository.findUserReview(
      userId,
      dto.conferenceId,
    );

    if (existingReview) {
      throw new AppError(
        "Anda sudah memberikan review untuk conference ini",
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
      throw new NotFoundError("Review tidak ditemukan");
    }

    return review;
  }

  async update(id: number, data: Prisma.ReviewUpdateInput, userId: number) {
    const review = await this.findById(id);

    if (review.userId !== userId) {
      throw new AppError("Anda tidak memiliki akses untuk mengubah review ini", 403);
    }

    return this.reviewRepository.update(id, data);
  }

  async delete(id: number, userId: number) {
    const review = await this.findById(id);

    if (review.userId !== userId) {
      throw new AppError("Anda tidak memiliki akses untuk menghapus review ini", 403);
    }

    return this.reviewRepository.delete(id);
  }
}