import { Router, Request, Response } from "express";
//import logger from "../logger";

const router = Router();

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN as string;

// ---- 1. Verification handshake ----
// Meta calls this once (GET) when you register the callback URL in
// App Dashboard > WhatsApp > Configuration. Echo back hub.challenge
// if the verify token matches what you set there.
router.get("/webhooks", (req: Request, res: Response) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.info("WhatsApp webhook verified");
        res.status(200).send(challenge);
    } else {
        console.error("WhatsApp webhook verification failed");
        res.sendStatus(403);
    }
});

// ---- 2. Event receiver ----
// Meta POSTs here for every subscribed field. You must subscribe to
// "message_template_status_update" (and "messages" if you also want
// inbound message events) under App Dashboard > WhatsApp > Configuration
// > Webhook fields.
router.post("/webhooks", async (req: Request, res: Response) => {
    // Always ack fast — Meta retries aggressively (and eventually disables
    // the webhook) if you don't return 200 within a few seconds.
    res.sendStatus(200);

    try {
        const entries = req.body?.entry ?? [];

        for (const entry of entries) {
            const changes = entry?.changes ?? [];

            for (const change of changes) {
                if (change.field === "message_template_status_update") {
                    const {
                        message_template_id,
                        message_template_name,
                        message_template_language,
                        event, // "APPROVED" | "REJECTED" | "PENDING_DELETION" | "PAUSED" | ...
                        reason,
                    } = change.value ?? {};

                    console.info(
                        `Template status update: ${message_template_name} (${message_template_language}) -> ${event}${reason ? ` (${reason})` : ""
                        }`
                    );

                    // TODO: persist this — e.g. update a Templates collection
                    // so the rest of your app can check approval status
                    // without hitting listTemplates every time.
                    // await Template.findOneAndUpdate(
                    //     { metaTemplateId: message_template_id },
                    //     { status: event, reason },
                    // );
                } else {
                    // Other subscribed fields (e.g. "messages") land here too
                    console.info(`Unhandled WhatsApp webhook field: ${change.field}`);
                }
            }
        }
    } catch (error: any) {
        // Already returned 200 above, so just log — don't let a parsing
        // error look like a webhook failure to Meta
        console.error(`WhatsApp webhook processing error: ${error.message}`);
    }
});

export default router;