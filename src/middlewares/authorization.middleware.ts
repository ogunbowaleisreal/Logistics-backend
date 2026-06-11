import { ExtendedRequest } from "../utilities/Interfaces";
import { Request, Response, NextFunction } from "express";
import { AuthenticationTokenGenerator } from "../services/Unique.Service";
// import { Account } from "../models/Account.Model";
import { Admin } from "../models/Admin.Model";
import { Business } from "../models/Business.Model";
import { Rider } from "../models/Rider.Model";
import { Staff } from "../models/Staff.Model";
import { redisClient } from "../config/cache";

async function tokenAuthentication(
  req: Request | any,
  res: Response,
  next: NextFunction,
) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json("Unauthenticated. Please login and provide a token");
  }
  try {
    const authorizationInfo = new AuthenticationTokenGenerator().verifyToken(
      token,
    );
    req.account = authorizationInfo;
    return next();
  } catch (error: any) {
    return res.status(401).json("Unauthenticated: Invalid token");
  }
}

// async function accountVerification(
//   req: ExtendedRequest,
//   res: Response,
//   next: NextFunction
// ) {
//   return await tokenAuthentication(req, res, async () => {
//     const { accountID } = req.account!;
//     if (!req.account || !accountID) {
//       return res.status(403).json("Missing Profile: Account not found");
//     }
//     const account = await Account.findOne({ _id: accountID, isDeleted: false });
//     if (!account)
//       return res.status(403).json("Missing Profile: Account not found");
//     const { status } = account;
//     if (status == "suspended") {
//       return res
//         .status(403)
//         .json(
//           "Unauthorized: Your account has been suspended, please contact admin for more information"
//         );
//     }
//     req.account.email = account.email;
//     return next();
//   });
// }

//////////////////////////////////// ADMIN AUTHORIZATION /////////////////////////////////
async function adminTokenAuthentication(
  req: Request | any,
  res: Response,
  next: NextFunction,
) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json("Unauthenticated. Please login and provide a token");
  }
  try {
    const authorizationInfo = new AuthenticationTokenGenerator().verifyToken(
      token,
    );
    req.admin = authorizationInfo;
    return next();
  } catch (error: any) {
    return res.status(401).json("Unauthenticated: Invalid token");
  }
}

async function adminVerification(
  req: Request | any,
  res: Response,
  next: NextFunction,
) {
  return await adminTokenAuthentication(req, res, async () => {
    const { adminID } = req.admin;
    if (!req.admin || !adminID)
      return res.status(403).json("Unauthorized: User not found");
    const admin = await Admin.findOne({ _id: adminID }).populate("role");
    if (!admin) {
      return res.status(403).json("Unauthorized: Admin record not found");
    }
    const { status, role } = admin;
    if (status === "suspended") {
      return res
        .status(403)
        .json(
          "Unauthorized: Your account has been suspended please reach out to support",
        );
    }
    req.admin = { adminID, role };
    return next();
  });
}

function roleVerification(requiredPermission: string) {
  return async function adminTokenVerification(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ) {
    return await adminVerification(req, res, async () => {
      const { role } = req.admin;
      const { permissions } = role;
      for (let permission of permissions) {
        if (permission === requiredPermission) {
          return next();
        }
      }

      return res
        .status(403)
        .json("Unauthorized: Admin not allowed to perform this action");
    });
  };
}

///////////////////////////////// BUSINESS AUTHORIZATION ////////////////////////////////
async function businessTokenAuthentication(
  req: Request | any,
  res: Response,
  next: NextFunction,
) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json("Unauthenticated. Please login and provide a token");
  }
  try {
    const decoded = new AuthenticationTokenGenerator().verifyToken(
      token,
    ) as any;
    if (decoded.type !== "business") {
      return res.status(401).json("Unauthenticated: Invalid token type");
    }
    req.business = decoded;
    return next();
  } catch (error: any) {
    return res.status(401).json("Unauthenticated: Invalid token");
  }
}

async function businessVerification(
  req: Request | any,
  res: Response,
  next: NextFunction,
) {
  return await businessTokenAuthentication(req, res, async () => {
    const { businessId } = req.business;
    if (!businessId)
      return res.status(403).json("Unauthorized: Business not found");

    const business = await Business.findOne({
      _id: businessId,
      isDeleted: false,
    });
    if (!business)
      return res.status(403).json("Unauthorized: Business record not found");

    if (business.status === "suspended") {
      return res
        .status(403)
        .json(
          "Unauthorized: Your account has been suspended, please contact support",
        );
    }

    req.business = {
      businessId,
      type: "business",
      status: business.status,
      slug: business.slug,
    };
    return next();
  });
}

/////////////////////////////////// STAFF AUTHORIZATION /////////////////////////////////
async function staffTokenAuthentication(
  req: Request | any,
  res: Response,
  next: NextFunction,
) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json("Unauthenticated. Please login and provide a token");
  }
  try {
    const decoded = new AuthenticationTokenGenerator().verifyToken(
      token,
    ) as any;
    if (decoded.type !== "staff") {
      return res.status(401).json("Unauthenticated: Invalid token type");
    }
    req.staff = decoded;
    return next();
  } catch (error: any) {
    return res.status(401).json("Unauthenticated: Invalid token");
  }
}

