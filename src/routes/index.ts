import { Router } from "express";

import { ConferenceRoute } from "../modules/conference/conference.route";
import categoryRouter from "../modules/category/category.route";
import { TicketTypeRoute } from "../modules/ticket/ticket-type.route";
import { TransactionRoute } from "../modules/transaction/transaction.route";

const router = Router();

const conferenceRoute = new ConferenceRoute();
const ticketTypeRoute = new TicketTypeRoute();
const transactionRoute = new TransactionRoute();


router.use("/conference", conferenceRoute.router);

router.use("/category", categoryRouter);

router.use("/ticket", ticketTypeRoute.router);

router.use("/transaction", transactionRoute.router);

export default router;