import { Router } from "express";
import configurationRoute from "./configuration.route";

const router = Router();

router.use("/configuration", configurationRoute);

export default router;
