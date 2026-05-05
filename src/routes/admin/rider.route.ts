import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import {
  createRider,
  deleteRider,
  getRiders,
  updateRider,
} from "../../controllers/business/rider.controller";

const router = Router();

router
  .route("")
  .post(adminVerification, createRider)
  .get(adminVerification, getRiders)
  .patch(adminVerification, updateRider)
  .delete(adminVerification, deleteRider);

export default router;
