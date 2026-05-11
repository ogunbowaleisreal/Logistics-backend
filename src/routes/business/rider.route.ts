import { Router } from "express";
import {
  createRider,
  deleteRider,
  getRiders,
  updateRider,
} from "../../controllers/business/rider.controller";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";
import { validate } from "../../middlewares/validation.middleware";
import {
  createRiderSchema,
  updateRiderSchema,
} from "../../validators/rider.validator";

const router = Router();

router
  .route("/")
  .post(
    staffRoleVerification("CRTRIDER"),
    validate(createRiderSchema, "body"),
    createRider,
  )
  .get(staffRoleVerification("GETRIDERS"), getRiders)
  .patch(
    staffRoleVerification("UPTRIDER"),
    validate(updateRiderSchema, "body"),
    updateRider,
  )
  .delete(staffRoleVerification("DELRIDER"), deleteRider);

export default router;
