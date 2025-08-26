import { redisClient } from "../config/cache";
import AppError from "../utilities/ErrorHandler";

export class CacheService {
  public async cacheVerificationOTP(email: string, verificationCode: string) {
    try {
      email = `email-verification-${email}`;
      await redisClient.setEx(email, 300, verificationCode);
      return;
    } catch (error: any) {
      throw new AppError(500, `Error Caching Data: ${error.message}`);
    }
  }

  public async getCachedVerificationOTP(email: string): Promise<string> {
    email = `email-verification-${email.toLowerCase()}`;
    const verificationCode = await redisClient.get(email);
    if (!verificationCode) throw new AppError(404, "Expired OTP");
    return verificationCode;
  }

  public async cache2FAOTP(email: string, verificationCode: string) {
    try {
      email = `2FA-${email.toLowerCase()}`;
      await redisClient.setEx(email, 300, verificationCode);
      return;
    } catch (error: any) {
      throw new AppError(500, `Error Caching Data: ${error.message}`);
    }
  }

  public async getCached2FAOTP(email: string): Promise<string> {
    email = `2FA-${email.toLowerCase()}`;
    const verificationCode = await redisClient.get(email);
    if (!verificationCode) throw new AppError(404, "Expired OTP");
    return verificationCode;
  }

  public async deleteCachedVerificationOTP(email: string) {
    const key = `email-verification-${email.toLowerCase()}`;
    try {
      await redisClient.unlink(key);
      return;
    } catch (error: any) {
      throw new AppError(500, `Error Deleting Cached Data: ${error.message}`);
    }
  }

  public async cachePasswordResetOTP(email: string, otp: string) {
    try {
      email = `password-reset-${email.toLowerCase()}`;
      await redisClient.setEx(email, 900, JSON.stringify({ otp }));
      return;
    } catch (error: any) {
      throw new AppError(500, `Error Caching Data: ${error.message}`);
    }
  }

  public async getCachedPasswordResetOTP(email: string): Promise<string> {
    email = `password-reset-${email.toLowerCase()}`;
    const cacheResponse = await redisClient.get(email);
    if (!cacheResponse) throw new AppError(404, "Expired OTP");
    return cacheResponse;
  }

  public async cacheLoginOTP(email: string, otp: string) {
    try {
      email = `login-2FA-${email.toLowerCase()}`;
      await redisClient.setEx(email, 900, JSON.stringify({ otp }));
      return;
    } catch (error: any) {
      throw new AppError(500, `Error Caching Data: ${error.message}`);
    }
  }

  public async getCachedLoginOTP(email: string): Promise<string> {
    email = `login-2FA-${email.toLowerCase()}`;
    const cacheResponse = await redisClient.get(email);
    if (!cacheResponse) throw new AppError(404, "Expired OTP");
    return cacheResponse;
  }

  public async deleteCachedPasswordResetOTP(email: string) {
    const key = `password-reset-${email.toLowerCase()}`;
    try {
      await redisClient.unlink(key);
      return;
    } catch (error: any) {
      throw new AppError(500, `Error Deleting Cached Data: ${error.message}`);
    }
  }

  ///////////////////////////////////// PASSWORD UPDATE ////////////////////////////
  public async cachePasswordUpdateOTP(accountID: string, otp: string) {
    try {
      accountID = `password-update-${accountID}`;
      await redisClient.setEx(accountID, 900, otp);
      return;
    } catch (error: any) {
      throw new AppError(500, `Error Caching Data: ${error.message}`);
    }
  }

  public async getCachedPasswordUpdateOTP(accountID: string): Promise<string> {
    accountID = `password-update-${accountID}`;
    const otp = await redisClient.get(accountID);
    if (!otp) throw new AppError(404, "Expired OTP");
    return otp;
  }

  public async deleteCachedPasswordUpdateOTP(accountID: string) {
    const key = `password-update-${accountID}`;
    try {
      await redisClient.unlink(key);
      return;
    } catch (error: any) {
      throw new AppError(500, `Error Deleting Cached Data: ${error.message}`);
    }
  }

