import axios from "axios";
import { Business } from "../../models/Business.Model";
import { BusinessKYC, IBusinessKYC } from "../../models/BussinessKYC.Model";
import AppError from "../../utilities/ErrorHandler";
import { Encryption } from "../../utilities/Encryption";

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

    this.assertFieldSubmittable(kyc.bvn?.status, "BVN");

    kyc.bvn = {
      document: this.encryption.encrypt(body.number),
      status: "pending",
    };

    try {
      const verificationStatus = await this.verifyBvnWithProvider(body.number);
      kyc.bvn.status = verificationStatus;
    } catch {
      kyc.bvn.status = "pending";
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
