// import { NextFunction, Request, Response } from "express";
// import { loginWithGoogleHelper } from "../utilities/FirebaseAuhenticationHelper";

// export const loginWithGoogle = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { idToken } = req.body;

//     if (!idToken) {
//       return res.status(400).json({ error: "Missing ID token" });
//     }

//     const { email, firstname, lastname } = await loginWithGoogleHelper(idToken);
//     req.body.email = email;
//     req.body.firstname = firstname;
//     req.body.lastname = lastname;
//     return next();
//   } catch (error: any) {
//     console.error("Error verifying Google token:", error);
//     return res.status(401).json({
//       error: "Authentication failed",
//       details: error.message,
//     });
//   }
// };
