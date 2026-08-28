import { Router } from "express";
import {
    createAnnouncement,
    getAnnouncements,
    sendAnnouncement,
    resendAnnouncement,
    deleteAnnouncement,
} from "../../controllers/admin/announcement.controller";
import { roleVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router
    .route("")
    .get(roleVerification("GETANNOUNCEMENT"), getAnnouncements)
    .post(roleVerification("CREATEANNOUNCEMENT"), createAnnouncement);

router
    .route("/:announcementId/send")
    .post(roleVerification("SENDANNOUNCEMENT"), sendAnnouncement);

router
    .route("/:announcementId/resend")
    .post(roleVerification("RESENDANNOUNCEMENT"), resendAnnouncement);

router
    .route("/:announcementId")
    .delete(roleVerification("DELANNOUNCEMENT"), deleteAnnouncement);

export default router;