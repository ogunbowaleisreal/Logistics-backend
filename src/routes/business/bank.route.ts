import { Router } from "express";
import {
  createBank,
  deleteBank,
  getBankList,
  getBanks,
  setDefaultBank,
  verifyBank,
} from "../../controllers/business/bank.controller";
import { businessVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router
  .route("/")
  .post(businessVerification, createBank)
  .get(businessVerification, getBanks)
  .delete(businessVerification, deleteBank);

router.patch("/default", businessVerification,
  setDefaultBank);


router
  .route("/verify")
  .get(businessVerification, getBankList)
  .post(businessVerification, verifyBank);

export default router;
