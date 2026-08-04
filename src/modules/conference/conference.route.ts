import { Router } from "express";
import { ConferenceController } from "./conference.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import { upload } from "../../middleware/upload";

const conferenceController = new ConferenceController();

export class ConferenceRoute {
  public router: Router;

  constructor() {
    this.router = Router();

    this.router.post(
      "/",
      authMiddleware,
      roleMiddleware(["ORGANIZER"]),
      upload.single("thumbnail"),
      conferenceController.create.bind(conferenceController),
    );
    this.router.get("/", conferenceController.findAll.bind(conferenceController));
    this.router.get("/:id", conferenceController.findById.bind(conferenceController));
    this.router.patch(
      "/:id",
      authMiddleware,
      roleMiddleware(["ORGANIZER"]),
      upload.single("thumbnail"),
      conferenceController.update.bind(conferenceController),
    );
    this.router.delete(
      "/:id",
      authMiddleware,
      roleMiddleware(["ORGANIZER"]),
      conferenceController.delete.bind(conferenceController),
    );
  }
}