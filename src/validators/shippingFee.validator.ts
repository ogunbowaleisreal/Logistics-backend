import Joi from "joi";

export const calculateShippingFeeSchema = Joi.object({
  distanceInKM: Joi.number().positive().optional(),
  zoneId: Joi.string().trim().optional(),
  weightKg: Joi.number().positive().optional(),
  rideType: Joi.string().valid("bike", "bus_car", "truck", "cargo").required(),
  shippingType: Joi.string()
    .valid("local", "inter-state", "international")
    .default("local"),
  destinationState: Joi.when("shippingType", {
    is: "inter-state",
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  country: Joi.when("shippingType", {
    is: "international",
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  city: Joi.when("shippingType", {
    is: "international",
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
});