  // public async cacheWithdrawalPINTrial(email: string, trials = "5") {
  //   try {
  //     email = `transaction-pin-${email.toLowerCase()}`;
  //     await redisClient.setEx(email, 900, trials);
  //     return;
  //   } catch (error: any) {
  //     throw new AppError(500, `Error Caching Data: ${error.message}`);
  //   }
  // }

  // public async getCacheWithdrawalPINTrial(
  //   email: string
  // ): Promise<string | null> {
  //     email = `transaction-pin-${email.toLowerCase()}`;
  //     const trials = await redisClient.get(email);
  //     if (!trials) return null;
  //     return trials;
  // }

  // public async cacheWithdrawalInfo(agentID: string, payload: any) {
  //   try {
  //     const withdrawalKey = `withdrawal-${agentID}`;
  //     await redisClient.set(withdrawalKey, JSON.stringify(payload));
  //     await redisClient.expire(withdrawalKey, 900);
  //     return;
  //   } catch (error: any) {
  //     throw new AppError(500, `Error Caching Data: ${error.message}`);
  //   }
  // }

  // public async getCachedWithdrawalInfo(agentID: string) {
  //   try {
  //     const withdrawalKey = `withdrawal-${agentID}`;
  //     const withdrawalInfo = await redisClient.get(withdrawalKey);
  //     if (!withdrawalInfo) throw new AppError(404, "Expired OTP!");
  //     return withdrawalInfo;
  //   } catch (error: any) {
  //     throw new AppError(404, `Error Getting Cached Data: ${error.message}`);
  //   }
  // }

  // public async cacheLoginOTP(email: string, otp: string) {
  //   try {
  //     email = `login-${email.toLowerCase()}`;
  //     console.log(email);
  //     await redisClient.setEx(email, 900, otp);
  //     return;
  //   } catch (error: any) {
  //     throw new AppError(500, `Error Caching Data: ${error.message}`);
  //   }
  // }

  // public async getCachedLoginOTP(email: string): Promise<string> {
  //   try {
  //     email = `login-${email.toLowerCase()}`;
  //     const otp = await redisClient.get(email);
  //     if (!otp) throw new AppError(404, "Expired OTP");
  //     return otp;
  //   } catch (error: any) {
  //     throw new AppError(404, `Error Getting Cached Data: ${error.message}`);
  //   }
  // }

  public async cacheAuthorizationToken(
    accountID: string,
    refreshToken: string
  ) {
    try {
      const duration = parseInt(process.env["JWT_REFRESH_DURATION"]!);
      await redisClient.setEx(refreshToken, duration, accountID);
      return;
    } catch (error: any) {
      throw new AppError(500, `Error Caching Data: ${error.message}`);
    }
  }

  public async getAuthorizationToken(refreshToken: string): Promise<string> {
    try {
      const refreshSecret = await redisClient.get(refreshToken);
      if (!refreshSecret) throw new AppError(404, "Expired Token");
      return refreshSecret;
    } catch (error: any) {
      throw new AppError(404, `Error Getting Cached Data: ${error.message}`);
    }
  }

  public async deleteCachedData(key: string) {
    try {
      await redisClient.unlink(key);
      return;
    } catch (error: any) {
      throw new AppError(500, `Error Deleting Cached Data: ${error.message}`);
    }
  }

  public async cachePasswordUpdateData(accountID: string, payload: string) {
    try {
      accountID = `password-update-${accountID}`;
      await redisClient.setEx(accountID, 900, payload);
      return;
    } catch (error: any) {
      throw new AppError(500, `Error Caching Data: ${error.message}`);
    }
  }

  public async getCachedPasswordUpdateData(accountID: string) {
    try {
      accountID = `password-update-${accountID}`;
      const data = await redisClient.get(accountID);
      if (!data) throw new AppError(404, "Expired OTP");
      return data;
    } catch (error: any) {
      throw new AppError(500, `Error Caching Data: ${error.message}`);
    }
  }

  // public async 
}
