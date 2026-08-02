import { Router } from "express";
import { ConferenceController } from "./conference.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";

const conferenceController = new ConferenceController();

export class ConferenceRoute {
  public router: Router;

  constructor() {
    this.router = Router();

    this.router.post(
      "/",
      authMiddleware,
      roleMiddleware(["ORGANIZER"]),
      conferenceController.create.bind(conferenceController),
    );
    this.router.get("/", conferenceController.findAll.bind(conferenceController));
    this.router.get("/:id", conferenceController.findById.bind(conferenceController));
    this.router.patch("/:id", conferenceController.update.bind(conferenceController));
    this.router.delete("/:id", conferenceController.delete.bind(conferenceController));
  }
}