import { Router } from "express";
import {
  createBank,
  deleteBank,
  getBankCodes,
  getBanks,
  setDefaultBank,
  verifyBank,
} from "../../controllers/business/bank.controller";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router
  .route("/")
  .post(staffRoleVerification("CRTBANK"), createBank)
  .get(staffRoleVerification("GETBANKS"), getBanks)
  .delete(staffRoleVerification("DELBANK"), deleteBank);

router.patch("/default", staffRoleVerification("CRTBANK"), setDefaultBank);

router
  .route("/verify")
  .get(staffRoleVerification("GETBANKS"), getBankCodes)
  .post(staffRoleVerification("GETBANKS"), verifyBank);

export default router;
