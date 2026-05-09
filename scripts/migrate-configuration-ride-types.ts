/**
 * Seed rideTypeConfig on all existing BusinessConfiguration documents,
 * enabling 'bike' by default using the existing pricePerKm / minimumCharge values.
 * Also sets shippingRegion to 'local' for any config that doesn't have it yet.
 *
 * Run with:
 *   npx ts-node scripts/migrate-configuration-ride-types.ts
 *
 * Safe to run multiple times — only touches documents that are missing rideTypeConfig.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in environment");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const col = mongoose.connection.db!.collection("businessconfigurations");

  const configs = await col
    .find({ rideTypeConfig: { $exists: false } })
    .toArray();

  console.log(`Found ${configs.length} configurations to migrate`);

  for (const config of configs) {
    await col.updateOne(
      { _id: config._id },
      {
        $set: {
          rideTypeConfig: [
            {
              type: "bike",
              isEnabled: true,
              pricePerKm: config.pricePerKm ?? 0,
              baseAmount: config.minimumCharge ?? 0,
            },
          ],
          ...(config.shippingRegion === undefined && { shippingRegion: "local" }),
        },
      },
    );
  }

  console.log("Configuration migration complete.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
