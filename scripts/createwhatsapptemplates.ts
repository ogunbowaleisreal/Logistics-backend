import whatsAppService, {
    CreateTemplatePayload,
} from "../src/utilities/Whatsapp.Services";

// All templates below use POSITIONAL parameters ({{1}}, {{2}}...) — this
// WABA rejected named parameters ({{customer_name}}) on order_confirmation,
// so every template here uses numbers for consistency and to avoid the
// same rejection on the new ones.
//
// IMPORTANT: button URL variables are ALWAYS their own {{1}}, scoped to
// the button component — they do NOT continue numbering from the body.
// A template can have body {{1}}..{{5}} AND a button {{1}} at the same
// time; these are two separate counters.

const ORDER_CONFIRMATION_TEMPLATE: CreateTemplatePayload = {
    name: "order_confirmation",
    language: "en",
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
                "Thank you for delivering with us!",
            example: {
                body_text: [["John Doe", "SME-1DD2205C1", "2,150", "Pending"]],
            },
        },
        {
            type: "BUTTONS",
            buttons: [
                {
                    type: "URL",
                    text: "Track Order",
                    url: "https://logisticspadi.com/{{1}}",
                    example: ["jaspers-market/track-order/SME-1DD2205C1"],
                },
            ],
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
                "Hi {{1}},\n\n" +
                "Your order is now {{2}}.\n\n" +
                "Tracking ID: {{3}}\n" +
                "Amount: ₦{{4}}\n\n" +
                "Thank you for your patience!",
            example: {
                body_text: [["John Doe", "In Transit", "SME-1DD2205C1", "2,150"]],
            },
        },
        {
            type: "BUTTONS",
            buttons: [
                {
                    type: "URL",
                    text: "Track Order",
                    url: "https://logisticspadi.com/{{1}}",
                    example: ["jaspers-market/track-order/SME-1DD2205C1"],
                },
            ],
        },
    ],
};

const ORDER_APPROVED_TEMPLATE: CreateTemplatePayload = {
    name: "order_approved",
    language: "en",
    category: "UTILITY",
    components: [
        {
            type: "BODY",
            text:
                "Hello {{1}},\n\n" +
                "Your delivery order has been approved successfully.\n\n" +
                "Order Reference: {{2}}\n" +
                "Receiver: {{3}}\n" +
                "Delivery Location: {{4}}\n\n" +
                "Your order will now be prepared for processing. We will keep you updated as it progresses.\n\n" +
                "From {{5}},\nThank you",
            example: {
                body_text: [[
                    "John Doe",
                    "SME-1DD2205C1",
                    "Jane Doe",
                    "456 Dropoff Ave, Abuja",
                    "Jasper's Market",
                ]],
            },
        },
    ],
};

const ORDER_PROCESSING_TEMPLATE: CreateTemplatePayload = {
    name: "order_processing",
    language: "en",
    category: "UTILITY",
    components: [
        {
            type: "BODY",
            text:
                "Hello {{1}},\n\n" +
                "Your order is now being processed and prepared for pickup.\n\n" +
                "Order Reference: {{2}}\n" +
                "Receiver: {{3}}\n" +
                "Delivery Location: {{4}}\n\n" +
                "You will receive another update once the order is in transit.\n\n" +
                "From {{5}},\nThank you",
            example: {
                body_text: [[
                    "John Doe",
                    "SME-1DD2205C1",
                    "Jane Doe",
                    "456 Dropoff Ave, Abuja",
                    "Jasper's Market",
                ]],
            },
        },
    ],
};

const ORDER_IN_TRANSIT_TEMPLATE: CreateTemplatePayload = {
    name: "order_in_transit",
    language: "en",
    category: "UTILITY",
    components: [
        {
            type: "BODY",
            text:
                "Hello {{1}},\n\n" +
                "Your order is now in transit to the receiver.\n\n" +
                "Order Reference: {{2}}\n" +
                "Receiver: {{3}}\n" +
                "Rider: {{4}}\n\n" +
                "We will notify you once the delivery has been completed.\n\n" +
                "From {{5}},\nThank you",
            example: {
                body_text: [[
                    "John Doe",
                    "SME-1DD2205C1",
                    "Jane Doe",
                    "Samuel Rider",
                    "Jasper's Market",
                ]],
            },
        },
        {
            type: "BUTTONS",
            buttons: [
                {
                    type: "URL",
                    text: "Track Order",
                    url: "https://logisticspadi.com/{{1}}",
                    example: ["jaspers-market/track-order/SME-1DD2205C1"],
                },
                { type: "QUICK_REPLY", text: "More Options" },
            ],
        },
    ],
};

