import mongoose from "mongoose";
import { Business } from "../../models/Business.Model";
import { Order } from "../../models/Order.Model";
import { Announcement } from "../../models/Announcement";
import { EmailService } from "../Email.Service";
import { termiiService } from "../../utilities/Termii";
import { AnnouncementTemplates } from "../../utilities/EmailTemplates";
import { PlatformConfigService } from "../../services/admin/AdminPlatformConfig.service";

export interface AnnouncementFilter {
    audience?:
    | "all_businesses"
    | "active_businesses"
    | "suspended_businesses"
    | "pending_businesses"
    | "verified_email_businesses"
    | "unverified_email_businesses"
    | "kyc_verified_businesses"
    | "customers"
    | "specific"
    | "specific_customers";

    businessId?: string; // scopes the list to one business's own announcements
    status?: "pending" | "ongoing" | "successful" | "failed";
    page?: number;
    limit?: number;
    channel?: "email" | "sms" | "push" | "inapp";
    search?: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
}

interface Recipient {
    email?: string;
    phone?: string;
}

const IMPLEMENTED_CHANNELS = ["email", "sms"] as const;
const BUSINESS_ALLOWED_AUDIENCES = ["customers", "specific_customers"] as const;

export class AnnouncementService {

    private emailService = new EmailService();
    private platformConfigService = new PlatformConfigService();

    // ================= ADMIN ENTRY POINT (unchanged behavior) =================

    async createAdminAnnouncement(data: {
        title: string;
        message: string;
        channel: "email" | "sms" | "push" | "inapp";
        audience:
        | "all_businesses"
        | "active_businesses"
        | "suspended_businesses"
        | "pending_businesses"
        | "verified_email_businesses"
        | "unverified_email_businesses"
        | "kyc_verified_businesses"
        | "customers"
        | "specific"
        | "specific_customers";
        specificBusinesses?: string[];
        customerType?: "sender" | "receiver" | "both";
        specificCustomers?: { orderId: string; type: "sender" | "receiver" }[];
        announcementStartAt?: Date;
        createdBy: string; // adminID
    }) {

        if (!IMPLEMENTED_CHANNELS.includes(data.channel as any)) {
            throw new Error(
                `The "${data.channel}" channel is not implemented yet`
            );
        }

        if (
            data.audience === "specific" &&
            (!data.specificBusinesses || !data.specificBusinesses.length)
        ) {
            throw new Error(
                "specificBusinesses is required when audience is specific"
            );
        }

        if (data.audience === "customers") {
            if (!data.customerType) {
                throw new Error(
                    "customerType (sender, receiver, or both) is required when audience is customers"
                );
            }
            if (data.channel === "email" && data.customerType === "receiver") {
                throw new Error(
                    "Email announcements cannot target receiver-only customers — receivers have no email on file. Use SMS, or target senders instead."
                );
            }
        }

        if (data.audience === "specific_customers") {
            if (!data.specificCustomers || !data.specificCustomers.length) {
                throw new Error(
                    "specificCustomers is required when audience is specific_customers"
                );
            }
            if (data.channel === "email") {
                const receiverEntries = data.specificCustomers.filter(
                    c => c.type === "receiver"
                );
                if (receiverEntries.length) {
                    throw new Error(
                        `Email announcements cannot include receiver-type entries — receivers have no email on file (order(s): ${receiverEntries
                            .map(c => c.orderId)
                            .join(", ")})`
                    );
                }
            }
        }

        const announcement = await Announcement.create({
            ...data,
            creatorType: "admin",
            createdByModel: "Admins",
            status: "pending",
        }) as any;

        const shouldSendImmediately =
            !data.announcementStartAt ||
            new Date(data.announcementStartAt) <= new Date();

        if (!shouldSendImmediately) {
            return announcement;
        }

        return this.sendAnnouncement(announcement._id.toString());
    }

    // ================= BUSINESS ENTRY POINT (new) =================

