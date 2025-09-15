import { ExtendedRequest } from "../utilities/Interfaces";
import { Request, Response, NextFunction } from "express";
import { AuthenticationTokenGenerator } from "../services/Unique.Service";
// import { Account } from "../models/Account.Model";
import { Admin } from "../models/Admin.Model";

async function tokenAuthentication(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json("Unauthenticated. Please login and provide a token");
  }
  try {
    const authorizationInfo = new AuthenticationTokenGenerator().verifyToken(
      token
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
  next: NextFunction
) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json("Unauthenticated. Please login and provide a token");
  }
  try {
    const authorizationInfo = new AuthenticationTokenGenerator().verifyToken(
      token
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
  next: NextFunction
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
          "Unauthorized: Your account has been suspended please reach out to support"
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
    next: NextFunction
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

export { adminVerification, roleVerification };
