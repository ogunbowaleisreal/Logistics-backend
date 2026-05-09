/**
 * Backfill rideType: 'bike' on all riders that predate the ride-type feature.
 *
 * Run with:
 *   npx ts-node scripts/migrate-rider-ride-type.ts
 *
 * After verifying success, set rideType to required: true in Rider.Model.ts.
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

  const result = await mongoose.connection.db!
    .collection("riders")
    .updateMany(
      { rideType: { $exists: false } },
      { $set: { rideType: "bike" } },
    );

  console.log(`Updated ${result.modifiedCount} riders`);
  console.log("Migration complete.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
