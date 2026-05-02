import axios from "axios";
import { Business } from "../../models/Business.Model";
import { BusinessKYC, IBusinessKYC } from "../../models/BussinessKYC.Model";
import AppError from "../../utilities/ErrorHandler";
import { Encryption } from "../../utilities/Encryption";
import { SafeHaven } from "../../utilities/SafeHaven";
import logger from "../../../logger";

type KycFieldStatus = "pending" | "verified" | "rejected";
type IdentificationType =
  | "nin"
  | "driver-license"
  | "international-passport"
  | "voters-card";
type BusinessKycOverallStatus = "not-submitted" | "pending" | "verified";

interface RegistrationPayload {
  registrationNumber: string;
  address: string;
}

interface IdentificationPayload {
  type: IdentificationType;
  document: string;
}

interface CacPayload {
  document: string;
}

interface BvnPayload {
  number: string;
}

export class KYCService {
  private readonly encryption = new Encryption();
  private readonly safeHaven = new SafeHaven();

  public async submitRegistration(
    businessId: string,
    body: RegistrationPayload,
  ) {
    const business = await this.getBusinessOrThrow(businessId);

    if (business.kycStatus === "verified") {
      throw new AppError(
        403,
        "KYC has already been verified for this business",
      );
    }

    const kyc = await this.getOrCreateKycRecord(businessId);
    kyc.registrationNumber = body.registrationNumber;
    kyc.address = body.address;

    await kyc.save();
    await this.syncKycStatus(businessId, kyc);

    return this.toResponse(kyc);
  }

  public async submitIdentification(
    businessId: string,
    body: IdentificationPayload,
  ) {
    const kyc = await this.getOrCreateKycRecord(businessId);

    this.assertFieldSubmittable(kyc.identification?.status, "Identification");

    kyc.identification = {
      type: body.type,
      document: this.encryption.encrypt(body.document),
      status: "pending",
      rejectionReason: undefined,
    };

    await kyc.save();
    await this.syncKycStatus(businessId, kyc);

    return this.toResponse(kyc);
  }

  public async submitCac(businessId: string, body: CacPayload) {
    const kyc = await this.getOrCreateKycRecord(businessId);

    this.assertFieldSubmittable(kyc.cac?.status, "CAC");

    kyc.cac = {
      document: this.encryption.encrypt(body.document),
      status: "pending",
      rejectionReason: undefined,
    };

    await kyc.save();
    await this.syncKycStatus(businessId, kyc);

    return this.toResponse(kyc);
  }

  public async submitBvn(businessId: string, body: BvnPayload) {
    const kyc = await this.getOrCreateKycRecord(businessId);
    if (kyc.bvn.status == "verified") {
      throw new AppError(
        400,
        "BVN has already been verified for this business",
      );
    }

    const verificationResponse = await this.safeHaven.initiateVerification(
      body.number,
    );
    if (verificationResponse.statusCode != 200) {
      logger.error(
        "Error initiating BVN verification:",
        verificationResponse.message,
      );
      throw new Error("Error initiating BVN verification");
    }

    kyc.bvn = {
      identityId: verificationResponse.data._id,
      document: this.encryption.encrypt(body.number),
      status: "pending",
    };

    await kyc.save();

    return this.toResponse(kyc);
  }

  public async verifyBVN(businessId: string, payload: { otp: string }) {
    const { otp } = payload;
    const kyc = await this.getOrCreateKycRecord(businessId);

    const { identityId, status } = kyc.bvn;

    if (status == "verified") {
      throw new AppError(
        400,
        "BVN has already been verified for this business",
      );
    }

    if (!identityId) {
      throw new AppError(
        400,
        "BVN verification has not been initiated for this business",
      );
    }

    const verificationResponse = await this.safeHaven.validateVerification({
      identityId,
      otp,
    });

    if (verificationResponse.statusCode == 200) {
      const status = verificationResponse.data.status;
      kyc.bvn.status = status === "SUCCESS" ? "verified" : "rejected";
    } else {
      kyc.bvn.status = "rejected";
    }

    await kyc.save();

    await this.syncKycStatus(businessId, kyc);

    return this.toResponse(kyc);
  }

  public async getKyc(businessId: string) {
    const kyc = await BusinessKYC.findOne({ businessId, isDeleted: false });

    if (!kyc) {
      throw new AppError(404, "KYC record not found");
    }

    return this.toResponse(kyc);
  }

  private async getBusinessOrThrow(businessId: string) {
    const business = await Business.findOne({
      _id: businessId,
      isDeleted: false,
    });

    if (!business) {
      throw new AppError(404, "Business not found");
    }

    return business;
  }

  private async getOrCreateKycRecord(businessId: string) {
    await this.getBusinessOrThrow(businessId);

    let kyc = await BusinessKYC.findOne({ businessId, isDeleted: false });

    if (!kyc) {
      kyc = new BusinessKYC({ businessId });
    }

    return kyc;
  }

  private assertFieldSubmittable(
    status: KycFieldStatus | undefined,
    field: string,
  ) {
    if (status === "pending" || status === "verified") {
      throw new AppError(
        403,
        `${field} has already been submitted and cannot be changed right now`,
      );
    }
  }

  private toResponse(kyc: IBusinessKYC) {
    const plain = kyc.toJSON() as Record<string, any>;

    if (plain.identification?.document) {
      plain.identification.document = this.encryption.decrypt(
        plain.identification.document,
      );
    }

    if (plain.cac?.document) {
      plain.cac.document = this.encryption.decrypt(plain.cac.document);
    }

    if (plain.bvn?.document) {
      plain.bvn.document = this.encryption.decrypt(plain.bvn.document);
    }

    return plain;
  }

  private async syncKycStatus(businessId: string, kyc: IBusinessKYC) {
    const allVerified =
      kyc.identification?.status === "verified" &&
      kyc.cac?.status === "verified" &&
      kyc.bvn?.status === "verified";

    const hasSubmission = Boolean(
      kyc.identification?.document || kyc.cac?.document || kyc.bvn?.document,
    );

    const status: BusinessKycOverallStatus = allVerified
      ? "verified"
      : hasSubmission
        ? "pending"
        : "not-submitted";

    await Business.findByIdAndUpdate(businessId, { kycStatus: status });
  }

  private async verifyBvnWithProvider(
    plainBvn: string,
  ): Promise<Extract<KycFieldStatus, "verified" | "rejected">> {
    const verificationUrl = process.env["PAYSTACK_BVN_VERIFICATION_URL"];
    const secretKey = process.env["PAYSTACK_SECRET_KEY"];

    if (!verificationUrl || !secretKey) {
      throw new Error("BVN verification provider is not configured");
    }

    const response = await axios.post(
      verificationUrl,
      { bvn: plainBvn },
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const payload = response.data?.data ?? response.data;
    const statusValue =
      payload?.status ??
      payload?.verificationStatus ??
      payload?.verification_status;

    if (typeof statusValue === "string") {
      const normalizedStatus = statusValue.toLowerCase();

      if (
        ["verified", "success", "successful", "match", "matched"].includes(
          normalizedStatus,
        )
      ) {
        return "verified";
      }
    }

    if (typeof payload?.verified === "boolean") {
      return payload.verified ? "verified" : "rejected";
    }

    if (response.data?.status === true) {
      return "verified";
    }

    return "rejected";
  }
}
