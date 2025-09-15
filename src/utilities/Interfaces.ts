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

export interface IOrderPayload {
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  dropoffLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  items: string[];
  numberOfItems: number;
  itemWeight: number;
  value: number;
  personnelInformation: {
    sender: {
      name: string;
      email?: string;
      phone: string;
    };
    receiver: {
      name: string;
      phone: string;
    };
  };
}
