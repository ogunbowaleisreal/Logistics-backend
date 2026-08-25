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
  primary: "#6D28D9",
  primaryDark: "#5B21B6",
  accent: "#8B5CF6",
  accentSoft: "#EDE9FE",
  bg: "#F5F3FF",
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
  brand?: string;   // display name (falls back to "LogisticsPadi")
  logoUrl?: string; // falls back to 📦 emoji badge if missing
}): string {
  const {
    previewText = "",
    bodyHtml,
    logoUrl,
    brand = "LogisticsPadi",
  } = opts;

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${brand}" width="28" height="28" style="display:inline-block;border-radius:8px;vertical-align:middle;margin-right:10px;object-fit:cover;" />`
    : `<span style="display:inline-block;width:28px;height:28px;background-color:rgba(255,255,255,0.18);border-radius:8px;text-align:center;line-height:28px;font-size:15px;margin-right:10px;vertical-align:middle;">📦</span>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${brand}</title>
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
                    ${logoHtml}
                    <span style="color:#FFFFFF;font-size:20px;font-weight:700;vertical-align:middle;letter-spacing:-0.3px;">${brand}</span>
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
                This is an automated message from ${brand}. Please do not reply directly to this email.
              </p>
              <p style="margin:0;font-size:12px;color:${COLORS.muted};">
                &copy; ${new Date().getFullYear()} ${brand}. All rights reserved.
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


function ctaButton(label: string, url?: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 8px 0;">
    <tr>
      <td align="center">
        
          <a href="${url ?? "#"}"
          target="_blank"
          style="
            display:inline-block;
            background-color:${COLORS.primaryDark};
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

export function verificationEmailTemplate(
  otp: string,
  brand?: string,
  logoUrl?: string
): string {
  return emailLayout({
    previewText: "Verify your account",
    bodyHtml: `
      ${heading("Verify your account")}
      ${paragraph("Use the code below to verify your account. This helps us keep your account secure.")}
      ${otpBox(otp)}
      ${expiryNote("If you didn't request this code, you can safely ignore this email.")}
    `,
    brand,
    logoUrl,
  });
}

export function passwordResetOTPTemplate(
  otp: string,
  brand?: string,
  logoUrl?: string
): string {
  return emailLayout({
    previewText: "Reset your password",
    bodyHtml: `
      ${heading("Reset your password")}
      ${paragraph("We received a request to update your password. Use the code below to continue.")}
      ${otpBox(otp)}
      ${expiryNote("If you didn't request a password change, please ignore this email or contact support.")}
    `,
    brand,
    logoUrl,
  });
}

export function welcomeEmailTemplate(
  brand?: string,
  logoUrl?: string
): string {
  return emailLayout({
    previewText: "Welcome",
    bodyHtml: `
      ${heading(`Welcome to ${brand || "LogisticsPadi"} 🎉`)}
      ${paragraph("Your account is ready to go. You can now create orders, track deliveries in real time, and manage your logistics all in one place.")}
      ${ctaButton("Go to Dashboard")}
    `,
    brand,
    logoUrl,
  });
}

export function loginOTPTemplate(
  otp: string,
  brand?: string,
  logoUrl?: string
): string {
  return emailLayout({
    previewText: "Your login code",
    bodyHtml: `
      ${heading("Login verification")}
      ${paragraph("Enter the code below to complete your sign-in.")}
      ${otpBox(otp)}
      ${expiryNote("Didn't try to log in? Secure your account and contact support immediately.")}
    `,
    brand,
    logoUrl,
  });
}

export function adminWelcomeEmailTemplate(
  email: string,
  password: string,
  brand?: string,
  logoUrl?: string
): string {
  return emailLayout({
    previewText: "Your admin account is ready",
    bodyHtml: `
      ${heading(`Welcome to ${brand || "LogisticsPadi"}`)}
      ${paragraph("An admin account has been created for you. Here are your login details:")}
      ${credentialsBox([
      { label: "Email", value: email },
      { label: "Temporary Password", value: password },
    ])}
      ${paragraph("For your security, please log in and change your password as soon as possible.")}
      ${ctaButton("Log In")}
    `,
    brand,
    logoUrl,
  });
}

export function businessEmailVerificationTemplate(
  name: string,
  otp: string,
  brand?: string,
  logoUrl?: string
): string {
  return emailLayout({
    previewText: "Verify your business account",
    bodyHtml: `
      ${heading(`Hi ${name},`)}
      ${paragraph("Use the code below to verify your business account and unlock full access.")}
      ${otpBox(otp)}
      ${expiryNote("This code expires in 5 minutes.")}
    `,
    brand,
    logoUrl,
  });
}

export function businessWelcomeEmailTemplate(
  name: string,
  brand?: string,
  logoUrl?: string
): string {
  return emailLayout({
    previewText: "Your business account is active",
    bodyHtml: `
      ${heading(`Welcome aboard, ${name} 🎉`)}
      ${paragraph("Your business account has been successfully verified and is now active. You're all set to start managing shipments, riders, and orders.")}
      ${ctaButton("Go to Dashboard")}
    `,
    brand,
    logoUrl,
  });
}

export function newBusinessRegisteredAdminTemplate(
  business: {
    name: string;
    username?: string;
    slug?: string;
    email: string;
    phone?: string;
    status: string;
    kycStatus?: string;
    authProvider?: string;
    createdAt: Date;
  },
  brand?: string,
  logoUrl?: string
): string {
  const {
    name,
    username,
    slug,
    email,
    phone,
    status,
    kycStatus,
    authProvider,
    createdAt,
  } = business;

  return emailLayout({
    previewText: `New business registered: ${name}`,
    bodyHtml: `
      ${heading(`New Business Registration`)}
      ${paragraph(`A new business just signed up on LogisticsPadi and is awaiting review.`)}
      ${detailsBox([
      { label: "Business Name", value: name },
      { label: "Username", value: username || "—" },
      { label: "Slug", value: slug || "—" },
      { label: "Email", value: email },
      { label: "Phone", value: phone || "—" },
      { label: "Auth Provider", value: authProvider || "local" },
      { label: "Status", value: status },
      { label: "KYC Status", value: kycStatus || "not-submitted" },
      { label: "Registered At", value: createdAt.toUTCString() },
    ])}
      ${paragraph("Please review this business in the admin dashboard.")}
    `,
    brand: brand || "LogisticsPadi",
    logoUrl,
  });
}

function detailsBox(
  rows: { label: string; value: string }[]
): string {
  return `
    <table cellpadding="0" cellspacing="0" style="width:100%; margin: 20px 0; border-collapse: collapse;">
      ${rows
      .map(
        (row) => `
        <tr>
          <td style="padding: 10px 14px; background:#f9fafb; border:1px solid #eee; font-size:14px; color:#666; width:40%;">
            ${row.label}
          </td>
          <td style="padding: 10px 14px; background:#fff; border:1px solid #eee; font-size:14px; color:#111; font-weight:600;">
            ${row.value}
          </td>
        </tr>
      `
      )
      .join("")}
    </table>
  `;
}

export function businessLoginOTPTemplate(
  otp: string,
  brand?: string,
  logoUrl?: string
): string {
  return emailLayout({
    previewText: "Your business login code",
    bodyHtml: `
      ${heading("Business login verification")}
      ${paragraph("Enter the code below to complete your sign-in.")}
      ${otpBox(otp)}
      ${expiryNote("Didn't try to log in? Please secure your account and contact support.")}
    `,
    brand,
    logoUrl,
  });
}

export function businessPasswordResetOTPTemplate(
  otp: string,
  brand?: string,
  logoUrl?: string
): string {
  return emailLayout({
    previewText: "Reset your business password",
    bodyHtml: `
      ${heading("Reset your business password")}
      ${paragraph("Use the code below to reset your password.")}
      ${otpBox(otp)}
      ${expiryNote("This code expires in 15 minutes.")}
    `,
    brand,
    logoUrl,
  });
}

export function staffWelcomeEmailTemplate(
  firstname: string,
  email: string,
  password: string,
  brand?: string,
  logoUrl?: string
): string {
  return emailLayout({
    previewText: "Welcome to the team",
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
    brand,
    logoUrl,
  });
}

export function staffPasswordResetOTPTemplate(
  firstname: string,
  otp: string,
  brand?: string,
  logoUrl?: string
): string {
  return emailLayout({
    previewText: "Reset your staff password",
    bodyHtml: `
      ${heading(`Hi ${firstname},`)}
      ${paragraph("Use the code below to reset your staff account password.")}
      ${otpBox(otp)}
      ${expiryNote("This code expires in 15 minutes.")}
    `,
    brand,
    logoUrl,
  });
}

export function orderConfirmationTemplate(
  name: string,
  trackingID: string,
  amount: string,
  status: string,
  brandName: string,   // slug — used only for the tracking URL
  brand?: string,        // display name
  logoUrl?: string
): string {
  return emailLayout({
    previewText: "Your order has been placed",
    bodyHtml: `
      ${heading(`Thanks, ${name} 🎉`)}
      ${paragraph("Your order has been placed successfully. Here's a quick summary:")}
      ${infoTable([
      { label: "Tracking ID", value: trackingID },
      { label: "Amount", value: amount },
      { label: "Status", value: status },
    ])}
      ${ctaButton("Track Order", `https://logisticspadi.com/${brandName}/track-order/${trackingID}`)}
    `,
    brand,
    logoUrl,
  });
}

export function orderConfirmationToBusinessTemplate(
  params: {
    trackingID: string;
    amount: string;
    shippingType: string;
    pickupLocation: string;
    dropoffLocation: string;
    zone: string;
    senderName: string;
    receiverName: string;
    businessSlug?: string; // used only for the "View Order" URL
  },
  brand?: string,
  logoUrl?: string
): string {
  const {
    trackingID,
    amount,
    shippingType,
    pickupLocation,
    dropoffLocation,
    zone,
    senderName,
    receiverName,
    businessSlug,
  } = params;

  return emailLayout({
    previewText: "A new order has been placed",
    bodyHtml: `
      ${heading(`New Order — ${brand || "LogisticsPadi"} 📦`)}
      ${paragraph("A new order has just been placed on your platform. Here are the details:")}
      ${infoTable([
      { label: "Tracking ID", value: trackingID },
      { label: "Shipping Type", value: shippingType },
      { label: "Zone", value: zone },
      { label: "Pickup Location", value: pickupLocation },
      { label: "Dropoff Location", value: dropoffLocation },
      { label: "Sender", value: senderName },
      { label: "Receiver", value: receiverName },
      { label: "Amount", value: amount },
    ])}
      ${businessSlug
        ? ctaButton(
          "Track Order",
          `https://logisticspadi.com/${businessSlug}/orders/${trackingID}`
        )
        : ""
      }
    `,
    brand,
    logoUrl,
  });
}

export function waitlistConfirmationEmailTemplate(
  fullName: string,
  brand?: string,
  logoUrl?: string
): string {
  return emailLayout({
    previewText: "You're on the waitlist",
    bodyHtml: `
      ${heading(`You're on the list, ${fullName} 🎉`)}
      ${paragraph("Thank you for requesting early access. You're officially on the waitlist — we'll notify you as soon as your spot is ready.")}
    `,
    brand,
    logoUrl,
  });
}

export function orderStatusUpdateTemplate(
  name: string,
  trackingID: string,
  status: string,
  amount: string,
  slug: string,        // slug — used only for the tracking URL
  brand?: string,       // display name
  logoUrl?: string
): string {
  return emailLayout({
    previewText: "Your order status has been updated",
    bodyHtml: `
      ${heading(`Hi ${name},`)}
      ${paragraph("Your order is now " + status.toLowerCase() + ".")}
      ${infoTable([
      { label: "Tracking ID", value: trackingID },
      { label: "Status", value: statusPill(status) },
      { label: "Amount", value: amount },
    ])}
      ${ctaButton("Track Order", `https://logisticspadi.com/${slug}/track-order/${trackingID}`)}
    `,
    brand,
    logoUrl,
  });
}

export function paymentReviewNotificationTemplate(
  name: string,
  trackingID: string,
  brand?: string,
  logoUrl?: string
): string {
  return emailLayout({
    previewText: "Your proof of payment is under review",
    bodyHtml: `
      ${heading(`Hi ${name},`)}
      ${paragraph("We've received your proof of payment and it is now under review. We'll notify you as soon as it's confirmed.")}
      ${infoTable([{ label: "Tracking ID", value: trackingID }])}
    `,
    brand,
    logoUrl,
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
  },
  brand?: string,
  logoUrl?: string
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
    brand,
    logoUrl,
  });
}
