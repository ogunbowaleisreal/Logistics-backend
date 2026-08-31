import { Router } from "express";
import {
    createAnnouncement,
    getAnnouncements,
    sendAnnouncement,
    resendAnnouncement,
    deleteAnnouncement,
} from "../../controllers/business/announcement.controller";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router
    .route("")
    .get(staffRoleVerification("GETANNOUNCEMENT"), getAnnouncements)
    .post(staffRoleVerification("CRTANNOUNCEMENT"), createAnnouncement);

router
    .route("/:announcementId/send")
    .post(staffRoleVerification("SENDANNOUNCEMENT"), sendAnnouncement);

router
    .route("/:announcementId/resend")
    .post(staffRoleVerification("RESENDANNOUNCEMENT"), resendAnnouncement);

router
    .route("/:announcementId")
    .delete(staffRoleVerification("DELANNOUNCEMENT"), deleteAnnouncement);

export default router;