const ORDER_DELIVERED_TEMPLATE: CreateTemplatePayload = {
    name: "order_delivered",
    language: "en",
    category: "UTILITY",
    components: [
        {
            type: "BODY",
            text:
                "Hello {{1}},\n\n" +
                "Your order has been delivered successfully.\n\n" +
                "Order Reference: {{2}}\n" +
                "Receiver: {{3}}\n" +
                "Delivered At: {{4}}\n\n" +
                "From {{5}},\nThank you",
            example: {
                body_text: [[
                    "John Doe",
                    "SME-1DD2205C1",
                    "Jane Doe",
                    "Aug 5, 2026 2:15 PM",
                    "Jasper's Market",
                ]],
            },
        },
    ],
};

const DELIVERY_IN_TRANSIT_TEMPLATE: CreateTemplatePayload = {
    name: "delivery_in_transit",
    language: "en",
    category: "UTILITY",
    components: [
        {
            type: "BODY",
            text:
                "Hello {{1}},\n\n" +
                "A delivery from {{2}} is currently on its way to you.\n\n" +
                "Order Reference: {{3}}\n" +
                "Rider: {{4}}\n" +
                "Rider Phone Number: {{5}}\n\n" +
                "Please ensure that you are available to receive the delivery.\n\n" +
                "From {{6}},\nThank you",
            example: {
                body_text: [[
                    "Jane Doe",
                    "John Doe",
                    "SME-1DD2205C1",
                    "Samuel Rider",
                    "2348012345678",
                    "Jasper's Market",
                ]],
            },
        },
        {
            type: "BUTTONS",
            buttons: [
                {
                    type: "URL",
                    text: "Track Order",
                    url: "https://logisticspadi.com/{{1}}",
                    example: ["jaspers-market/track-order/SME-1DD2205C1"],
                },
                { type: "QUICK_REPLY", text: "Contact Support" },
            ],
        },
    ],
};

const DELIVERY_COMPLETED_TEMPLATE: CreateTemplatePayload = {
    name: "delivery_completed",
    language: "en",
    category: "UTILITY",
    components: [
        {
            type: "BODY",
            text:
                "Hello {{1}},\n\n" +
                "Your delivery from {{2}} has been marked as delivered successfully.\n\n" +
                "Order Reference: {{3}}\n" +
                "Delivered At: {{4}}\n\n" +
                "From {{5}},\nThank you",
            example: {
                body_text: [[
                    "Jane Doe",
                    "John Doe",
                    "SME-1DD2205C1",
                    "Aug 5, 2026 2:15 PM",
                    "Jasper's Market",
                ]],
            },
        },
    ],
};

const ALL_TEMPLATES: CreateTemplatePayload[] = [
    ORDER_CONFIRMATION_TEMPLATE,
    ORDER_STATUS_UPDATE_TEMPLATE,
    ORDER_APPROVED_TEMPLATE,
    ORDER_PROCESSING_TEMPLATE,
    ORDER_IN_TRANSIT_TEMPLATE,
    ORDER_DELIVERED_TEMPLATE,
    DELIVERY_IN_TRANSIT_TEMPLATE,
    DELIVERY_COMPLETED_TEMPLATE,
];

async function createTemplate(template: CreateTemplatePayload) {
    console.log(`Creating "${template.name}"...`);
    const result = await whatsAppService.createTemplate(template);
    console.log(result);
    return result;
}

async function main() {
    try {
        for (const template of ALL_TEMPLATES) {
            await createTemplate(template);
        }
        console.log(
            "\n✅ All templates submitted. Your webhook (message_template_status_update) " +
            "will notify you as each one gets approved/rejected — no need to poll."
        );
    } catch (err) {
        console.error("\n❌ Failed to create templates");
        console.error(err);
        process.exit(1);
    }
}

main();