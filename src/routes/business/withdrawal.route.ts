import { Router } from "express";
import { getWithdrawals, requestWithdrawal } from "../../controllers/business/withdrawal.controller";
import { businessVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router
  .route("/")
  .post(businessVerification, requestWithdrawal)
  .get(businessVerification, getWithdrawals);

export default router;
