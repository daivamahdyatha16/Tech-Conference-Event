import { Router } from "express";
import { ReviewController } from "./review.controller";

export class ReviewRouter {
  public router: Router;
  private reviewController: ReviewController;

  constructor() {
    this.router = Router();
    this.reviewController = new ReviewController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/", this.reviewController.create);
    this.router.get("/", this.reviewController.findAll);
    this.router.get("/:id", this.reviewController.findById);
    this.router.patch("/:id", this.reviewController.update);
    this.router.delete("/:id", this.reviewController.delete);
  }

  getRouter(): Router {
    return this.router;
  }
}