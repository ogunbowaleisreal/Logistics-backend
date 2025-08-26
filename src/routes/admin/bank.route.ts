import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import {
  createBank,
  deleteBank,
  getBankCodes,
  getBanks,
  setDefaultBank,
  verifyBank,
  // updateBank,
} from "../../controllers/admin/bank.controller";

const router = Router();

router
  .route("")
  .post(adminVerification, createBank)
  .get(adminVerification, getBanks)
  // .patch(adminVerification, updateBank)
  .delete(adminVerification, deleteBank);

router.patch("/default", adminVerification, setDefaultBank);

router
  .route("/verify")
  .get(adminVerification, getBankCodes)
  .post(adminVerification, verifyBank);

export default router;
