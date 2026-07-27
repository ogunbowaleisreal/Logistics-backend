/**
 * emailTemplates.ts
 *
 * Central place for all LogisticsPadi transactional email HTML.
 * Every export here returns a ready-to-send HTML string.
 * Colors are pulled from the app's purple UI (dashboard, sidebar, wallet card).
 */

// ---------------------------------------------------------------------------
// Brand tokens
// ---------------------------------------------------------------------------
const COLORS = {
  primary: "#6D28D9", // deep purple - headers, buttons
  primaryDark: "#5B21B6", // gradient end
  accent: "#8B5CF6", // lighter purple - highlights, links
  accentSoft: "#EDE9FE", // pill/badge backgrounds
  bg: "#F5F3FF", // page background (lavender)
  card: "#FFFFFF",
  text: "#1F2937",
  muted: "#6B7280",
  border: "#E9E5FB",
  success: "#16A34A",
  danger: "#DC2626",
};

const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

// ---------------------------------------------------------------------------
// Shared layout wrapper — header, card, footer
// ---------------------------------------------------------------------------
function emailLayout(opts: {
  previewText?: string;
  bodyHtml: string;
}): string {
  const { previewText = "", bodyHtml } = opts;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>LogisticsPadi</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.bg};font-family:${FONT_STACK};">
  <!-- preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:${COLORS.card};border-radius:16px;overflow:hidden;box-shadow:0 4px 14px rgba(109,40,217,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%);padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <span style="display:inline-block;width:28px;height:28px;background-color:rgba(255,255,255,0.18);border-radius:8px;text-align:center;line-height:28px;font-size:15px;margin-right:10px;vertical-align:middle;">📦</span>
                    <span style="color:#FFFFFF;font-size:20px;font-weight:700;vertical-align:middle;letter-spacing:-0.3px;">Logistics<span style="color:#D8CCFB;">padi</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid ${COLORS.border};">
              <p style="margin:0 0 6px 0;font-size:12px;color:${COLORS.muted};">
                This is an automated message from LogisticsPadi. Please do not reply directly to this email.
              </p>
              <p style="margin:0;font-size:12px;color:${COLORS.muted};">
                &copy; ${new Date().getFullYear()} LogisticsPadi. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Reusable body fragments
// ---------------------------------------------------------------------------

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px 0;font-size:22px;font-weight:700;color:${COLORS.text};letter-spacing:-0.3px;">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:${COLORS.muted};">${text}</p>`;
}

function otpBox(otp: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td align="center">
        <div style="display:inline-block;background-color:${COLORS.accentSoft};border:1px solid ${COLORS.accent};border-radius:12px;padding:16px 32px;">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:${COLORS.primary};">${otp}</span>
        </div>
      </td>
    </tr>
  </table>`;
}

function expiryNote(text: string): string {
  return `<p style="margin:0 0 8px 0;font-size:13px;color:${COLORS.muted};">${text}</p>`;
}

// function ctaButton(label: string): string {
//     return `
//   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 8px 0;">
//     <tr>
//       <td align="center">
//         <span style="display:inline-block;background:linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%);color:#FFFFFF;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;">
//           ${label}
//         </span>
//       </td>
//     </tr>
//   </table>`;
// }

function ctaButton(label: string, url?: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 8px 0;">
    <tr>
      <td align="center">
        <a
          href="${url}"
          target="_blank"
          style="
            display:inline-block;
            background:linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%);
            color:#FFFFFF;
            font-size:14px;
            font-weight:600;
            padding:12px 28px;
            border-radius:10px;
            text-decoration:none;
            font-family:${FONT_STACK};
          "
        >
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

