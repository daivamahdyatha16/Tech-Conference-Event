import { Router } from "express";
import { TicketTypeController } from "./ticket-type.controller";

const ticketTypeController = new TicketTypeController();

export class TicketTypeRoute {
    public router: Router;

    constructor() {
        this.router = Router();
        this.router.post("/conference/:conferenceId/tickets", ticketTypeController.create.bind(ticketTypeController));
        this.router.get("/conference/:conferenceId/tickets",ticketTypeController.findAllByConference.bind(ticketTypeController));
        this.router.get("/:id", ticketTypeController.findById.bind(ticketTypeController));
        this.router.patch("/:id", ticketTypeController.update.bind(ticketTypeController)); 
        this.router.delete("/:id", ticketTypeController.delete.bind(ticketTypeController));
  }
}