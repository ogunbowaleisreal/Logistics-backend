import jwt, { sign, verify } from "jsonwebtoken";
import AppError from "../utilities/ErrorHandler";

export class AuthenticationTokenGenerator {
  public generateToken(payload: any) {
    const pass = process.env.JWT_SECRET as string;
    const expiresIn = parseInt(process.env.JWT_DURATION as string);

    return jwt.sign(payload, pass, {
      expiresIn,
    });
  }

  public verifyToken(token: string) {
    try {
      const secret = process.env.JWT_SECRET!;
      const decoded = verify(token, secret);
      return decoded;
    } catch (error: any) {
      throw new AppError(400, "Invalid Access Token!");
    }
  }

  public generateRefreshToken(payload: any) {
    const pass = process.env.JWT_SECRET_REFRESH as string;
    const expiresIn = parseInt(process.env.JWT_REFRESH_DURATION as string);

    return jwt.sign(payload, pass, {
      expiresIn,
    });
  }

  public verifyRefreshToken(token: string): any {
    try {
      const refreshSecret = process.env.JWT_SECRET_REFRESH!;
      const decoded = verify(token, refreshSecret);
      return decoded;
    } catch (error: any) {
      throw new AppError(400, "Invalid Refresh Token!");
    }
  }

  public generateOTP(length: number): string {
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  }
}

export class PasswordGeneratorService {
  public generateTemporaryPasswordForNewAdmin(length: number): string {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()-_=+[]{}|;:,.<>?";

    const allChars = upper + lower + numbers + symbols;
    let password = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allChars.length);
      password += allChars[randomIndex];
    }

    return password;
  }
}
