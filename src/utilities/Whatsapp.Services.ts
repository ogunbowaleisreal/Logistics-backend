import logger from "../../logger";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

const GRAPH_API_VERSION = process.env.WHATSAPP_API_VERSION || "v23.0";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN as string;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID as string;
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID as string;

// Scoped to the phone number — used for sending messages
const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}`;
// Scoped to the WABA — used for template management (create/list/delete)
const WABA_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}/${WABA_ID}`;

// ---- Shared types ----

export type WhatsAppResponse = {
    messaging_product: "whatsapp";
    contacts: { input: string; wa_id: string }[];
    messages: { id: string; message_status?: string }[];
} | null;

interface TemplateComponent {
    type: "header" | "body" | "button";
    sub_type?: "quick_reply" | "url";
    index?: string;
    parameters: Record<string, any>[];
}

export interface OrderConfirmationTemplateParams {
    to: string;
    customerName: string;
    orderStatus: string;
    trackingId: string;
    amount: string | number;
    trackingLink: string;
    languageCode?: string;
}

export interface OrderStatusUpdateTemplateParams {
    to: string;
    customerName: string;
    orderStatus: string;
    trackingId: string;
    amount: string | number;
    trackingLink: string;
    languageCode?: string;
}

interface InteractiveButton {
    id: string;
    title: string; // max 20 chars per WhatsApp limits
}

interface InteractiveListRow {
    id: string;
    title: string;
    description?: string;
}

interface InteractiveListSection {
    title: string;
    rows: InteractiveListRow[];
}

// ---- Template management types ----
// Note the UPPERCASE keys here — this is Meta's template *creation* spec
// (POST /{waba_id}/message_templates), which is a different shape from the
// lowercase send-message spec above. Easy thing to trip on.

interface TemplateBodyComponent {
    type: "BODY";
    text?: string; // omit for AUTHENTICATION templates — body text is fixed by Meta
    add_security_recommendation?: boolean; // AUTHENTICATION only
    example?: { body_text: string[][] };
}

interface TemplateHeaderComponent {
    type: "HEADER";
    format: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
    text?: string;
    example?: { header_text?: string[]; header_handle?: string[] };
}

interface TemplateFooterComponent {
    type: "FOOTER";
    text?: string; // free-text footer
    code_expiration_minutes?: number; // AUTHENTICATION only, 1-90
}

interface TemplateButtonsComponent {
    type: "BUTTONS";
    buttons: Array<
        | { type: "OTP"; otp_type: "COPY_CODE" | "ONE_TAP"; supported_apps?: any[] }
        | { type: "QUICK_REPLY"; text: string }
        | { type: "URL"; text: string; url: string; example?: string[] }
        | { type: "PHONE_NUMBER"; text: string; phone_number: string }
    >;
}

type TemplateCreateComponent =
    | TemplateHeaderComponent
    | TemplateBodyComponent
    | TemplateFooterComponent
    | TemplateButtonsComponent;

export interface CreateTemplatePayload {
    name: string; // lowercase, numbers, underscores only e.g. "order_status_update"
    language: string; // e.g. "en", "en_US"
    category: "AUTHENTICATION" | "UTILITY" | "MARKETING";
    components: TemplateCreateComponent[];
}

export type CreateTemplateResponse = {
    id: string;
    status: string; // e.g. "PENDING" — templates need Meta approval before use
    category: string;
} | null;

export interface ListTemplatesParams {
    limit?: number; // default 25 per Meta, max 100 per page
    name?: string; // filter by exact template name
    after?: string; // pagination cursor from paging.cursors.after
}

export type ListTemplatesResponse = {
    data: Array<{
        id: string;
        name: string;
        language: string;
        status: string;
        category: string;
        components: Record<string, any>[];
    }>;
    paging?: { cursors?: { before?: string; after?: string }; next?: string };
} | null;

export class WhatsAppService {
    /**
     * Low-level sender every public method funnels through. Keeping this
     * private and generic is what makes the class "abstract" / reusable —
     * new message types can be added as one-liners on top of this.
     */
    private async send(
        payload: Record<string, any>,
        withRecipientType = true
    ): Promise<WhatsAppResponse> {
        try {
            const response = await fetch(`${BASE_URL}/messages`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    ...(withRecipientType ? { recipient_type: "individual" } : {}),
                    ...payload,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                logger.error(`WhatsApp API error: ${JSON.stringify(data)}`);
                return null;
            }

            logger.info(`WhatsApp message sent: ${data?.messages?.[0]?.id}`);
            return data as WhatsAppResponse;
        } catch (error: any) {
            logger.error(`WhatsApp send error: ${error.message}`);
            return null;
        }
    }

    // ---- Plain text ----

    /**
     * Free-form text message. Only deliverable inside the 24-hour customer
     * service window (i.e. after the user has messaged you, or opted in).
     * Outside that window, use sendTemplateMessage instead.
     */
    async sendTextMessage(payload: {
        to: string;
        body: string;
        previewUrl?: boolean;
    }): Promise<WhatsAppResponse> {
        const { to, body, previewUrl = false } = payload;
        return this.send({
            to,
            type: "text",
            text: { preview_url: previewUrl, body },
        });
    }

