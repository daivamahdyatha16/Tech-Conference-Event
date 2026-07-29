import { Prisma } from "@prisma/client";
import { ReviewRepository } from "./review.repository";

export class ReviewService {
  private reviewRepository: ReviewRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
  }

  async create(data: Prisma.ReviewCreateInput) {
    return this.reviewRepository.create(data);
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    return this.reviewRepository.findMany(skip, limit);
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