
import dotenv from "dotenv";
dotenv.config();
import { termiiService } from "../src/utilities/Termii"; // <-- adjust path to match your project structur

// -----------------------------
// Option A: hardcode here
// -----------------------------
const RECIPIENTS: string[] = [
    "09020890424",
    // "2348098765432",
];

const MESSAGE = "This is a test sms";

// -----------------------------
// Option B: pass via CLI
//   arg[0] = message, arg[1..] = phone numbers
// -----------------------------
async function main() {
    const args = process.argv.slice(2);

    let message = MESSAGE;
    let recipients = RECIPIENTS;

    if (args.length > 0) {
        message = args[0];
        recipients = args.slice(1);
    }

    if (!message || recipients.length === 0) {
        console.error(
            "Usage: ts-node send-sms.ts \"message\" <phone1> <phone2> ...\n" +
            "Or set RECIPIENTS and MESSAGE constants in the script."
        );
        process.exit(1);
    }

    console.log(`Sending to ${recipients.length} recipient(s)...`);

    const result = await termiiService.sendBulk(recipients, message, {
        concurrency: 10,
        delayMs: 400,
    });

    console.log(`✅ Success: ${result.success}`);
    console.log(`❌ Failed: ${result.failed}`);
    if (result.errors.length > 0) {
        console.log("Failed numbers:", result.errors);
    }
}

main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});