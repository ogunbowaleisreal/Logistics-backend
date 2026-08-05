import whatsAppService, {
    CreateTemplatePayload,
} from "../src/utilities/Whatsapp.Services";

// NOTE: these mirror the templates that are ALREADY approved and live
// (order_confirmation, order_status_update). Re-running this against the
// same WABA will fail with "template already exists" for a name+language
// that's already active — this script is for reproducing them elsewhere
// (new WABA, staging env, another language), not for editing the live ones.
// To edit a live template, use a POST to /{template_id} instead, which
// will reset it to PENDING review.

const ORDER_CONFIRMATION_TEMPLATE: CreateTemplatePayload = {
    name: "order_confirmation",
    language: "en", // matches "English" (not "English (US)") in Manager
    category: "UTILITY",
    components: [
        {
            type: "BODY",
            text:
                "Thanks, {{customer_name}} 🎉\n\n" +
                "Your order has been placed successfully.\n\n" +
                "Tracking ID:{{tracking_id}}\n" +
                "Amount: ₦{{amount}}\n" +
                "Status: {{order_status}}\n\n" +
                "Track your order here:\n{{tracking_link}}\n\n" +
                "Thank you for delivering with us!",
            example: {
                body_text: [[
                    "John Doe",
                    "SME-1DD2205C1",
                    "2,150",
                    "Pending",
                    "https://example.com/orders/SME-1DD2205C1",
                ]],
            },
        },
    ],
};

const ORDER_STATUS_UPDATE_TEMPLATE: CreateTemplatePayload = {
    name: "order_status_update",
    language: "en",
    category: "UTILITY",
    components: [
        {
            type: "BODY",
            text:
                "Hi {{customer_name}},\n\n" +
                "Your order is now {{order_status}}.\n\n" +
                "Tracking ID: {{tracking_id}}\n" +
                "Amount: ₦{{amount}}\n\n" +
                "View your order:\n{{tracking_link}}\n\n" +
                "Thank you for your patience!",
            example: {
                body_text: [[
                    "John Doe",
                    "In Transit",
                    "SME-1DD2205C1",
                    "2,150",
                    "https://example.com/orders/SME-1DD2205C1",
                ]],
            },
        },
    ],
};

async function createTemplate(template: CreateTemplatePayload) {
    console.log(`Creating "${template.name}"...`);
    const result = await whatsAppService.createTemplate(template);
    console.log(result);
    return result;
}

// Optional: poll instead of (or alongside) a webhook. Useful for a one-off
// script run where you don't want to wait on infra to be wired up.
async function pollStatus(name: string, attempts = 5, delayMs = 5000) {
    for (let i = 0; i < attempts; i++) {
        const res = await whatsAppService.listTemplates({ name });
        const status = res?.data?.[0]?.status;
        console.log(`[${name}] status: ${status ?? "unknown"}`);
        if (status && status !== "PENDING") return status;
        await new Promise((r) => setTimeout(r, delayMs));
    }
    console.log(`[${name}] still pending after ${attempts} checks — check Manager or wait for webhook.`);
}

async function main() {
    try {
        await createTemplate(ORDER_CONFIRMATION_TEMPLATE);
        await createTemplate(ORDER_STATUS_UPDATE_TEMPLATE);
        console.log("\n✅ Submitted. Polling status (or set up the webhook below for real-time updates)...");

        await pollStatus("order_confirmation");
        await pollStatus("order_status_update");
    } catch (err) {
        console.error("\n❌ Failed to create templates");
        console.error(err);
        process.exit(1);
    }
}

main();