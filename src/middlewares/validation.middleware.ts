import { NextFunction, Request, Response } from "express";
import Joi from "joi";

type ValidationSource = "body" | "query";

export const validate = (
  schema: Joi.ObjectSchema,
  source: ValidationSource,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((detail) =>
          detail.message.replace(/\"/g, ""),
        ),
      });
    }

    req[source] = value;
    return next();
  };
};
