import Joi from "joi";

export const updateConfigurationSchema = Joi.object({
  pricePerKm: Joi.number().min(0).optional(),
  minimumCharge: Joi.number().min(0).optional(),
  shippingSettings: Joi.string()
    .valid("distance-based", "zone-based")
    .optional(),
  rideTypeConfig: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid("bike", "bus_car", "truck", "cargo")
          .required(),
        isEnabled: Joi.boolean().required(),
        pricePerKm: Joi.number().min(0).required(),
        baseAmount: Joi.number().min(0).required(),
      }),
    )
    .optional(),
  shippingRegion: Joi.array()
    .items(Joi.string().valid("local", "inter-state", "international"))
    .min(1)
    .optional(),
  autoAssign: Joi.boolean().optional(),
});
