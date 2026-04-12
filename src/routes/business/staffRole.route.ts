import express from "express";
import { createRole, getRoles, updateRole, getPermissions } from "../../controllers/business/staffRole.controller";
import { businessVerification, staffRoleVerification } from "../../middlewares/authorization.middleware";

const router = express.Router();

router.get("/permissions", getPermissions);
router.post("/", businessVerification, createRole);
router.get("/", businessVerification, getRoles);
router.patch("/", businessVerification, updateRole);

export default router;