    // ---- Template messages (required to open a conversation / after 24h window) ----

    /**
     * Sends a pre-approved template message. `components` follows the Cloud
     * API template component spec (header/body/button parameters) and is
     * optional for templates with no variables.
     */
    async sendTemplateMessage(payload: {
        to: string;
        templateName: string;
        languageCode?: string; // e.g. "en_US"
        components?: TemplateComponent[];
    }): Promise<WhatsAppResponse> {
        const { to, templateName, languageCode = "en_US", components = [] } = payload;
        return this.send({
            to,
            type: "template",
            template: {
                name: templateName,
                language: { code: languageCode },
                ...(components.length ? { components } : {}),
            },
        });
    }

    // ---- Media messages ----
    // Media can be referenced either by a public `link` or by a `media id`
    // obtained from the Media upload endpoint — both forms are supported here.

    async sendImageMessage(payload: {
        to: string;
        link?: string;
        mediaId?: string;
        caption?: string;
    }): Promise<WhatsAppResponse> {
        const { to, link, mediaId, caption } = payload;
        return this.send({
            to,
            type: "image",
            image: { ...(link ? { link } : { id: mediaId }), ...(caption ? { caption } : {}) },
        });
    }

    async sendDocumentMessage(payload: {
        to: string;
        link?: string;
        mediaId?: string;
        caption?: string;
        filename?: string;
    }): Promise<WhatsAppResponse> {
        const { to, link, mediaId, caption, filename } = payload;
        return this.send({
            to,
            type: "document",
            document: {
                ...(link ? { link } : { id: mediaId }),
                ...(caption ? { caption } : {}),
                ...(filename ? { filename } : {}),
            },
        });
    }

    async sendVideoMessage(payload: {
        to: string;
        link?: string;
        mediaId?: string;
        caption?: string;
    }): Promise<WhatsAppResponse> {
        const { to, link, mediaId, caption } = payload;
        return this.send({
            to,
            type: "video",
            video: { ...(link ? { link } : { id: mediaId }), ...(caption ? { caption } : {}) },
        });
    }

    async sendAudioMessage(payload: {
        to: string;
        link?: string;
        mediaId?: string;
    }): Promise<WhatsAppResponse> {
        const { to, link, mediaId } = payload;
        return this.send({
            to,
            type: "audio",
            audio: link ? { link } : { id: mediaId },
        });
    }

    async sendStickerMessage(payload: {
        to: string;
        link?: string;
        mediaId?: string;
    }): Promise<WhatsAppResponse> {
        const { to, link, mediaId } = payload;
        return this.send({
            to,
            type: "sticker",
            sticker: link ? { link } : { id: mediaId },
        });
    }

    // ---- Location ----

    async sendLocationMessage(payload: {
        to: string;
        latitude: number;
        longitude: number;
        name?: string;
        address?: string;
    }): Promise<WhatsAppResponse> {
        const { to, latitude, longitude, name, address } = payload;
        return this.send({
            to,
            type: "location",
            location: { latitude, longitude, name, address },
        });
    }

    // ---- Contacts ----

    async sendContactMessage(payload: {
        to: string;
        contacts: Record<string, any>[]; // follows Cloud API "contacts" object spec
    }): Promise<WhatsAppResponse> {
        const { to, contacts } = payload;
        return this.send({ to, type: "contacts", contacts });
    }

    // ---- Interactive messages ----

    /** Up to 3 quick-reply buttons. */
    async sendInteractiveButtonsMessage(payload: {
        to: string;
        bodyText: string;
        buttons: InteractiveButton[];
        headerText?: string;
        footerText?: string;
    }): Promise<WhatsAppResponse> {
        const { to, bodyText, buttons, headerText, footerText } = payload;
        return this.send({
            to,
            type: "interactive",
            interactive: {
                type: "button",
                ...(headerText ? { header: { type: "text", text: headerText } } : {}),
                body: { text: bodyText },
                ...(footerText ? { footer: { text: footerText } } : {}),
                action: {
                    buttons: buttons.map((b) => ({
                        type: "reply",
                        reply: { id: b.id, title: b.title },
                    })),
                },
            },
        });
    }

    /** Dropdown-style list of selectable options, grouped into sections. */
    async sendInteractiveListMessage(payload: {
        to: string;
        bodyText: string;
        buttonText: string;
        sections: InteractiveListSection[];
        headerText?: string;
        footerText?: string;
    }): Promise<WhatsAppResponse> {
        const { to, bodyText, buttonText, sections, headerText, footerText } = payload;
        return this.send({
            to,
            type: "interactive",
            interactive: {
                type: "list",
                ...(headerText ? { header: { type: "text", text: headerText } } : {}),
                body: { text: bodyText },
                ...(footerText ? { footer: { text: footerText } } : {}),
                action: { button: buttonText, sections },
            },
        });
    }

    // ---- Read receipts ----

