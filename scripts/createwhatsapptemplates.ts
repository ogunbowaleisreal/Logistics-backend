import whatsAppService, {
    CreateTemplatePayload,
} from "../src/utilities/Whatsapp.Services";

const ORDER_CONFIRMATION_TEMPLATE: CreateTemplatePayload = {
    name: "order_confirmation",
    language: "en_US",
    category: "UTILITY",
    components: [
        {
            type: "BODY",
            text:
                "Thanks, {{1}} 🎉\n\n" +
                "Your order has been placed successfully.\n\n" +
                "Tracking ID: {{2}}\n" +
                "Amount: ₦{{3}}\n" +
                "Status: {{4}}\n\n" +
                "Track your order here:\n{{5}}",
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
    language: "en_US",
    category: "UTILITY",
    components: [
        {
            type: "BODY",
            text:
                "Hi {{1}},\n\n" +
                "Your order is now *{{2}}*.\n\n" +
                "Tracking ID: {{3}}\n" +
                "Amount: ₦{{4}}\n\n" +
                "View your order:\n{{5}}",
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
}

async function main() {
    try {
        await createTemplate(ORDER_CONFIRMATION_TEMPLATE);

        await createTemplate(ORDER_STATUS_UPDATE_TEMPLATE);

        console.log("\n✅ All templates submitted.");
    } catch (err) {
        console.error("\n❌ Failed to create templates");
        console.error(err);
        process.exit(1);
    }
}

main();