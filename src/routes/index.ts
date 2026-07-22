import { Router } from "express";
import { ConferenceRoute } from "../modules/conference/conference.route";

const router = Router();

const conferenceRoute = new ConferenceRoute();

router.use("/conferences", conferenceRoute.router);

export default router;