    /** Marks an inbound message as read (blue ticks) given its wamid. */
    async markMessageAsRead(messageId: string): Promise<WhatsAppResponse> {
        return this.send(
            {
                status: "read",
                message_id: messageId,
            },
            false // read receipts don't take recipient_type / to
        );
    }

    async sendOrderConfirmationTemplate(
        payload: OrderConfirmationTemplateParams
    ): Promise<WhatsAppResponse> {
        const {
            to,
            customerName,
            orderStatus,
            trackingId,
            amount,
            trackingLink,
            languageCode = "en",
        } = payload;

        return this.sendTemplateMessage({
            to,
            templateName: "order_confirmation",
            languageCode,
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", parameter_name: "customer_name", text: customerName },
                        { type: "text", parameter_name: "order_status", text: orderStatus },
                        { type: "text", parameter_name: "tracking_id", text: trackingId },
                        { type: "text", parameter_name: "amount", text: String(amount) },
                        { type: "text", parameter_name: "tracking_link", text: trackingLink },
                    ],
                },
            ],
        });
    }

    async sendOrderStatusUpdateTemplate(
        payload: OrderStatusUpdateTemplateParams
    ): Promise<WhatsAppResponse> {
        const {
            to,
            customerName,
            orderStatus,
            trackingId,
            amount,
            trackingLink,
            languageCode = "en",
        } = payload;

        return this.sendTemplateMessage({
            to,
            templateName: "order_status_update",
            languageCode,
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", parameter_name: "customer_name", text: customerName },
                        { type: "text", parameter_name: "order_status", text: orderStatus },
                        { type: "text", parameter_name: "tracking_id", text: trackingId },
                        { type: "text", parameter_name: "amount", text: String(amount) },
                        { type: "text", parameter_name: "tracking_link", text: trackingLink },
                    ],
                },
            ],
        });
    }


    // Small helper — WhatsApp wants E.164 digits only, no leading '+'

    // ---- Template management (WABA-scoped, not phone-number-scoped) ----
    // These hit WABA_BASE_URL (`/{waba_id}/message_templates`), not BASE_URL.
    // Newly created templates start in PENDING status and are not sendable
    // via sendTemplateMessage until Meta approves them (usually minutes,
    // occasionally up to 24h). Poll listTemplates or listen for the
    // message_template_status_update webhook to know when a template is live.

    /**
     * Creates a new message template for review/approval by Meta.
     * Returns { id, status, category } on success — status will be "PENDING".
     */
    async createTemplate(
        payload: CreateTemplatePayload
    ): Promise<CreateTemplateResponse> {
        try {
            const response = await fetch(`${WABA_BASE_URL}/message_templates`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                logger.error(`WhatsApp template create error: ${JSON.stringify(data)}`);
                return null;
            }

            logger.info(`WhatsApp template created: ${payload.name} (${data?.id})`);
            return data as CreateTemplateResponse;
        } catch (error: any) {
            logger.error(`WhatsApp template create error: ${error.message}`);
            return null;
        }
    }

    /**
     * Lists templates on the WABA, optionally filtered by name and paginated.
     * Useful for checking a template's approval `status` before sending it.
     */
    async listTemplates(
        params: ListTemplatesParams = {}
    ): Promise<ListTemplatesResponse> {
        const { limit = 25, name, after } = params;
        try {
            const query = new URLSearchParams({ limit: String(limit) });
            if (name) query.set("name", name);
            if (after) query.set("after", after);

            const response = await fetch(
                `${WABA_BASE_URL}/message_templates?${query.toString()}`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                logger.error(`WhatsApp template list error: ${JSON.stringify(data)}`);
                return null;
            }

            return data as ListTemplatesResponse;
        } catch (error: any) {
            logger.error(`WhatsApp template list error: ${error.message}`);
            return null;
        }
    }

    /**
     * Deletes a template by name (deletes ALL language variants of that name).
     * Pass `templateId` as well if you only want to delete one specific
     * language/id variant instead of every language version of the name.
     */
    async deleteTemplate(
        name: string,
        templateId?: string
    ): Promise<boolean> {
        try {
            const query = new URLSearchParams({ name });
            if (templateId) query.set("hsm_id", templateId);

            const response = await fetch(
                `${WABA_BASE_URL}/message_templates?${query.toString()}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                logger.error(`WhatsApp template delete error: ${JSON.stringify(data)}`);
                return false;
            }

            logger.info(`WhatsApp template deleted: ${name}`);
            return true;
        } catch (error: any) {
            logger.error(`WhatsApp template delete error: ${error.message}`);
            return false;
        }
    }
}

export default new WhatsAppService();

// export function toWhatsAppNumber(phone: string): string {
//     return phone.replace(/[^\d]/g, "");
// }

export function toWhatsAppNumber(
    countryCode: string,
    localNumber: string
): string | null {
    const phoneNumber = parsePhoneNumberFromString(
        localNumber,
        countryCode as CountryCode
    );

    if (!phoneNumber || !phoneNumber.isValid()) {
        return null;
    }

    return phoneNumber.number.replace("+", "");
}