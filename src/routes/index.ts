import { Router } from "express";

import { ConferenceRoute } from "../modules/conference/conference.route";
import categoryRoute from "../modules/category/category.route";
import { TicketTypeRoute } from "../modules/ticket/ticket-type.route";
import { TransactionRoute } from "../modules/transaction/transaction.route";
import { PromotionRoute } from "../modules/promotion/promotion.route";


const router = Router();

const conferenceRoute = new ConferenceRoute();
const ticketTypeRoute = new TicketTypeRoute();
const transactionRoute = new TransactionRoute();
const promotionRoute = new PromotionRoute();


router.use("/conference", conferenceRoute.router);

router.use("/category", categoryRoute);

router.use("/ticket", ticketTypeRoute.router);

router.use("/transaction", transactionRoute.router);

router.use("/promotion", promotionRoute.router);


export default router;