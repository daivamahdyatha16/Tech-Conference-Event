import { Prisma } from "@prisma/client";
import { ReviewRepository } from "./review.repository";
import { CreateReviewDTO } from "./review.interface";

export class ReviewService {
  private reviewRepository: ReviewRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
  }

  async create(dto: CreateReviewDTO, userId: number) {
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
      throw new Error("Review tidak ditemukan");
    }

    return review;
  }

  async update(id: number, data: Prisma.ReviewUpdateInput) {
    await this.findById(id);

    return this.reviewRepository.update(id, data);
  }

  async delete(id: number) {
    await this.findById(id);

    return this.reviewRepository.delete(id);
  }
}