    async createBusinessAnnouncement(data: {
        title: string;
        message: string;
        channel: "email" | "sms";
        audience: "customers" | "specific_customers";
        customerType?: "sender" | "receiver" | "both";
        specificCustomers?: { orderId: string; type: "sender" | "receiver" }[];
        announcementStartAt?: Date;
        businessId: string;
        createdBy: string; // staffId or businessId
        createdByModel: "Staff" | "Business";
    }) {

        if (!IMPLEMENTED_CHANNELS.includes(data.channel as any)) {
            throw new Error(
                `The "${data.channel}" channel is not implemented yet`
            );
        }

        if (!BUSINESS_ALLOWED_AUDIENCES.includes(data.audience as any)) {
            throw new Error(
                `Businesses can only target "customers" or "specific_customers"`
            );
        }

        if (data.audience === "customers") {
            if (!data.customerType) {
                throw new Error(
                    "customerType (sender, receiver, or both) is required when audience is customers"
                );
            }
            if (data.channel === "email" && data.customerType === "receiver") {
                throw new Error(
                    "Email announcements cannot target receiver-only customers — receivers have no email on file. Use SMS, or target senders instead."
                );
            }
        }

        if (data.audience === "specific_customers") {

            if (!data.specificCustomers || !data.specificCustomers.length) {
                throw new Error(
                    "specificCustomers is required when audience is specific_customers"
                );
            }

            if (data.channel === "email") {
                const receiverEntries = data.specificCustomers.filter(
                    c => c.type === "receiver"
                );
                if (receiverEntries.length) {
                    throw new Error(
                        `Email announcements cannot include receiver-type entries — receivers have no email on file (order(s): ${receiverEntries
                            .map(c => c.orderId)
                            .join(", ")})`
                    );
                }
            }

            // Ownership check — every order referenced must belong to this business
            const orderIds = data.specificCustomers.map(c => c.orderId);
            const ownedOrders = await Order.find({
                _id: { $in: orderIds },
                businessId: data.businessId,
            }).select("_id").lean();

            const ownedIds = new Set(ownedOrders.map(o => o._id.toString()));
            const foreignIds = orderIds.filter(id => !ownedIds.has(id.toString()));

            if (foreignIds.length) {
                throw new Error(
                    `The following order(s) do not belong to your business: ${foreignIds.join(", ")}`
                );
            }
        }

        // Sanity check there's at least someone to send to before saving
        const recipients =
            data.audience === "customers"
                ? await this.getCustomerRecipients(
                    data.customerType as "sender" | "receiver" | "both",
                    data.businessId,
                    data.channel
                )
                : await this.getSpecificCustomerRecipients(
                    data.specificCustomers || [],
                    data.businessId,
                    data.channel
                );

        const eligibleCount = recipients.filter(r =>
            data.channel === "email" ? !!r.email : !!r.phone
        ).length;

        if (!eligibleCount) {
            throw new Error("No eligible recipients found for this audience");
        }

        const announcement = await Announcement.create({
            title: data.title,
            message: data.message,
            channel: data.channel,
            audience: data.audience,
            customerType: data.customerType,
            specificCustomers: data.specificCustomers,
            announcementStartAt: data.announcementStartAt,
            creatorType: "business",
            createdByModel: data.createdByModel,
            createdBy: data.createdBy,
            businessId: data.businessId,
            status: "pending",
        }) as any;

        const shouldSendImmediately =
            !data.announcementStartAt ||
            new Date(data.announcementStartAt) <= new Date();

        if (!shouldSendImmediately) {
            return announcement;
        }

        return this.sendAnnouncement(announcement._id.toString());
    }

    // ================= SEND (shared by both) =================

    async sendAnnouncement(
        announcementId: string,
        requestingBusinessId?: string // set only when a business is manually triggering — enforces ownership
    ) {

        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            throw new Error("Announcement not found");
        }

        if (
            requestingBusinessId &&
            announcement.businessId?.toString() !== requestingBusinessId
        ) {
            throw new Error("You are not authorized to send this announcement");
        }

