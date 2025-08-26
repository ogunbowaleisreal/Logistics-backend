import { Document, model, Schema } from "mongoose";

interface IConfiguration extends Document {
  referralBonus: number;
  itemReward: number;
  pingRequest: number;
  __v?: number;
}

const ConfigurationSchema = new Schema<IConfiguration>(
  {
    referralBonus: { type: Number, default: 0 },
    itemReward: { type: Number, default: 0 },
    pingRequest: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const Configuration = model<IConfiguration>(
  "Configuration",
  ConfigurationSchema
);
