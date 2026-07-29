import { Router } from "express";
import { PromotionController } from "./promotion.controller";

const promotionController = new PromotionController();


export class PromotionRoute {
  public router: Router;

  constructor() {
    this.router = Router();

    this.router.post("/", promotionController.create.bind(promotionController));

    this.router.get("/", promotionController.findAll.bind(promotionController));

    this.router.get("/:id", promotionController.findById.bind(promotionController));

    this.router.patch("/:id", promotionController.update.bind(promotionController));

    this.router.delete("/:id", promotionController.delete.bind(promotionController));
  }
}
