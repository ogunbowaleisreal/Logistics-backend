import { Router } from "express";
import { accountVerification } from "../../middlewares/authorization.middleware";
import { getBank } from "../../controllers/client/bank.controller";

const router = Router();

router.get("", accountVerification, getBank);

export default router;
