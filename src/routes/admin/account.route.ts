import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import {
  getAccounts,
  updateAccountSatus,
} from "../../controllers/admin/account.controller";

const router = Router();

router
  .route("")
  .get(adminVerification, getAccounts)
  .patch(adminVerification, updateAccountSatus);

export default router;
