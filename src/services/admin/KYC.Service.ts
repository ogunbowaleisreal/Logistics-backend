import { Business } from "../../models/Business.Model";
import { BusinessKYC, IBusinessKYC } from "../../models/BusinessKYC.Model";
import AppError from "../../utilities/ErrorHandler";
import { Encryption } from "../../utilities/Encryption";
import { paginateModelWithPopulate } from "../../utilities/Pagination.Helper";

type KycFieldStatus = "pending" | "verified" | "rejected";
type BusinessKycOverallStatus = "not-submitted" | "pending" | "verified";

interface KycListFilter {
  status?: KycFieldStatus;
  page?: number | string;
  limit?: number | string;
}

interface KycStatusUpdatePayload {
  status: Extract<KycFieldStatus, "verified" | "rejected">;
  rejectionReason?: string;
}

export class KYCService {
  private readonly encryption = new Encryption();

  public async listKyc(filter: KycListFilter) {
    const query: Record<string, any> = { isDeleted: false };
    const page = this.parsePositiveInt(filter.page, 1);
    const limit = this.parsePositiveInt(filter.limit, 10);

    if (filter.status) {
      query.$or = [
        { "identification.status": filter.status },
        { "cac.status": filter.status },
        { "bvn.status": filter.status },
      ];
    }

    const paginatedResult = await paginateModelWithPopulate(
      BusinessKYC,
      query,
      page,
      limit,
      { createdAt: -1 },
      { path: "businessId", select: "name email slug kycStatus" },
    );

    return {
      ...paginatedResult,
      data: paginatedResult.data.map((entry: IBusinessKYC) =>
        this.toListResponse(entry),
      ),
    };
  }

  public async getKyc(businessId: string) {
    const kyc = await BusinessKYC.findOne({
      businessId,
      isDeleted: false,
    }).populate({
      path: "businessId",
      select: "name email slug kycStatus",
    });

    if (!kyc) {
      throw new AppError(404, "KYC record not found");
    }

    return this.toResponse(kyc);
  }

  public async updateIdentificationStatus(
    businessId: string,
    body: KycStatusUpdatePayload,
  ) {
    const kyc = await this.getKycRecordOrThrow(businessId);
    this.ensureDocumentExists(kyc.identification?.document, "Identification");
    this.validateStatusUpdate(body);

    kyc.identification.status = body.status;
    kyc.identification.rejectionReason =
      body.status === "rejected" ? body.rejectionReason?.trim() : undefined;

    await kyc.save();
    await this.syncKycStatus(businessId, kyc);

    return this.toResponse(kyc);
  }

  public async updateCacStatus(
    businessId: string,
    body: KycStatusUpdatePayload,
  ) {
    const kyc = await this.getKycRecordOrThrow(businessId);
    this.ensureDocumentExists(kyc.cac?.document, "CAC");
    this.validateStatusUpdate(body);

    kyc.cac.status = body.status;
    kyc.cac.rejectionReason =
      body.status === "rejected" ? body.rejectionReason?.trim() : undefined;

    await kyc.save();
    await this.syncKycStatus(businessId, kyc);

    return this.toResponse(kyc);
  }

  private parsePositiveInt(
    value: number | string | undefined,
    fallback: number,
  ) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 1) {
      return fallback;
    }

    return Math.floor(parsed);
  }

  private async getKycRecordOrThrow(businessId: string) {
    const kyc = await BusinessKYC.findOne({
      businessId,
      isDeleted: false,
    }).populate({
      path: "businessId",
      select: "name email slug kycStatus",
    });

    if (!kyc) {
      throw new AppError(404, "KYC record not found");
    }

    return kyc;
  }

  private ensureDocumentExists(document: string | undefined, field: string) {
    if (!document) {
      throw new AppError(400, `${field} has not been submitted yet`);
    }
  }

  private validateStatusUpdate(body: KycStatusUpdatePayload) {
    if (body.status === "rejected" && !body.rejectionReason?.trim()) {
      throw new AppError(
        400,
        "rejectionReason is required when status is rejected",
      );
    }
  }

  private toListResponse(kyc: IBusinessKYC) {
    const plain = kyc.toJSON() as Record<string, any>;

    if (plain.identification?.document) {
      plain.identification.document = "[encrypted]";
    }

    if (plain.cac?.document) {
      plain.cac.document = "[encrypted]";
    }

    if (plain.bvn?.document) {
      plain.bvn.document = "[encrypted]";
    }

    return plain;
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
      kyc.bvn === "verified";

    const hasSubmission = Boolean(
      kyc.identification?.document || kyc.cac?.document || kyc.bvn,
    );

    const status: BusinessKycOverallStatus = allVerified
      ? "verified"
      : hasSubmission
        ? "pending"
        : "not-submitted";

    await Business.findByIdAndUpdate(businessId, { kycStatus: status });
  }
}
