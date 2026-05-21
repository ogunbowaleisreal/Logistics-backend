import Joi from "joi";

export const createRiderSchema = Joi.object({
  name: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  dailyCapacity: Joi.number().min(0).required(),
  rideType: Joi.string().valid("bike", "bus_car", "truck").required().messages({
    "any.only": "rideType must be one of: bike, bus_car, pickup, truck",
    "any.required": "rideType is required",
  }),
});

export const updateRiderSchema = Joi.object({
  riderID: Joi.string().trim().required(),
  name: Joi.string().trim().optional(),
  phone: Joi.string().trim().optional(),
  dailyCapacity: Joi.number().min(0).optional(),
  status: Joi.string().valid("active", "suspended").optional(),
  rideType: Joi.string().valid("bike", "bus_car", "truck").optional(),
});
