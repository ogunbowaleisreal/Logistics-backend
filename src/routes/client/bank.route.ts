import { Router } from "express";
import { getBank } from "../../controllers/client/bank.controller";

const router = Router();

router.get("", getBank);

export default router;
