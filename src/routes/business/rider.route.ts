import express from "express";
import {
  createRider,
  deleteRider,
  getRiders,
  updateRider,
} from "../../controllers/business/rider.controller";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";

const router = express.Router();

router
  .route("/")
  .post(staffRoleVerification("CRTRIDER"), createRider)
  .get(staffRoleVerification("GETRIDERS"), getRiders)
  .patch(staffRoleVerification("UPTRIDER"), updateRider)
  .delete(staffRoleVerification("DELRIDER"), deleteRider);

export default router;
