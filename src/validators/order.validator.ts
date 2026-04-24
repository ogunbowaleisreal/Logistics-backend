import Joi from "joi";

const locationSchema = Joi.object({
  address: Joi.string().trim().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
}).required();

const senderSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().trim().email().optional(),
  phone: Joi.string().trim().required(),
}).required();

const receiverSchema = Joi.object({
  name: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
}).required();

export const createOrderSchema = Joi.object({
  slug: Joi.string().trim().required(),
  orderInformation: Joi.object({
    pickupLocation: locationSchema,
    dropoffLocation: locationSchema,
    items: Joi.array().items(Joi.string().trim().required()).min(1).required(),
    numberOfItems: Joi.number().required(),
    itemWeight: Joi.number().required(),
    value: Joi.number().required(),
  }).required(),
  personnelInformation: Joi.object({
    sender: senderSchema,
    receiver: receiverSchema,
  }).required(),
  paymentMethod: Joi.string().valid("cash", "card", "bank-transfer").required(),
});

export const proofOfPaymentSchema = Joi.object({
  slug: Joi.string().trim().required(),
  orderID: Joi.string().trim().required(),
  bankID: Joi.string().trim().required(),
  proofOfPayment: Joi.string().trim().required(),
});

export const cancelOrderSchema = Joi.object({
  slug: Joi.string().trim().required(),
  orderID: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
});

export const getOrderSummarySchema = Joi.object({
  orderID: Joi.string().trim().required(),
  slug: Joi.string().trim().required(),
});

export const trackOrderSchema = Joi.object({
  trackingID: Joi.string().trim().required(),
  slug: Joi.string().trim().required(),
});

export const getMyOrdersSchema = Joi.object({
  phone: Joi.string().trim().required(),
  slug: Joi.string().trim().required(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).optional(),
});
