# Email Flow Documentation

## Overview
The application sends two types of emails during the registration and payment process:

## 1. Registration Email
**Trigger:** Sent immediately after team registration  
**Recipient:** Team captain's email  
**Template:** `getRegistrationEmail()` from `src/lib/emailTemplates.js`

### Content Includes:
- Welcome message
- Team name confirmation
- Login credentials (email and password)
- Next steps (payment reminder)
- Contact information

### Code Location:
- **API Route:** `src/app/api/teams/registration/route.js`
- **Line:** ~75-85
- **Behavior:** Non-blocking (uses `.catch()` to prevent registration failure if email fails)

```javascript
sendMail({
  to: captain_email,
  subject,
  text,
  html,
}).catch((mailError) => {
  console.error("Registration email failed:", mailError);
});
```

## 2. Payment Receipt Email
**Trigger:** Sent after successful payment completion  
**Recipient:** Team captain's email  
**Template:** `getPaymentReceiptEmail()` from `src/lib/emailTemplates.js`

### Content Includes:
- Payment confirmation
- Receipt summary (team name, team ID, amount, date)
- Complete team member details
- Payment receipt notice

### Code Location:
- **API Route:** `src/app/api/teams/markPaid/[id]/route.js`
- **Line:** ~40-75
- **Behavior:** Non-blocking (wrapped in try-catch to prevent payment status update failure)

```javascript
try {
  const team = await prisma.teams.findUnique({...});
  if (team?.captain_email) {
    const { subject, html, text } = getPaymentReceiptEmail({...});
    await sendMail({
      to: team.captain_email,
      subject,
      text,
      html,
    });
  }
} catch (mailError) {
  console.error("Payment receipt email failed:", mailError);
}
```

## Email Configuration

### SMTP Settings (SendGrid)
The application uses nodemailer with SendGrid SMTP:

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="ioqt zezv uizd itxx"
MAIL_FROM="Auction Startup <placementsecy@rtu.ac.in>"
```

### Mailer Implementation
- **File:** `src/lib/mailer.js`
- **Method:** `sendMail({ to, subject, text, html, from })`
- **Transport:** Nodemailer with SMTP

## Testing Email Flow

### Test Registration Email
1. Register a new team via `/register` page
2. Check the captain's email inbox
3. Verify registration email is received with login credentials

### Test Payment Receipt Email
1. Complete payment via `/payment?teamId=<id>` page
2. After successful payment, check the captain's email inbox
3. Verify payment receipt email is received with team details

### Manual Test Endpoint
You can test email sending using the test endpoint:
- **URL:** `/api/test-email`
- **Method:** GET
- **Purpose:** Sends a test email to verify SMTP configuration

## Email Flow Diagram

```
User Registration
    ↓
POST /api/teams/registration
    ↓
Create Team in Database
    ↓
Send Registration Email (non-blocking)
    ↓
Return Success Response
    ↓
Redirect to Payment Page
    ↓
User Completes Payment
    ↓
PATCH /api/teams/markPaid/[id]
    ↓
Update payment_status = true
    ↓
Send Payment Receipt Email (non-blocking)
    ↓
Return Success Response
    ↓
Redirect to Team Dashboard
```

## Error Handling

### Registration Email Failure
- Registration still succeeds
- Error logged to console
- User can still login and complete payment

### Payment Receipt Email Failure
- Payment status still updated
- Error logged to console
- User can still access dashboard

## Important Notes

1. **Non-blocking emails:** Both emails are sent in a non-blocking manner to ensure the main operations (registration and payment) succeed even if email delivery fails.

2. **Email verification:** Ensure the sender email (`MAIL_FROM`) is verified in SendGrid.

3. **SMTP credentials:** The SMTP password should be kept secure and not committed to version control.

4. **Testing:** Always test email delivery in a staging environment before production deployment.

5. **Monitoring:** Check server logs for email delivery errors:
   - "Registration email failed:"
   - "Payment receipt email failed:"

## Troubleshooting

### Emails not being received:
1. Check SMTP credentials in `.env`
2. Verify sender email is verified in SendGrid
3. Check spam/junk folders
4. Review server logs for errors
5. Test SMTP connection using `/api/test-email`

### Common Issues:
- **Invalid credentials:** Check SMTP_PASS is correct
- **Sender not verified:** Verify MAIL_FROM in SendGrid
- **Port blocked:** Ensure port 587 is not blocked by firewall
- **Rate limiting:** SendGrid may have rate limits on free tier
