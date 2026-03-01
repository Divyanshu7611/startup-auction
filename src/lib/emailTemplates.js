/**
 * HTML and plain-text email templates for transactional emails.
 * Uses inline styles for maximum email client compatibility.
 */

const BRAND = {
  gold: "#c8993a",
  goldLight: "#e8bf72",
  violet: "#4a3fbd",
  ink: "#0d0f1a",
  inkMuted: "#7b7f96",
  white: "#ffffff",
};

/**
 * Registration confirmation email template.
 * @param {{ captain_name: string, team_name: string, captain_email: string }} data
 * @returns {{ html: string, text: string, subject: string }}
 */
export function getRegistrationEmail(data) {
  const { captain_name, team_name, captain_email } = data;
  const subject = "Team registration confirmed – Startup Auction";

  const text = [
    `Hi ${captain_name},`,
    "",
    `Your team "${team_name}" has been successfully registered for Startup Auction (Training and Placement Cell).`,
    "",
    "Next steps:",
    "• Complete payment when prompted to confirm your participation.",
    "• Keep this email for your records.",
    "",
    `Registered email: ${captain_email}`,
    "",
    "— Startup Auction, Training and Placement Cell",
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f0f5; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #0d0f1a 0%, #1a1a2e 50%, #16213e 100%); min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; margin: 0 auto;">
          <!-- Header bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, ${BRAND.gold}, ${BRAND.goldLight}, ${BRAND.gold}); border-radius: 0 0 6px 6px;"></td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background-color: ${BRAND.white}; border-radius: 16px; box-shadow: 0 24px 48px rgba(0,0,0,0.2); overflow: hidden;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <!-- Logo / Title -->
                <tr>
                  <td style="padding: 32px 40px 24px; text-align: center;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: ${BRAND.ink}; letter-spacing: -0.02em;">
                      🚀 Startup Auction
                    </h1>
                    <p style="margin: 6px 0 0; font-size: 13px; color: ${BRAND.inkMuted}; font-weight: 500;">
                      Training and Placement Cell
                    </p>
                  </td>
                </tr>
                <!-- Success badge -->
                <tr>
                  <td style="padding: 0 40px 20px; text-align: center;">
                    <span style="display: inline-block; padding: 8px 16px; background: rgba(26, 138, 110, 0.12); color: #1a8a6e; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; border-radius: 8px;">
                      ✓ Registration confirmed
                    </span>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 0 40px 28px;">
                    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${BRAND.ink};">
                      Hi <strong>${escapeHtml(captain_name)}</strong>,
                    </p>
                    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.65; color: ${BRAND.ink};">
                      Your team <strong style="color: ${BRAND.gold};">${escapeHtml(team_name)}</strong> has been successfully registered for Startup Auction.
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #f7f7fb; border-radius: 12px; border: 1px solid #eeeef6;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <p style="margin: 0 0 6px; font-size: 11px; font-weight: 600; color: ${BRAND.inkMuted}; text-transform: uppercase; letter-spacing: 0.04em;">Registered email</p>
                          <p style="margin: 0; font-size: 14px; color: ${BRAND.ink}; font-weight: 500;">${escapeHtml(captain_email)}</p>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: ${BRAND.inkMuted};">
                      <strong style="color: ${BRAND.ink};">Next step:</strong> Complete payment when prompted to confirm your participation.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px 32px; border-top: 1px solid #eeeef6; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: ${BRAND.inkMuted};">
                      Startup Auction · Training and Placement Cell
                    </p>
                    <p style="margin: 6px 0 0; font-size: 11px; color: #aaa;">
                      This is an automated message. Please do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html, text };
}

function escapeHtml(str) {
  if (str == null || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