async function staffVerification(
  req: Request | any,
  res: Response,
  next: NextFunction,
) {
  return await staffTokenAuthentication(req, res, async () => {
    const { staffId, businessId } = req.staff;
    if (!staffId || !businessId)
      return res.status(403).json("Unauthorized: Staff not found");

    const staff = await Staff.findOne({
      _id: staffId,
      businessId,
      isDeleted: false,
    }).populate("role");
    if (!staff)
      return res.status(403).json("Unauthorized: Staff record not found");

    if (staff.status === "suspended") {
      return res
        .status(403)
        .json(
          "Unauthorized: Your account has been suspended, please contact your administrator",
        );
    }

    req.staff = { staffId, businessId, type: "staff", role: staff.role };
    return next();
  });
}

/////////////////////////////////// RIDER AUTHORIZATION /////////////////////////////////
async function riderTokenAuthentication(
  req: Request | any,
  res: Response,
  next: NextFunction,
) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json("Unauthenticated. Please login and provide a token");
  }

  try {
    const decoded = new AuthenticationTokenGenerator().verifyToken(
      token,
    ) as any;
    if (decoded.type !== "rider") {
      return res.status(401).json("Unauthenticated: Invalid token type");
    }

    req.rider = decoded;
    return next();
  } catch (error: any) {
    return res.status(401).json("Unauthenticated: Invalid token");
  }
}

async function riderVerification(
  req: Request | any,
  res: Response,
  next: NextFunction,
) {
  return await riderTokenAuthentication(req, res, async () => {
    const { riderId, businessId } = req.rider;

    if (!riderId || !businessId) {
      return res.status(403).json("Unauthorized: Rider not found");
    }

    const rider = await Rider.findOne({
      _id: riderId,
      businessId,
      isDeleted: false,
    });

    if (!rider) {
      return res.status(401).json("Unauthorized: Rider record not found");
    }

    if (rider.status === "suspended") {
      return res
        .status(403)
        .json("Unauthorized: Your account has been suspended");
    }

    req.rider = { riderId, businessId, type: "rider" };
    return next();
  });
}

function staffRoleVerification(permission: string) {
  return async function staffTokenVerification(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ) {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json("Unauthenticated. Please login and provide a token");
    }

    let decoded: any;
    try {
      decoded = new AuthenticationTokenGenerator().verifyToken(token);
    } catch {
      return res.status(401).json("Unauthenticated: Invalid token");
    }

    if (decoded.type === "business") {
      return businessVerification(req, res, next);
    }

    if (decoded.type === "staff") {
      return staffVerification(req, res, async () => {
        const { role } = req.staff;
        const { permissions } = role;
        for (const p of permissions) {
          if (p === permission) return next();
        }
        return res
          .status(403)
          .json("Unauthorized: Staff not allowed to perform this action");
      });
    }

    return res.status(401).json("Unauthenticated: Invalid token type");
  };
}

async function businessContext(
  req: Request | any,
  res: Response,
  next: NextFunction,
) {
  try {
    const slugHeader = req.headers["x-business-slug"];
    const slug = Array.isArray(slugHeader) ? slugHeader[0] : slugHeader;

    if (!slug || typeof slug !== "string") {
      return res
        .status(400)
        .json("Business context missing: x-business-slug is required");
    }

    const businessId = await resolveBusinessIdFromSlug(slug);

    req.businessId = businessId;
    req.body.slug = slug;
    return next();
  } catch (error: any) {
    return res
      .status(500)
      .json(error.message || "Unable to resolve business context");
  }
}

async function resolveBusinessIdFromSlug(slug: string): Promise<string> {
  const normalizedSlug = slug.toLowerCase();
  const cacheKey = `slug:${normalizedSlug}`;
  let businessId: string | null = await redisClient.get(cacheKey);

  if (!businessId) {
    const business = await Business.findOne({
      slug: normalizedSlug,
      status: "active",
      isDeleted: false,
    });

    if (!business) {
      throw new Error("Business not found");
    }

    const resolvedBusinessId = business.id;
    await redisClient.setEx(cacheKey, 3600, resolvedBusinessId);
    businessId = resolvedBusinessId;
  }

  if (!businessId) {
    throw new Error("Business not found");
  }

  return businessId;
}

async function bodyBusinessContext(
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { slug } = req.body;

    if (!slug || typeof slug !== "string") {
      return res
        .status(400)
        .json("Business context missing: body.slug is required");
    }

    req.businessId = await resolveBusinessIdFromSlug(slug);
    req.body.slug = slug;
    return next();
  } catch (error: any) {
    const statusCode = error.message === "Business not found" ? 404 : 500;
    return res
      .status(statusCode)
      .json(error.message || "Unable to resolve business context");
  }
}

async function queryBusinessContext(
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const slugValue = req.query.slug;
    const slug = Array.isArray(slugValue) ? slugValue[0] : slugValue;

    if (!slug || typeof slug !== "string") {
      return res
        .status(400)
        .json("Business context missing: query.slug is required");
    }

    req.businessId = await resolveBusinessIdFromSlug(slug);
    return next();
  } catch (error: any) {
    const statusCode = error.message === "Business not found" ? 404 : 500;
    return res
      .status(statusCode)
      .json(error.message || "Unable to resolve business context");
  }
}

export {
  adminVerification,
  roleVerification,
  businessTokenAuthentication,
  businessVerification,
  staffTokenAuthentication,
  staffVerification,
  riderVerification,
  staffRoleVerification,
  businessContext,
  bodyBusinessContext,
  queryBusinessContext,
  resolveBusinessIdFromSlug,
};
