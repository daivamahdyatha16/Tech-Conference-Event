import { Router } from "express";
import { ConferenceController } from "./conference.controller";

const conferenceController = new ConferenceController();

export class ConferenceRoute {
  public router: Router;

  constructor() {
    this.router = Router();

    this.router.post("/", conferenceController.create.bind(conferenceController));
    this.router.get("/", conferenceController.findAll.bind(conferenceController));
    this.router.get("/:id", conferenceController.findById.bind(conferenceController));
  }
}