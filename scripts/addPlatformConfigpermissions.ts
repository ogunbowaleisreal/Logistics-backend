import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { Role, Permissions } from "../src/models/Role.Model";

// The two new permission codes we want every existing role to have.
const NEW_PERMISSION_CODES = ["GETPLATFORMCFG", "UPTPLATFORMCFG"];

function validateCodesExistInPermissionsList() {
    for (const code of NEW_PERMISSION_CODES) {
        const found = Permissions.find((p) => p.code === code);
        if (!found) {
            throw new Error(
                `Permission code "${code}" is not defined in Permissions (Role.Model.ts). Aborting.`
            );
        }
    }
}

async function addPermissionsToAllRoles() {
    const roles = await Role.find({});
    console.log(`Found ${roles.length} role(s). Checking for missing permissions...`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const role of roles) {
        try {
            const currentPermissions: string[] = Array.isArray(role.permissions)
                ? role.permissions
                : [];

            const missing = NEW_PERMISSION_CODES.filter(
                (code) => !currentPermissions.includes(code)
            );

            if (missing.length === 0) {
                skipped++;
                console.log(`  – ${role.title} (${role._id}) — already has both permissions, skipped`);
                continue;
            }

            role.permissions = [...currentPermissions, ...missing];
            await role.save();

            updated++;
            console.log(
                `  ✓ ${role.title} (${role._id}) — added: ${missing.join(", ")}`
            );
        } catch (err: any) {
            failed++;
            console.error(`  ✗ ${role.title ?? role._id} — ${err.message}`);
        }
    }

    return { updated, skipped, failed, total: roles.length };
}

async function run() {
    const uri = process.env["MONGODB_URI"];
    if (!uri) throw new Error("MONGODB_URI is not set");

    validateCodesExistInPermissionsList();

    await mongoose.connect(uri);
    console.log("Connected to database");

    const { updated, skipped, failed, total } = await addPermissionsToAllRoles();

    console.log(`\nDone. ${total} role(s) checked.`);
    console.log(`Updated: ${updated}, already up to date: ${skipped}, failed: ${failed}`);

    // NOTE: Admin documents only store a `role` ObjectId reference — they do not
    // embed a copy of permissions. So no changes to the Admins collection are
    // needed; every admin picks up the new permissions the moment their role
    // document is updated, on their next permission check / login.

    await mongoose.disconnect();
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});