function infoTable(rows: { label: string; value: string }[]): string {
  const rowsHtml = rows
    .map(
      (r) => `
    <tr>
      <td style="padding:10px 0;font-size:13px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.border};">${r.label}</td>
      <td align="right" style="padding:10px 0;font-size:14px;font-weight:600;color:${COLORS.text};border-bottom:1px solid ${COLORS.border};">${r.value}</td>
    </tr>`
    )
    .join("");

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 8px 0;background-color:${COLORS.bg};border-radius:12px;padding:6px 18px;">
    ${rowsHtml}
  </table>`;
}

function credentialsBox(rows: { label: string; value: string }[]): string {
  const rowsHtml = rows
    .map(
      (r) => `<p style="margin:0 0 6px 0;font-size:14px;color:${COLORS.text};"><span style="color:${COLORS.muted};">${r.label}:</span> <strong>${r.value}</strong></p>`
    )
    .join("");

  return `
  <div style="background-color:${COLORS.accentSoft};border-radius:12px;padding:18px 20px;margin:20px 0;">
    ${rowsHtml}
  </div>`;
}

function statusPill(status: string): string {
  return `<span style="display:inline-block;background-color:${COLORS.accentSoft};color:${COLORS.primary};font-size:13px;font-weight:700;padding:4px 12px;border-radius:999px;">${status}</span>`;
}

// ---------------------------------------------------------------------------
// Templates — one per EmailService method
// ---------------------------------------------------------------------------

export function verificationEmailTemplate(otp: string): string {
  return emailLayout({
    previewText: "Verify your LogisticsPadi account",
    bodyHtml: `
      ${heading("Verify your account")}
      ${paragraph("Use the code below to verify your LogisticsPadi account. This helps us keep your account secure.")}
      ${otpBox(otp)}
      ${expiryNote("If you didn't request this code, you can safely ignore this email.")}
    `,
  });
}

export function passwordResetOTPTemplate(otp: string): string {
  return emailLayout({
    previewText: "Reset your LogisticsPadi password",
    bodyHtml: `
      ${heading("Reset your password")}
      ${paragraph("We received a request to update your password. Use the code below to continue.")}
      ${otpBox(otp)}
      ${expiryNote("If you didn't request a password change, please ignore this email or contact support.")}
    `,
  });
}

export function welcomeEmailTemplate(): string {
  return emailLayout({
    previewText: "Welcome to LogisticsPadi",
    bodyHtml: `
      ${heading("Welcome to LogisticsPadi 🎉")}
      ${paragraph("Your account is ready to go. You can now create orders, track deliveries in real time, and manage your logistics all in one place.")}
      ${ctaButton("Go to Dashboard")}
    `,
  });
}

export function loginOTPTemplate(otp: string): string {
  return emailLayout({
    previewText: "Your LogisticsPadi login code",
    bodyHtml: `
      ${heading("Login verification")}
      ${paragraph("Enter the code below to complete your sign-in.")}
      ${otpBox(otp)}
      ${expiryNote("Didn't try to log in? Secure your account and contact support immediately.")}
    `,
  });
}

export function adminWelcomeEmailTemplate(email: string, password: string): string {
  return emailLayout({
    previewText: "Your LogisticsPadi admin account is ready",
    bodyHtml: `
      ${heading("Welcome to LogisticsPadi")}
      ${paragraph("An admin account has been created for you. Here are your login details:")}
      ${credentialsBox([
      { label: "Email", value: email },
      { label: "Temporary Password", value: password },
    ])}
      ${paragraph("For your security, please log in and change your password as soon as possible.")}
      ${ctaButton("Log In")}
    `,
  });
}

export function businessEmailVerificationTemplate(name: string, otp: string): string {
  return emailLayout({
    previewText: "Verify your LogisticsPadi business account",
    bodyHtml: `
      ${heading(`Hi ${name},`)}
      ${paragraph("Use the code below to verify your business account and unlock full access to LogisticsPadi.")}
      ${otpBox(otp)}
      ${expiryNote("This code expires in 5 minutes.")}
    `,
  });
}

export function businessWelcomeEmailTemplate(name: string): string {
  return emailLayout({
    previewText: "Your business account is active",
    bodyHtml: `
      ${heading(`Welcome aboard, ${name} 🎉`)}
      ${paragraph("Your business account has been successfully verified and is now active. You're all set to start managing shipments, riders, and orders.")}
      ${ctaButton("Go to Dashboard")}
    `,
  });
}

export function businessLoginOTPTemplate(otp: string): string {
  return emailLayout({
    previewText: "Your business login code",
    bodyHtml: `
      ${heading("Business login verification")}
      ${paragraph("Enter the code below to complete your sign-in.")}
      ${otpBox(otp)}
      ${expiryNote("Didn't try to log in? Please secure your account and contact support.")}
    `,
  });
}

export function businessPasswordResetOTPTemplate(otp: string): string {
  return emailLayout({
    previewText: "Reset your business password",
    bodyHtml: `
      ${heading("Reset your business password")}
      ${paragraph("Use the code below to reset your password.")}
      ${otpBox(otp)}
      ${expiryNote("This code expires in 15 minutes.")}
    `,
  });
}

export function staffWelcomeEmailTemplate(
  firstname: string,
  email: string,
  password: string
): string {
  return emailLayout({
    previewText: "Welcome to the LogisticsPadi team",
    bodyHtml: `
      ${heading(`Welcome to the team, ${firstname} 👋`)}
      ${paragraph("Your staff account has been created. Here are your login details:")}
      ${credentialsBox([
      { label: "Email", value: email },
      { label: "Temporary Password", value: password },
    ])}
      ${paragraph("Please log in and change your password as soon as possible.")}
      ${ctaButton("Log In")}
    `,
  });
}

export function staffPasswordResetOTPTemplate(
  firstname: string,
  otp: string
): string {
  return emailLayout({
    previewText: "Reset your staff password",
    bodyHtml: `
      ${heading(`Hi ${firstname},`)}
      ${paragraph("Use the code below to reset your staff account password.")}
      ${otpBox(otp)}
      ${expiryNote("This code expires in 15 minutes.")}
    `,
  });
}

export function orderConfirmationTemplate(
  name: string,
  trackingID: string,
  amount: string,
  brandName: string
): string {
  return emailLayout({
    previewText: "Your order has been placed",
    bodyHtml: `
      ${heading(`Thanks, ${name} 🎉`)}
      ${paragraph("Your order has been placed successfully. Here's a quick summary:")}
      ${infoTable([
      { label: "Tracking ID", value: trackingID },
      { label: "Amount", value: amount },
    ])}
      ${ctaButton("Track Order", `https://logisticspadi.com/${brandName}/track-order/${trackingID}`)}
    `,
  });
}



export function waitlistConfirmationEmailTemplate(fullName: string): string {
  return emailLayout({
    previewText: "You're on the LogisticsPadi waitlist",
    bodyHtml: `
      ${heading(`You're on the list, ${fullName} 🎉`)}
      ${paragraph("Thank you for requesting early access to LogisticsPadi. You're officially on the waitlist — we'll notify you as soon as your spot is ready.")}
    `,
  });
}

export function orderStatusUpdateTemplate(
  name: string,
  trackingID: string,
  status: string
): string {
  return emailLayout({
    previewText: "Your order status has been updated",
    bodyHtml: `
      ${heading(`Hi ${name},`)}
      ${paragraph("Your order status has just been updated.")}
      ${infoTable([
      { label: "Tracking ID", value: trackingID },
      { label: "Status", value: statusPill(status) },
    ])}
      ${ctaButton("Track Order")}
    `,
  });
}

export function paymentReviewNotificationTemplate(
  name: string,
  trackingID: string
): string {
  return emailLayout({
    previewText: "Your proof of payment is under review",
    bodyHtml: `
      ${heading(`Hi ${name},`)}
      ${paragraph("We've received your proof of payment and it is now under review. We'll notify you as soon as it's confirmed.")}
      ${infoTable([{ label: "Tracking ID", value: trackingID }])}
    `,
  });
}

export function withdrawalSuccessEmailTemplate(
  name: string,
  amount: number,
  reference: string,
  bankSnapshot: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  }
): string {
  return emailLayout({
    previewText: "Your withdrawal was successful",
    bodyHtml: `
      ${heading(`Hi ${name},`)}
      ${paragraph("Your withdrawal request has been processed successfully. Funds will reflect in your bank account shortly.")}
      ${infoTable([
      { label: "Amount", value: `₦${amount.toLocaleString()}` },
      { label: "Reference", value: reference },
      {
        label: "Destination",
        value: `${bankSnapshot.accountName} — ${bankSnapshot.bankName} (${bankSnapshot.accountNumber})`,
      },
    ])}
      ${ctaButton("View Transactions")}
    `,
  });
}