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
  type?: "platform-admin";
  role?: any;
}

export interface BusinessAuthorizationHeader {
  businessId: string;
  type: "business";
  status?: string;
  slug?: string;
}

export interface StaffAuthorizationHeader {
  staffId: string;
  businessId: string;
  type: "staff";
  role?: any;
}

export interface RiderAuthorizationHeader {
  riderId: string;
  businessId: string;
  type: "rider";
}

export interface ExtendedRequest extends Request {
  account?: AccountAuthorizationHeader;
  admin?: AdminAuthorizationHeader;
  business?: BusinessAuthorizationHeader;
  staff?: StaffAuthorizationHeader;
  rider?: RiderAuthorizationHeader;
  businessId?: string; // set by businessContext middleware on client routes
}

export interface IOrderPayload {
  slug: string;
  zoneId?: string;
  distanceInKM?: number;
  rideType?: 'bike' | 'bus_car' | 'truck';
  shippingType?: 'local' | 'inter-state' | 'international';
  originState?: string;
  orderInformation: {
    pickupLocation: {
      address: string;
      latitude: number;
      longitude: number;
    };
    dropoffLocation: {
      address: string;
      latitude: number;
      longitude: number;
      state?: string;
      country?: string;
      city?: string;
    };
    items: string[];
    numberOfItems: number;
    itemWeight: number;
    value: number;
  };
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
  // paymentMethod: "cash" | "card";
}
