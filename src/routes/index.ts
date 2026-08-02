import { Router } from "express";

import { ConferenceRoute } from "../modules/conference/conference.route";
import categoryRoute from "../modules/category/category.route";
import { TicketTypeRoute } from "../modules/ticket/ticket-type.route";
import { TransactionRoute } from "../modules/transaction/transaction.route";
import { PromotionRoute } from "../modules/promotion/promotion.route";
import { ReviewRouter } from "../modules/review/review.route";
import { AuthRouter } from "../modules/auth/auth.router";
import { DashboardRouter } from "../modules/dashboard/dashboard.router";

const router = Router();

const conferenceRoute = new ConferenceRoute();
const ticketTypeRoute = new TicketTypeRoute();
const transactionRoute = new TransactionRoute();
const promotionRoute = new PromotionRoute();
const reviewRouter = new ReviewRouter();
const authRouter = new AuthRouter();
const dashboardRouter = new DashboardRouter();


router.use("/conferences", conferenceRoute.router);

router.use("/categories", categoryRoute);

router.use("/tickets", ticketTypeRoute.router);

router.use("/transactions", transactionRoute.router);

router.use("/promotions", promotionRoute.router);

router.use("/reviews", reviewRouter.getRouter());

router.use("/auth", authRouter.router);

router.use("/dashboard", dashboardRouter.router);

export default router;