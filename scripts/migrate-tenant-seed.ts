/**
 * One-time migration script: assign all existing tenant-scoped documents
 * to a "Platform Seed Business" so that the businessId field is populated
 * before it is made required in Phase 4.
 *
 * Run with:
 *   npx ts-node scripts/migrate-tenant-seed.ts
 *
 * Safe to run multiple times — it checks for the seed business before creating it.
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

  const db = mongoose.connection.db!;

  // 1. Find or create the seed business
  const businessesCol = db.collection("businesses");

  let seedBusiness = await businessesCol.findOne({ slug: "platform-seed" });

  if (!seedBusiness) {
    const result = await businessesCol.insertOne({
      name: "Platform Seed Business",
      slug: "platform-seed",
      email: "seed@platform.internal",
      phone: "00000000000",
      password: "MIGRATION_PLACEHOLDER",
      logo: null,
      status: "suspended",
      plan: "free",
      isEmailVerified: false,
      twoFactorAuthentication: false,
      isDeleted: true, // marked deleted so it doesn't appear in any queries
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    seedBusiness = await businessesCol.findOne({ _id: result.insertedId });
    console.log(`Created seed business with _id: ${seedBusiness!._id}`);
  } else {
    console.log(`Seed business already exists with _id: ${seedBusiness._id}`);
  }

  const businessId = seedBusiness!._id;

  // 2. Collections to migrate — all documents that lack a businessId
  const collections = [
    "orders",
    "riders",
    "banks",
    "banners",
    "faqcategories",
    "faqs",
    "configurations",
    "themes",
  ];

  for (const collectionName of collections) {
    const col = db.collection(collectionName);
    const result = await col.updateMany(
      { businessId: { $exists: false } },
      { $set: { businessId } }
    );
    console.log(
      `${collectionName}: updated ${result.modifiedCount} documents`
    );
  }

  console.log("Migration complete.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
