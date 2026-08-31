import { PlatformConfig } from "../../models/PlatformConfig.model";

export class PlatformConfigService {
    async getConfig() {
        let config = await PlatformConfig.findOne({ key: "global" });
        if (!config) {
            config = await PlatformConfig.create({ key: "global" });
        }
        return config;
    }

    async updateConfig(payload: { smsRate?: number; emailRate?: number }) {
        const update: any = {};
        if (payload.smsRate !== undefined) {
            update["announcementRates.smsRate"] = payload.smsRate;
        }
        if (payload.emailRate !== undefined) {
            update["announcementRates.emailRate"] = payload.emailRate;
        }

        return PlatformConfig.findOneAndUpdate(
            { key: "global" },
            { $set: update },
            { new: true, upsert: true },
        );
    }
}