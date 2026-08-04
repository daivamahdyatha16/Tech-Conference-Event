import { Router } from "express";
import { PromotionController } from "./promotion.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";

const promotionController = new PromotionController();


export class PromotionRoute {
  public router: Router;

  constructor() {
    this.router = Router();

    this.router.post(
      "/",
      authMiddleware,
      roleMiddleware(["ORGANIZER"]),
      promotionController.create.bind(promotionController),
    );

    this.router.get("/", promotionController.findAll.bind(promotionController));

    this.router.get("/:id", promotionController.findById.bind(promotionController));

    this.router.patch(
      "/:id",
      authMiddleware,
      roleMiddleware(["ORGANIZER"]),
      promotionController.update.bind(promotionController),
    );

    this.router.delete(
      "/:id",
      authMiddleware,
      roleMiddleware(["ORGANIZER"]),
      promotionController.delete.bind(promotionController),
    );
  }
}
