import { Business } from "../../models/Business.Model";
import { Order } from "../../models/Order.Model";
import { Announcement } from "../../models/Announcement";
import { EmailService } from "../Email.Service";
import { termiiService } from "../../utilities/Termii";
import { AnnouncementTemplates } from "../../utilities/EmailTemplates";

export interface AnnouncementFilter {
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

export class AnnouncementService {

    private emailService = new EmailService();

    async createAnnouncement(data: {
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

        createdBy: string;
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
            status: "pending",
        }) as any;

        const shouldSendImmediately =
            !data.announcementStartAt ||
            new Date(data.announcementStartAt) <= new Date();

        if (!shouldSendImmediately) {
            return announcement;
        }

        return this.sendAnnouncement(
            announcement._id.toString()
        );
    }

    async sendAnnouncement(
        announcementId: string
    ) {

        const announcement =
            await Announcement.findById(
                announcementId
            );

        if (!announcement) {
            throw new Error(
                "Announcement not found"
            );
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


            const recipients =
                announcement.audience === "customers"
                    ? await this.getCustomerRecipients(
                        announcement.customerType as "sender" | "receiver" | "both"
                    )
                    : announcement.audience === "specific_customers"
                        ? await this.getSpecificCustomerRecipients(
                            announcement.specificCustomers || []
                        )
                        : await this.getBusinessRecipients(
                            announcement.audience,
                            announcement.specificBusinesses?.map(b => b.toString())
                        );

            if (!recipients.length) {

                announcement.status = "failed";

                await announcement.save();

                throw new Error(
                    "No recipients found"
                );
            }

            let sentCount = 0;
            let failedCount = 0;

            if (announcement.channel === "email") {

                const eligible = recipients.filter(r => r.email);

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
                failedCount = result.failed + (recipients.length - eligible.length);
            }

            if (announcement.channel === "sms") {

                const eligible = recipients.filter(r => r.phone);

                const smsMessage = AnnouncementTemplates.smsTemplate({
                    title: announcement.title,
                    message: announcement.message,
                });

                const result = await termiiService.sendBulk(
                    eligible.map(r => r.phone as string),
                    smsMessage
                );

                sentCount = result.success;
                failedCount = result.failed + (recipients.length - eligible.length);
            }

            announcement.status =
                sentCount > 0 ? "successful" : "failed";

            announcement.sentCount = sentCount;

            announcement.failedCount = failedCount;

            announcement.lastSentAt =
                new Date();

            await announcement.save();

            return announcement;

        } catch (error) {

            announcement.status = "failed";

            await announcement.save();

            throw error;
        }
    }

    async getAllAnnouncements(query: AnnouncementFilter) {

        const {
            status,
            page = 1,
            limit = 10,
            audience,
            channel,
            search,
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

        const sortObj: any = {};
        sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

        const skip = (Number(page) - 1) * Number(limit);

        const [announcements, totalCount] = await Promise.all([
            Announcement.find(filter)
                .populate("createdBy", "firstName lastName adminLevel profilePicture")
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
        announcementId: string
    ) {

        const announcement =
            await Announcement.findById(
                announcementId
            );

        if (!announcement) {
            throw new Error(
                "Announcement not found"
            );
        }

        return this.createAnnouncement({
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

    async deleteAnnouncement(announcementId: string) {

        const announcement = await Announcement.findByIdAndDelete(
            announcementId
        );

        if (!announcement) {
            throw new Error("Announcement not found");
        }

        return announcement;
    }

    // ---- Business audience resolution ----

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

            case "active_businesses":
                return { ...base, status: "active" };

            case "suspended_businesses":
                return { ...base, status: "suspended" };

            case "pending_businesses":
                return { ...base, status: "pending" };

            case "verified_email_businesses":
                return { ...base, isEmailVerified: true };

            case "unverified_email_businesses":
                return { ...base, isEmailVerified: false };

            case "kyc_verified_businesses":
                return { ...base, kycStatus: "verified" };

            case "all_businesses":
            default:
                return base;
        }
    }

    // ---- Customer audience resolution (derived from Order collection) ----

    private normalizePhone(phone?: string): string | null {
        if (!phone) return null;
        return phone.replace(/[\s\-+]/g, "");
    }

    private async getCustomerRecipients(
        customerType: "sender" | "receiver" | "both"
    ): Promise<Recipient[]> {

        const map = new Map<string, Recipient>();

        if (customerType === "sender" || customerType === "both") {

            const senders = await Order.aggregate([
                {
                    $match: {
                        "personnelInformation.sender.phone": {
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
                const key = this.normalizePhone(s.phone);
                if (!key) continue;

                const existing = map.get(key);
                map.set(key, {
                    phone: s.phone,
                    email: existing?.email || s.email || undefined,
                });
            }
        }

        if (customerType === "receiver" || customerType === "both") {

            const receivers = await Order.aggregate([
                {
                    $match: {
                        "personnelInformation.receiver.phone": {
                            $exists: true,
                            $nin: [null, ""],
                        },
                    },
                },
                {
                    $project: {
                        phone: "$personnelInformation.receiver.phone",
                    },
                },
            ]);

            for (const r of receivers) {
                const key = this.normalizePhone(r.phone);
                if (!key) continue;

                // don't clobber an email already captured for this phone via sender
                if (!map.has(key)) {
                    map.set(key, { phone: r.phone });
                }
            }
        }

        return Array.from(map.values());
    }

    private async getSpecificCustomerRecipients(
        entries: { orderId: any; type: "sender" | "receiver" }[]
    ): Promise<Recipient[]> {

        const orderIds = entries.map(e => e.orderId.toString());

        const orders = await Order.find({
            _id: { $in: orderIds },
        })
            .select("personnelInformation")
            .lean();

        const orderMap = new Map(
            orders.map(o => [o._id.toString(), o])
        );

        const map = new Map<string, Recipient>();

        for (const entry of entries) {

            const order = orderMap.get(entry.orderId.toString());

            if (!order) continue; // order not found — skip silently, doesn't block the rest

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

            const key = this.normalizePhone(contact.phone);
            if (!key) continue;

            const existing = map.get(key);
            map.set(key, {
                phone: contact.phone,
                email: existing?.email || contact.email || undefined,
            });
        }

        return Array.from(map.values());
    }
}