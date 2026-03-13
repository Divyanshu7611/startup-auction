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
 * @param {{ captain_name: string, team_name: string, captain_email: string, password: string, team_id: string }} data
 * @returns {{ html: string, text: string, subject: string }}
 */
export function getRegistrationEmail(data) {
  const { captain_name, team_name, captain_email, password, team_id } = data;
  const subject = "Team registration confirmed – Bid War";

  const text = [
    `Hi ${captain_name},`,
    "",
    `Your team "${team_name}" has been successfully registered for Bid War.`,
    "",
    "Your login credentials:",
    `Email: ${captain_email}`,
    `Password: ${password}`,
    `Team ID: ${team_id}`,
    "",
    "⚠️ Please save this email securely. You will need these credentials to log in.",
    "",
    "Next steps:",
    "• Complete payment when prompted to confirm your participation.",
    "• Use the credentials above to log in to your team dashboard.",
    "",
    "For queries, contact: 6378143603 | 9549545450",
    "",
    "— Bid War | Anukriti 2026",
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
                      🎯 Bid War
                    </h1>
                    <p style="margin: 6px 0 0; font-size: 13px; color: ${BRAND.inkMuted}; font-weight: 500;">
                      Anukriti 2026
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
                      Your team <strong style="color: ${BRAND.gold};">${escapeHtml(team_name)}</strong> has been successfully registered for Bid War.
                    </p>
                    
                    <!-- Credentials Box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #f7f7fb 0%, #eeeef6 100%); border-radius: 14px; border: 1px solid #e2e2ec; margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 20px 24px;">
                          <p style="margin: 0 0 14px; font-size: 11px; font-weight: 700; color: ${BRAND.violet}; text-transform: uppercase; letter-spacing: 0.06em;">🔐 Your Login Credentials</p>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e2e2ec;">
                                <span style="font-size: 12px; font-weight: 600; color: ${BRAND.inkMuted}; text-transform: uppercase;">Email</span>
                              </td>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e2e2ec; text-align: right;">
                                <span style="font-size: 14px; font-weight: 600; color: ${BRAND.ink};">${escapeHtml(captain_email)}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e2e2ec;">
                                <span style="font-size: 12px; font-weight: 600; color: ${BRAND.inkMuted}; text-transform: uppercase;">Password</span>
                              </td>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e2e2ec; text-align: right;">
                                <span style="font-size: 14px; font-weight: 700; color: ${BRAND.violet}; font-family: 'Courier New', Courier, monospace; background: rgba(74, 63, 189, 0.1); padding: 4px 10px; border-radius: 6px;">${escapeHtml(password)}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="font-size: 12px; font-weight: 600; color: ${BRAND.inkMuted}; text-transform: uppercase;">Team ID</span>
                              </td>
                              <td style="padding: 8px 0; text-align: right;">
                                <span style="font-size: 14px; font-weight: 600; color: ${BRAND.gold}; font-family: monospace;">${escapeHtml(team_id)}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Warning -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(200, 153, 58, 0.1); border-radius: 10px; border: 1px solid rgba(200, 153, 58, 0.25); margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 14px 18px;">
                          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: ${BRAND.ink};">
                            <strong style="color: #b07d28;">⚠️ Important:</strong> Save this email securely. You'll need these credentials to log in to your team dashboard.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${BRAND.inkMuted};">
                      <strong style="color: ${BRAND.ink};">Next step:</strong> Complete payment when prompted to confirm your participation.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px 32px; border-top: 1px solid #eeeef6; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: ${BRAND.inkMuted};">
                      Bid War · Anukriti 2026
                    </p>
                    <p style="margin: 8px 0 0; font-size: 11px; color: #aaa;">
                      For queries: 6378143603 | 9549545450
                    </p>
                    <p style="margin: 6px 0 0; font-size: 10px; color: #bbb;">
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

/**
 * Payment receipt email template (sent to captain after payment completion).
 * @param {{
 *   captain_name: string;
 *   captain_email: string;
 *   team_name: string;
 *   team_id: string;
 *   team_members: Array<{ name: string; roll_number?: string; contact_number?: string }>;
 *   amount?: string;
 *   payment_date?: string;
 * }} data
 * @returns {{ html: string, text: string, subject: string }}
 */
export function getPaymentReceiptEmail(data) {
  const {
    captain_name,
    captain_email,
    team_name,
    team_id,
    team_members = [],
    amount = "₹1",
    payment_date = new Date().toLocaleDateString("en-IN", { dateStyle: "long", timeZone: "Asia/Kolkata" }),
  } = data;

  const subject = "Payment received – Bid War (Team " + escapeHtml(team_name) + ")";

  const membersList = team_members.length
    ? team_members
        .map((m, i) => {
          const name = m?.name || m?.member_name || "—";
          const extra = [m?.roll_number, m?.contact_number].filter(Boolean).join(" · ");
          return `${i + 1}. ${name}${extra ? ` (${extra})` : ""}`;
        })
        .join("\n")
    : "No additional members.";

  const text = [
    `Hi ${captain_name},`,
    "",
    "Your payment for Bid War has been received successfully.",
    "",
    "Receipt summary:",
    `Team name: ${team_name}`,
    `Team ID: ${team_id}`,
    `Amount: ${amount}`,
    `Date: ${payment_date}`,
    "",
    "Team members:",
    membersList,
    "",
    "Thank you for participating. Keep this email as your payment receipt.",
    "",
    "For queries, contact: 6378143603 | 9549545450",
    "",
    "— Bid War | Anukriti 2026",
  ].join("\n");

  const membersRows =
    team_members.length > 0
      ? team_members
          .map((m, i) => {
            const name = escapeHtml(m?.name || m?.member_name || "—");
            const roll = escapeHtml((m?.roll_number || "").toString());
            const contact = escapeHtml((m?.contact_number || "").toString());
            const bg = i % 2 === 0 ? "#f7f7fb" : "#ffffff";
            return `
          <tr>
            <td style="padding: 12px 16px; background: ${bg}; border-bottom: 1px solid #eeeef6; font-size: 14px; color: ${BRAND.ink};">${name}</td>
            <td style="padding: 12px 16px; background: ${bg}; border-bottom: 1px solid #eeeef6; font-size: 13px; color: ${BRAND.inkMuted}; font-family: monospace;">${roll || "—"}</td>
            <td style="padding: 12px 16px; background: ${bg}; border-bottom: 1px solid #eeeef6; font-size: 13px; color: ${BRAND.inkMuted};">${contact || "—"}</td>
          </tr>`;
          })
          .join("")
      : `
          <tr>
            <td colspan="3" style="padding: 20px 16px; text-align: center; font-size: 14px; color: ${BRAND.inkMuted}; background: #f7f7fb;">No additional team members.</td>
          </tr>`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f0f5; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #0d0f1a 0%, #1a1a2e 50%, #16213e 100%); min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; margin: 0 auto;">
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #1a8a6e, #22b88a, #1a8a6e); border-radius: 0 0 6px 6px;"></td>
          </tr>
          <tr>
            <td style="background-color: ${BRAND.white}; border-radius: 16px; box-shadow: 0 24px 48px rgba(0,0,0,0.2); overflow: hidden;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding: 32px 40px 24px; text-align: center;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: ${BRAND.ink}; letter-spacing: -0.02em;">🎯 Bid War</h1>
                    <p style="margin: 6px 0 0; font-size: 13px; color: ${BRAND.inkMuted}; font-weight: 500;">Anukriti 2026</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 40px 20px; text-align: center;">
                    <span style="display: inline-block; padding: 10px 20px; background: rgba(26, 138, 110, 0.14); color: #1a8a6e; font-size: 13px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; border-radius: 10px; border: 1px solid rgba(26, 138, 110, 0.3);">
                      ✓ Payment received
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 40px 24px;">
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${BRAND.ink};">
                      Hi <strong>${escapeHtml(captain_name)}</strong>,
                    </p>
                    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.65; color: ${BRAND.ink};">
                      Your registration payment has been received successfully. Below is your receipt and team details.
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #f7f7fb 0%, #eeeef6 100%); border-radius: 14px; border: 1px solid #e2e2ec; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px 24px;">
                          <p style="margin: 0 0 12px; font-size: 11px; font-weight: 700; color: ${BRAND.inkMuted}; text-transform: uppercase; letter-spacing: 0.06em;">Receipt summary</p>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr><td style="padding: 4px 0; font-size: 13px; color: ${BRAND.inkMuted};">Team name</td><td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: ${BRAND.ink}; text-align: right;">${escapeHtml(team_name)}</td></tr>
                            <tr><td style="padding: 4px 0; font-size: 13px; color: ${BRAND.inkMuted};">Team ID</td><td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: ${BRAND.violet}; font-family: monospace; text-align: right;">${escapeHtml(team_id)}</td></tr>
                            <tr><td style="padding: 4px 0; font-size: 13px; color: ${BRAND.inkMuted};">Amount paid</td><td style="padding: 4px 0; font-size: 16px; font-weight: 700; color: #1a8a6e; text-align: right;">${escapeHtml(amount)}</td></tr>
                            <tr><td style="padding: 4px 0; font-size: 13px; color: ${BRAND.inkMuted};">Date</td><td style="padding: 4px 0; font-size: 14px; color: ${BRAND.ink}; text-align: right;">${escapeHtml(payment_date)}</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0 0 10px; font-size: 12px; font-weight: 600; color: ${BRAND.inkMuted}; text-transform: uppercase; letter-spacing: 0.04em;">Team members</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-radius: 12px; border: 1px solid #eeeef6; overflow: hidden;">
                      <tr>
                        <td style="padding: 12px 16px; background: ${BRAND.violet}; color: ${BRAND.white}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Name</td>
                        <td style="padding: 12px 16px; background: ${BRAND.violet}; color: ${BRAND.white}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Roll no.</td>
                        <td style="padding: 12px 16px; background: ${BRAND.violet}; color: ${BRAND.white}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Contact</td>
                      </tr>
                      ${membersRows}
                    </table>
                    <p style="margin: 20px 0 0; font-size: 13px; line-height: 1.6; color: ${BRAND.inkMuted};">
                      Keep this email as your payment receipt. You can access your team dashboard anytime with your registered email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px 40px 32px; border-top: 1px solid #eeeef6; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: ${BRAND.inkMuted};">Bid War · Anukriti 2026</p>
                    <p style="margin: 8px 0 0; font-size: 11px; color: #aaa;">For queries: 6378143603 | 9549545450</p>
                    <p style="margin: 6px 0 0; font-size: 10px; color: #bbb;">This is an automated receipt. Please do not reply.</p>
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
