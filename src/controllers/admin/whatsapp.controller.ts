import { Request, Response } from "express";
import whatsAppService, { CreateTemplatePayload } from "../../utilities/Whatsapp.Services"; // adjust path
import AppError from "../../utilities/ErrorHandler"; // adjust path to your existing AppError

/**
 * These are one-off setup calls, not something you hit on every order.
 * You'd typically call these ONCE (e.g. via a seed script, an admin route,
 * or a temporary /internal endpoint) to register the templates with Meta.
 * Once approved, you never call createTemplate again for these — you just
 * use sendTemplateMessage() per order going forward.
 */

const ORDER_CONFIRMATION_TEMPLATE: CreateTemplatePayload = {
    name: "order_confirmation",
    language: "en_US",
    category: "UTILITY",
    components: [
        {
            type: "BODY",
            text:
                "Thanks, {{1}} 🎉\nYour order has been placed successfully.\n\nTracking ID: {{2}}\nAmount: ₦{{3}}\nStatus: {{4}}",
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
                    url: "https://yourdomain.com/track/{{1}}",
                    example: ["https://yourdomain.com/track/SME-1DD2205C1"],
                },
            ],
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
            text: "Hi {{1}},\nYour order is now *{{2}}*.\n\nTracking ID: {{3}}\nAmount: ₦{{4}}",
            example: {
                body_text: [["John Doe", "in-transit", "SME-1DD2205C1", "2,150"]],
            },
        },
        {
            type: "BUTTONS",
            buttons: [
                {
                    type: "URL",
                    text: "Track Order",
                    url: "https://yourdomain.com/track/{{1}}",
                    example: ["https://yourdomain.com/track/SME-1DD2205C1"],
                },
            ],
        },
    ],
};

class WhatsAppTemplateController {
    /**
     * POST /internal/whatsapp/templates/order-confirmation
     * One-off: registers the order_confirmation template with Meta for approval.
     */
    async createOrderConfirmationTemplate(req: Request, res: Response) {
        const result = await whatsAppService.createTemplate(ORDER_CONFIRMATION_TEMPLATE);

        if (!result) {
            throw new AppError(502, "Failed to create order_confirmation template");
        }

        return res.status(201).json({
            message: "Template submitted for review",
            data: result, // { id, status: "PENDING", category }
        });
    }

    /**
     * POST /internal/whatsapp/templates/order-status-update
     * One-off: registers the order_status_update template with Meta for approval.
     */
    async createOrderStatusUpdateTemplate(req: Request, res: Response) {
        const result = await whatsAppService.createTemplate(ORDER_STATUS_UPDATE_TEMPLATE);

        if (!result) {
            throw new AppError(502, "Failed to create order_status_update template");
        }

        return res.status(201).json({
            message: "Template submitted for review",
            data: result,
        });
    }

    /**
     * GET /internal/whatsapp/templates?name=order_confirmation
     * Handy for polling approval status from the frontend/admin panel
     * instead of checking WhatsApp Manager manually.
     */
    async listTemplates(req: Request, res: Response) {
        const { name, limit, after } = req.query;

        const result = await whatsAppService.listTemplates({
            name: name as string | undefined,
            limit: limit ? Number(limit) : undefined,
            after: after as string | undefined,
        });

        if (!result) {
            throw new AppError(502, "Failed to fetch templates");
        }

        return res.status(200).json({ data: result });
    }
}

export default new WhatsAppTemplateController();