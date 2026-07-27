import { Router } from "express";

import { ConferenceRoute } from "../modules/conference/conference.route";
import categoryRouter from "../modules/category/category.route";
import { TicketTypeRoute } from "../modules/ticket/ticket-type.route";

const router = Router();

const conferenceRoute = new ConferenceRoute();
const ticketTypeRoute = new TicketTypeRoute();

router.use("/conference", conferenceRoute.router);

router.use("/category", categoryRouter);

router.use("/ticket", ticketTypeRoute.router);

export default router;