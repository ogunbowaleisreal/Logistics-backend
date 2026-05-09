/**
 * Convert legacy flat `amount` on each BusinessShippingZone to a `pricing` array
 * with a single 'bike' entry preserving the original amount, and set shippingType
 * to 'local' on zones that have no shippingType yet.
 *
 * Run with:
 *   npx ts-node scripts/migrate-zone-pricing.ts
 *
 * After verifying success, remove the `amount` field from Shippings.model.ts.
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

  const col = mongoose.connection.db!.collection("businessshippingzones");

  const zones = await col
    .find({ amount: { $exists: true }, pricing: { $exists: false } })
    .toArray();

  console.log(`Found ${zones.length} zones to migrate`);

  for (const zone of zones) {
    await col.updateOne(
      { _id: zone._id },
      {
        $set: {
          pricing: [{ rideType: "bike", amount: zone.amount }],
          shippingType: "local",
        },
      },
    );
  }

  console.log("Zone migration complete.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
