/**
 * Migrate the Configuration document from the old flat serviceFee shape
 * ({ type, value }) to the new tiered shape ({ tiers, cap }).
 *
 * Run with:
 *   npx ts-node scripts/migrate-tiered-service-fee.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_TIERS = [
  { minAmount: 0,         maxAmount: 5000,   percentage: 7.5 },
  { minAmount: 5000.01,   maxAmount: 10000,  percentage: 6.5 },
  { minAmount: 10000.01,  maxAmount: 50000,  percentage: 5   },
  { minAmount: 50000.01,  maxAmount: 150000, percentage: 2.5 },
  { minAmount: 150000.01, maxAmount: null,   percentage: 1   },
];
const DEFAULT_CAP = 3000;

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in environment");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const col = mongoose.connection.db!.collection("configurations");

  const config = await col.findOne({});

  if (!config) {
    console.log("No configuration document found — inserting default.");
    await col.insertOne({
      serviceFee: { tiers: DEFAULT_TIERS, cap: DEFAULT_CAP },
      VAT: { type: "percentage", value: 7.5 },
    });
    console.log("Default configuration inserted.");
  } else if (config.serviceFee?.type !== undefined) {
    console.log("Migrating old flat serviceFee to tiered structure...");
    await col.updateOne(
      { _id: config._id },
      { $set: { "serviceFee.tiers": DEFAULT_TIERS, "serviceFee.cap": DEFAULT_CAP },
        $unset: { "serviceFee.type": "", "serviceFee.value": "" } },
    );
    console.log("Migration complete.");
  } else {
    console.log("Configuration already uses tiered structure — nothing to do.");
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
