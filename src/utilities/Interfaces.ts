import { Request, Response } from "express";

export interface AccountAuthorizationHeader {
  accountID: string;
  email?: string;
  type?: string;
  username?: string;
  preferredLanguage?: string;
}

export interface AdminAuthorizationHeader {
  adminID: string;
}

export interface ExtendedRequest extends Request {
  account?: AccountAuthorizationHeader;
  admin?: AdminAuthorizationHeader;
}
