import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { getRegistrationEmail, getPaymentReceiptEmail } from "@/lib/emailTemplates";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get("email") || "test@example.com";
    const type = searchParams.get("type") || "registration"; // 'registration' or 'payment'

    let emailData;

    if (type === "payment") {
      // Test payment receipt email
      emailData = getPaymentReceiptEmail({
        captain_name: "Test Captain",
        captain_email: testEmail,
        team_name: "Test Team",
        team_id: "12345",
        team_members: [
          { name: "Member 1", roll_number: "21EUCS001", contact_number: "9876543210" },
          { name: "Member 2", roll_number: "21EUCS002", contact_number: "9876543211" },
        ],
        amount: "₹60",
        payment_date: new Date().toLocaleDateString("en-IN", {
          dateStyle: "long",
          timeZone: "Asia/Kolkata",
        }),
      });
    } else {
      // Test registration email
      emailData = getRegistrationEmail({
        captain_name: "Test Captain",
        team_name: "Test Team",
        captain_email: testEmail,
        password: "TestPassword123",
      });
    }

    const { subject, html, text } = emailData;

    await sendMail({
      to: testEmail,
      subject,
      text,
      html,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Test ${type} email sent successfully to ${testEmail}`,
        emailSent: {
          to: testEmail,
          subject,
          type,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send test email",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
