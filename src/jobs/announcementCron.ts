import cron from "node-cron";
import { Announcement } from "../models/Announcement";
import { AnnouncementService } from "../services/public/announcements.services";
import logger from "../../logger";

const announcementService = new AnnouncementService();

// Runs every 5 minutes by default — override via env if you want it coarser/finer
const CRON_SCHEDULE = process.env.ANNOUNCEMENT_CRON_SCHEDULE || "*/5 * * * *";

let isRunning = false;

async function processDueAnnouncements(): Promise<void> {
    if (isRunning) {
        logger.warn(
            "Announcement cron: previous run still in progress, skipping this tick"
        );
        return;
    }

    isRunning = true;

    try {
        const dueAnnouncements = await Announcement.find({
            status: "pending",
            announcementStartAt: { $lte: new Date() },
        }).select("_id title");

        if (!dueAnnouncements.length) {
            return;
        }

        logger.info(
            `Announcement cron: found ${dueAnnouncements.length} due announcement(s)`
        );

        for (const announcement of dueAnnouncements) {
            try {
                await announcementService.sendAnnouncement(
                    announcement._id.toString()
                );
                logger.info(
                    `Announcement cron: sent "${announcement.title}" (${announcement._id})`
                );
            } catch (error: any) {
                logger.error(
                    `Announcement cron: failed to send "${announcement.title}" (${announcement._id}) - ${error.message}`
                );
            }
        }
    } catch (error: any) {
        logger.error(
            `Announcement cron: failed to fetch due announcements - ${error.message}`
        );
    } finally {
        isRunning = false;
    }
}

export function startAnnouncementCron(): void {
    cron.schedule(CRON_SCHEDULE, () => {
        void processDueAnnouncements();
    });

    logger.info(`Announcement cron scheduled: "${CRON_SCHEDULE}"`);
}