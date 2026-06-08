import {
  Configuration,
  IConfiguration,
  PaymentGateway,
} from "../../models/Configuration.Model";
import AppError from "../../utilities/ErrorHandler";

export class ConfigurationService {
  public async getConfiguration() {
    let configuration = await Configuration.findOne();
    if (!configuration) {
      configuration = await Configuration.create({});
    }
    return configuration;
  }

  public async updateConfiguration(payload: Pick<IConfiguration, "serviceFee" | "VAT" | "contactInfo">) {
    const { serviceFee, VAT, contactInfo } = payload;
    const update: Partial<Pick<IConfiguration, "serviceFee" | "VAT" | "contactInfo">> = { serviceFee, VAT };
    if (contactInfo !== undefined) update.contactInfo = contactInfo;
    const configuration = await Configuration.findOneAndUpdate(
      {},
      update,
      { new: true, upsert: true },
    );
    return configuration;
  }

  public async updatePaymentMethod(gateway: PaymentGateway, isEnabled: boolean) {
    const configuration = await this.getConfiguration();

    const entry = configuration.paymentMethods.find((m) => m.gateway === gateway);
    if (!entry) {
      throw new AppError(404, `Payment gateway "${gateway}" not found`);
    }

    entry.isEnabled = isEnabled;
    await configuration.save();
    return configuration.paymentMethods;
  }
}