        if (!IMPLEMENTED_CHANNELS.includes(announcement.channel as any)) {
            announcement.status = "failed";
            await announcement.save();
            throw new Error(
                `The "${announcement.channel}" channel is not implemented yet`
            );
        }

        try {

            announcement.status = "ongoing";
            await announcement.save();

            const businessId = announcement.businessId?.toString();

            const recipients: Recipient[] =
                announcement.audience === "customers"
                    ? await this.getCustomerRecipients(
                        announcement.customerType as "sender" | "receiver" | "both",
                        businessId,
                        announcement.channel as "email" | "sms"
                    )
                    : announcement.audience === "specific_customers"
                        ? await this.getSpecificCustomerRecipients(
                            announcement.specificCustomers || [],
                            businessId,
                            announcement.channel as "email" | "sms"
                        )
                        : await this.getBusinessRecipients(
                            announcement.audience,
                            announcement.specificBusinesses?.map(b => b.toString())
                        );

            if (!recipients.length) {
                announcement.status = "failed";
                await announcement.save();
                throw new Error("No recipients found");
            }

            let eligible = recipients.filter(r =>
                announcement.channel === "email" ? !!r.email : !!r.phone
            );

            let rate = 0;

            // ---- Wallet gating (business-created announcements only) ----
            if (businessId) {

                const config = await this.platformConfigService.getConfig();
                rate =
                    announcement.channel === "email"
                        ? config.announcementRates.emailRate
                        : config.announcementRates.smsRate;

                const business = await Business.findById(businessId).select("wallet");
                const balance = business?.wallet?.naira || 0;

                if (balance < rate) {
                    announcement.status = "failed";
                    announcement.failedCount = recipients.length;
                    await announcement.save();
                    throw new Error(
                        `Insufficient wallet balance. Balance: ₦${balance.toFixed(2)}, cost per message: ₦${rate.toFixed(2)}`
                    );
                }

                const affordableCount = Math.min(
                    eligible.length,
                    Math.floor(balance / rate)
                );
                eligible = eligible.slice(0, affordableCount);
            }

            let sentCount = 0;

            if (announcement.channel === "email") {

                const emails = eligible.map(r => ({
                    email: r.email as string,
                    subject: announcement.title,
                    html: AnnouncementTemplates.announcementTemplate({
                        title: announcement.title,
                        message: announcement.message,
                    }),
                }));

                const result = await this.emailService.sendBulkEmails(emails);
                sentCount = result.success;

                if (sentCount === 0 && result.errors?.length) {
                    // The provider rejected the whole batch (or every recipient) —
                    // surface the real reason instead of leaving "failed" unexplained.
                    console.error(
                        `Announcement ${announcement._id} failed to send: ${result.errors[0].error}`
                    );
                }
            }

            if (announcement.channel === "sms") {

                const smsMessage = AnnouncementTemplates.smsTemplate({
                    title: announcement.title,
                    message: announcement.message,
                });

                const result = await termiiService.sendBulk(
                    eligible.map(r => r.phone as string),
                    smsMessage
                );
                sentCount = result.success;
            }

            const failedCount = recipients.length - sentCount;

            // ---- Deduct wallet — only for messages that actually succeeded ----
            let actualCost = 0;
            if (businessId && sentCount > 0) {
                actualCost = sentCount * rate;
                await Business.updateOne(
                    { _id: businessId },
                    { $inc: { "wallet.naira": -actualCost } }
                );
            }

            announcement.status = sentCount > 0 ? "successful" : "failed";
            announcement.sentCount = sentCount;
            announcement.failedCount = failedCount;
            announcement.actualCost = actualCost;
            announcement.lastSentAt = new Date();

            await announcement.save();

            return announcement;

        } catch (error) {
            announcement.status = "failed";
            await announcement.save();
            throw error;
        }
    }

    // ================= LIST / RESEND / DELETE =================

    async getAllAnnouncements(query: AnnouncementFilter) {

        const {
            status,
            page = 1,
            limit = 10,
            audience,
            channel,
            search,
            businessId,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = query
        const filter: any = {};

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { message: { $regex: search, $options: "i" } },
            ];
        }
        if (status) filter.status = status;
        if (audience) filter.audience = audience;
        if (channel) filter.channel = channel;
        if (businessId) filter.businessId = businessId; // business only ever sees its own

        const sortObj: any = {};
        sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

        const skip = (Number(page) - 1) * Number(limit);

        const [announcements, totalCount] = await Promise.all([
            Announcement.find(filter)
                .populate("createdBy") // dynamic ref (Admin/Staff/Business) — no field restriction since shape differs per model
                .sort(sortObj)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Announcement.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalCount / Number(limit));
        const hasNext = Number(page) < totalPages;
        const hasPrev = Number(page) > 1;

        return {
            data: announcements,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalItems: totalCount,
                itemsPerPage: Number(limit),
                hasNext,
                hasPrev,
            },
        };
    }

    async resendAnnouncement(
        announcementId: string,
        requestingBusinessId?: string
    ) {

        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            throw new Error("Announcement not found");
        }

        if (
            requestingBusinessId &&
            announcement.businessId?.toString() !== requestingBusinessId
        ) {
            throw new Error("You are not authorized to resend this announcement");
        }

        if (announcement.creatorType === "business") {
            return this.createBusinessAnnouncement({
                title: announcement.title,
                message: announcement.message,
                channel: announcement.channel as "email" | "sms",
                audience: announcement.audience as "customers" | "specific_customers",
                customerType: announcement.customerType,
                specificCustomers: announcement.specificCustomers?.map(c => ({
                    orderId: c.orderId.toString(),
                    type: c.type,
                })),
                businessId: announcement.businessId!.toString(),
                createdBy: announcement.createdBy.toString(),
                createdByModel: announcement.createdByModel as "Staff" | "Business",
            });
        }

        return this.createAdminAnnouncement({
            title: announcement.title,
            message: announcement.message,
            channel: announcement.channel,
            audience: announcement.audience,
            createdBy: announcement.createdBy.toString(),
            specificBusinesses: announcement.specificBusinesses?.map(b => b.toString()),
            customerType: announcement.customerType,
            specificCustomers: announcement.specificCustomers?.map(c => ({
                orderId: c.orderId.toString(),
                type: c.type,
            })),
        });
    }

    async deleteAnnouncement(announcementId: string, requestingBusinessId?: string) {

        const query: any = { _id: announcementId };
        if (requestingBusinessId) query.businessId = requestingBusinessId;

        const announcement = await Announcement.findOneAndDelete(query);

        if (!announcement) {
            throw new Error("Announcement not found");
        }

        return announcement;
    }

    // ================= Business audience resolution (admin only) =================

    private async getBusinessRecipients(
        audience: string,
        specificBusinesses?: string[]
    ): Promise<Recipient[]> {

        let businesses;

        if (audience === "specific") {
            businesses = await Business.find({
                _id: { $in: specificBusinesses || [] },
                isDeleted: { $ne: true },
            }).select("email phone").lean();
        } else {
            businesses = await Business.find(
                this.buildAudienceQuery(audience)
            ).select("email phone").lean();
        }

        return businesses.map(b => ({ email: b.email, phone: b.phone }));
    }

    private buildAudienceQuery(audience: string) {

        const base: any = { isDeleted: { $ne: true } };

        switch (audience) {
            case "active_businesses": return { ...base, status: "active" };
            case "suspended_businesses": return { ...base, status: "suspended" };
            case "pending_businesses": return { ...base, status: "pending" };
            case "verified_email_businesses": return { ...base, isEmailVerified: true };
            case "unverified_email_businesses": return { ...base, isEmailVerified: false };
            case "kyc_verified_businesses": return { ...base, kycStatus: "verified" };
            case "all_businesses":
            default: return base;
        }
    }

    // ================= Customer audience resolution (Order-derived) =================

    private normalizePhone(phone?: string): string | null {
        if (!phone) return null;
        return phone.replace(/[\s\-+]/g, "");
    }

    /**
     * Builds the dedup key for a recipient based on the channel being sent.
     * Email announcements dedupe on email (normalized, lowercased);
     * SMS announcements dedupe on normalized phone. This must match the
     * channel, since a recipient with an email-only contact would otherwise
     * be silently dropped by a phone-based key (and vice versa for SMS).
     */
    private getContactKey(channel: "email" | "sms", value?: string): string | null {
        if (!value) return null;
        return channel === "email" ? value.trim().toLowerCase() : this.normalizePhone(value);
    }

    private async getCustomerRecipients(
        customerType: "sender" | "receiver" | "both",
        businessId: string | undefined,
        channel: "email" | "sms"
    ): Promise<Recipient[]> {

        const map = new Map<string, Recipient>();
        const businessFilter = businessId
            ? { businessId: new mongoose.Types.ObjectId(businessId) }
            : {};

        // Match on whichever contact field the channel actually needs —
        // filtering on phone unconditionally would silently drop senders
        // who have an email on file but no phone (and vice versa for sms).
        const contactField = channel === "email" ? "email" : "phone";

        if (customerType === "sender" || customerType === "both") {

            const senders = await Order.aggregate([
                {
                    $match: {
                        ...businessFilter,
                        [`personnelInformation.sender.${contactField}`]: {
                            $exists: true,
                            $nin: [null, ""],
                        },
                    },
                },
                {
                    $project: {
                        phone: "$personnelInformation.sender.phone",
                        email: "$personnelInformation.sender.email",
                    },
                },
            ]);

            for (const s of senders) {
                const key = this.getContactKey(channel, channel === "email" ? s.email : s.phone);
                if (!key) continue;

                const existing = map.get(key);
                map.set(key, {
                    phone: existing?.phone || s.phone || undefined,
                    email: existing?.email || s.email || undefined,
                });
            }
        }

        if (customerType === "receiver" || customerType === "both") {

            // Receivers have no email on file. This branch only ever
            // matters for sms — createAdminAnnouncement/
            // createBusinessAnnouncement already block email+receiver
            // upstream, but we guard here too so this method stays safe
            // to call directly.
            if (channel !== "email") {

                const receivers = await Order.aggregate([
                    {
                        $match: {
                            ...businessFilter,
                            "personnelInformation.receiver.phone": {
                                $exists: true,
                                $nin: [null, ""],
                            },
                        },
                    },
                    { $project: { phone: "$personnelInformation.receiver.phone" } },
                ]);

                for (const r of receivers) {
                    const key = this.getContactKey(channel, r.phone);
                    if (!key) continue;

                    if (!map.has(key)) {
                        map.set(key, { phone: r.phone });
                    }
                }
            }
        }

        return Array.from(map.values());
    }

    private async getSpecificCustomerRecipients(
        entries: { orderId: any; type: "sender" | "receiver" }[],
        businessId: string | undefined,
        channel: "email" | "sms"
    ): Promise<Recipient[]> {

        const orderIds = entries.map(e => e.orderId.toString());

        const query: any = { _id: { $in: orderIds } };
        if (businessId) query.businessId = businessId;

        const orders = await Order.find(query)
            .select("personnelInformation businessId")
            .lean();

        const orderMap = new Map(orders.map(o => [o._id.toString(), o]));

        const map = new Map<string, Recipient>();

        for (const entry of entries) {

            const order = orderMap.get(entry.orderId.toString());
            if (!order) continue; // not found, or belongs to a different business — skip

            const contact =
                entry.type === "sender"
                    ? {
                        phone: order.personnelInformation?.sender?.phone,
                        email: order.personnelInformation?.sender?.email,
                    }
                    : {
                        phone: order.personnelInformation?.receiver?.phone,
                        email: undefined,
                    };

            const key = this.getContactKey(channel, channel === "email" ? contact.email : contact.phone);
            if (!key) continue;

            const existing = map.get(key);
            map.set(key, {
                phone: existing?.phone || contact.phone || undefined,
                email: existing?.email || contact.email || undefined,
            });
        }

        return Array.from(map.values());
    }
}