
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { Business } from "../src/models/Business.Model";
import { StaffRole } from "../src/models/StaffRole.Model";
import { StaffRoleService } from "../src/services/business/StaffRole.Service";



const staffRoleService = new StaffRoleService();

async function dropStaleIndex() {
  const indexes = await StaffRole.collection.listIndexes().toArray();
  const stale = indexes.find((i) => i.name === "businessId_1_title_1");
  if (stale) {
    await StaffRole.collection.dropIndex("businessId_1_title_1");
    console.log("Dropped stale index: businessId_1_title_1");
  }
}

async function run() {
  const uri = process.env["MONGODB_URI"];
  if (!uri) throw new Error("MONGODB_URI is not set");

  await mongoose.connect(uri);
  console.log("Connected to database");

  await dropStaleIndex();

  // Step 1 — create roles for any business that somehow has none yet
  const businesses = await Business.find({}, "_id name").lean();
  console.log(`Seeding standard roles for ${businesses.length} businesses...`);

  let succeeded = 0;
  let failed = 0;
  let totalCreated = 0;
  let totalSkipped = 0;

  for (const business of businesses) {
    try {
      const { created, skipped } = await staffRoleService.seedDefaultRoles(String(business._id));
      succeeded++;
      totalCreated += created;
      totalSkipped += skipped;
      console.log(`  ✓ ${business.name} (${business._id}) — created: ${created}, skipped: ${skipped}`);
    } catch (err: any) {
      failed++;
      console.error(`  ✗ ${business.name} (${business._id}): ${err.message}`);
    }
  }

  console.log(`\nRole creation done. ${succeeded} businesses succeeded, ${failed} failed.`);
  console.log(`Roles — created: ${totalCreated}, already existed: ${totalSkipped}`);

  // Step 2 — add the new announcement permissions to EXISTING roles
  const { updated } = await staffRoleService.addPermissionsToExistingRoles({
    manager: [
      "CRTANNOUNCEMENT",
      "GETANNOUNCEMENT",
      "SENDANNOUNCEMENT",
      "RESENDANNOUNCEMENT",
      "DELANNOUNCEMENT",
    ],
    admin: [
      "CRTANNOUNCEMENT",
      "GETANNOUNCEMENT",
      "SENDANNOUNCEMENT",
      "RESENDANNOUNCEMENT",
      "DELANNOUNCEMENT",
    ],
    // deliberately omitted for customer_service — announcements aren't a
    // customer-service task by default. Add it here if you want them to have it.
  });

  console.log(`\nPermission sync done. ${updated} existing role(s) updated.`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import { Business } from "../src/models/Business.Model";
// import { StaffRole } from "../src/models/StaffRole.Model";
// import { StaffRoleService } from "../src/services/business/StaffRole.Service";

// dotenv.config();

// const staffRoleService = new StaffRoleService();

// async function dropStaleIndex() {
//   const indexes = await StaffRole.collection.listIndexes().toArray();
//   const stale = indexes.find((i) => i.name === "businessId_1_title_1");
//   if (stale) {
//     await StaffRole.collection.dropIndex("businessId_1_title_1");
//     console.log("Dropped stale index: businessId_1_title_1");
//   }
// }

// async function run() {
//   const uri = process.env["MONGODB_URI"];
//   if (!uri) throw new Error("MONGODB_URI is not set");

//   await mongoose.connect(uri);
//   console.log("Connected to database");

//   await dropStaleIndex();

//   const businesses = await Business.find({}, "_id name").lean();
//   console.log(`Seeding standard roles for ${businesses.length} businesses...`);

//   let succeeded = 0;
//   let failed = 0;
//   let totalCreated = 0;
//   let totalSkipped = 0;

//   for (const business of businesses) {
//     try {
//       const { created, skipped } = await staffRoleService.seedDefaultRoles(String(business._id));
//       succeeded++;
//       totalCreated += created;
//       totalSkipped += skipped;
//       console.log(`  ✓ ${business.name} (${business._id}) — created: ${created}, skipped: ${skipped}`);
//     } catch (err: any) {
//       failed++;
//       console.error(`  ✗ ${business.name} (${business._id}): ${err.message}`);
//     }
//   }

//   console.log(`\nDone. ${succeeded} businesses succeeded, ${failed} failed.`);
//   console.log(`Roles — created: ${totalCreated}, already existed: ${totalSkipped}`);
//   await mongoose.disconnect();
// }

// run().catch((err) => {
//   console.error(err);
//   process.exit(1);
// });
