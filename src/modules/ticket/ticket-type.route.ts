import { Router } from "express";
import { TicketTypeController } from "./ticket-type.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";

const ticketTypeController = new TicketTypeController();

export class TicketTypeRoute {
    public router: Router;

    constructor() {
        this.router = Router();
        this.router.post(
            "/conferences/:conferenceId/tickets",
            authMiddleware,
            roleMiddleware(["ORGANIZER"]),
            ticketTypeController.create.bind(ticketTypeController),
        );
        this.router.get("/conferences/:conferenceId/tickets",ticketTypeController.findAllByConference.bind(ticketTypeController));
        this.router.get("/:id", ticketTypeController.findById.bind(ticketTypeController));
        this.router.patch(
            "/:id",
            authMiddleware,
            roleMiddleware(["ORGANIZER"]),
            ticketTypeController.update.bind(ticketTypeController),
        );
        this.router.delete(
            "/:id",
            authMiddleware,
            roleMiddleware(["ORGANIZER"]),
            ticketTypeController.delete.bind(ticketTypeController),
        );
  }
}