import { Router } from "express";
import { ReviewController } from "./review.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

export class ReviewRouter {
  public router: Router;
  private reviewController: ReviewController;

  constructor() {
    this.router = Router();
    this.reviewController = new ReviewController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/", authMiddleware, this.reviewController.create);
    this.router.get("/", this.reviewController.findAll);
    this.router.get("/:id", this.reviewController.findById);
    this.router.patch("/:id", authMiddleware, this.reviewController.update);
    this.router.delete("/:id", authMiddleware, this.reviewController.delete);
  }

  getRouter(): Router {
    return this.router;
  }
}