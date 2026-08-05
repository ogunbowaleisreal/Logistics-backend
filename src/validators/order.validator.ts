import Joi from "joi";

const pickupLocationSchema = Joi.object({
  address: Joi.string().trim().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
}).required();

const dropoffLocationSchema = Joi.object({
  address: Joi.string().trim().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  city: Joi.string().optional(),
}).required();

const senderSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().trim().email().optional(),
  phone: Joi.string().trim().required(),
  countryCode: Joi.string().trim().optional(),
}).required();

const receiverSchema = Joi.object({
  name: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  countryCode: Joi.string().trim().optional(),
}).required();

export const createOrderSchema = Joi.object({
  slug: Joi.string().trim().required(),
  zoneId: Joi.string().trim().optional(),
  distanceInKM: Joi.number().positive().optional(),
  rideType: Joi.string().valid("bike", "bus_car", "truck", "cargo").required(),
  shippingType: Joi.string()
    .valid("local", "inter-state", "international")
    .default("local"),
  originState: Joi.when("shippingType", {
    is: "inter-state",
    then: Joi.string().trim().required(),
    otherwise: Joi.string().trim().optional(),
  }),
  orderInformation: Joi.object({
    pickupLocation: pickupLocationSchema,
    dropoffLocation: dropoffLocationSchema,
    items: Joi.array().items(Joi.string().trim().required()).min(1).required(),
    numberOfItems: Joi.number().required(),
    itemWeight: Joi.number().optional(),
    value: Joi.number().required(),
  }).required(),
  personnelInformation: Joi.object({
    sender: senderSchema,
    receiver: receiverSchema,
  }).required(),
}).custom((value, helpers) => {
  const { shippingType } = value;
  const { dropoffLocation } = value.orderInformation ?? {};

  if (shippingType === "inter-state" && !dropoffLocation?.state) {
    return helpers.error("any.invalid", {
      message: "dropoffLocation.state is required for inter-state orders",
    });
  }
  if (shippingType === "international") {
    if (!dropoffLocation?.country) {
      return helpers.error("any.invalid", {
        message: "dropoffLocation.country is required for international orders",
      });
    }
    if (!dropoffLocation?.city) {
      return helpers.error("any.invalid", {
        message: "dropoffLocation.city is required for international orders",
      });
    }
  }
  return value;
});

export const checkoutOrderSchema = Joi.object({
  orderID: Joi.string().trim().required(),
  paymentMethod: Joi.string()
    .valid("safehaven", "monnify", "flutterwave")
    .required(), // Extend with more methods as needed
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
