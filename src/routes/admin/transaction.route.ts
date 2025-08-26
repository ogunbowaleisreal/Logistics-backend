import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import {
  getTransactions,
  updateTransaction,
} from "../../controllers/admin/transaction.controller";

const router = Router();

router
  .route("")
  .get(adminVerification, getTransactions)
  .patch(adminVerification, updateTransaction);

export default router;
