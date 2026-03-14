# Email Testing Guide

## Quick Test Commands

### Test Registration Email
```bash
# Test with default email
curl http://localhost:3000/api/test-email

# Test with specific email
curl "http://localhost:3000/api/test-email?email=your-email@example.com"

# Test with specific email and type
curl "http://localhost:3000/api/test-email?email=your-email@example.com&type=registration"
```

### Test Payment Receipt Email
```bash
curl "http://localhost:3000/api/test-email?email=your-email@example.com&type=payment"
```

## Browser Testing

### Test Registration Email
Open in browser:
```
http://localhost:3000/api/test-email?email=your-email@example.com&type=registration
```

### Test Payment Receipt Email
Open in browser:
```
http://localhost:3000/api/test-email?email=your-email@example.com&type=payment
```

## Full Flow Testing

### 1. Test Complete Registration Flow

**Step 1:** Start the development server
```bash
npm run dev
```

**Step 2:** Navigate to registration page
```
http://localhost:3000/register
```

**Step 3:** Fill in the registration form with valid data:
- Captain Name: Test Captain
- Captain Email: your-test-email@example.com
- Password: TestPass123
- Team Name: Test Team [unique name]
- Contact Number: 9876543210
- Captain Roll Number: 21EUCS001
- Team Members: (optional)

**Step 4:** Submit the form

**Step 5:** Check your email inbox for registration email
- Subject: "Team registration confirmed – Bid War"
- Contains: Login credentials and next steps

**Step 6:** Note the team ID from the response or database

### 2. Test Complete Payment Flow

**Step 1:** Navigate to payment page with team ID
```
http://localhost:3000/payment?teamId=YOUR_TEAM_ID
```

**Step 2:** Click "Pay INR 60" button

**Step 3:** Complete the Razorpay payment (use test mode if available)

**Step 4:** After successful payment, check your email inbox
- Subject: "Payment received – Bid War (Team [Your Team Name])"
- Contains: Receipt summary and team member details

## Verification Checklist

### Registration Email Verification
- [ ] Email received in inbox (check spam folder too)
- [ ] Subject line is correct
- [ ] Captain name is displayed correctly
- [ ] Team name is displayed correctly
- [ ] Login credentials (email and password) are shown
- [ ] Email formatting looks good (HTML rendering)
- [ ] Contact information is present

### Payment Receipt Email Verification
- [ ] Email received in inbox (check spam folder too)
- [ ] Subject line includes team name
- [ ] Payment confirmation badge is visible
- [ ] Receipt summary shows:
  - [ ] Team name
  - [ ] Team ID
  - [ ] Amount paid (₹60)
  - [ ] Payment date
- [ ] Team members table is displayed correctly
- [ ] Email formatting looks good (HTML rendering)
- [ ] Contact information is present

## Troubleshooting

### Email Not Received

1. **Check Server Logs**
   Look for these error messages:
   ```
   Registration email failed: [error details]
   Payment receipt email failed: [error details]
   SMTP Error: [error details]
   ```

2. **Verify SMTP Configuration**
   Check `.env` file:
   ```env
   SMTP_HOST="smtp.sendgrid.net"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="apikey"
   SMTP_PASS="ioqt zezv uizd itxx"
   MAIL_FROM="Auction Startup <placementsecy@rtu.ac.in>"
   ```

3. **Test SMTP Connection**
   ```bash
   curl "http://localhost:3000/api/test-email?email=your-email@example.com"
   ```

4. **Check SendGrid Dashboard**
   - Login to SendGrid
   - Check Activity Feed for email delivery status
   - Verify sender email is verified

5. **Check Spam/Junk Folder**
   - Emails might be filtered as spam
   - Add sender to contacts/whitelist

### Common Errors

**Error: "Missing SMTP configuration"**
- Solution: Ensure all SMTP_* variables are set in `.env`

**Error: "Invalid login"**
- Solution: Verify SMTP_USER and SMTP_PASS are correct

**Error: "Sender not verified"**
- Solution: Verify the MAIL_FROM email in SendGrid dashboard

**Error: "Connection timeout"**
- Solution: Check if port 587 is blocked by firewall

## Database Verification

### Check if email was attempted
```sql
-- Check team registration
SELECT team_id, captain_name, captain_email, team_name, created_at 
FROM teams 
WHERE captain_email = 'your-test-email@example.com';

-- Check payment status
SELECT team_id, team_name, payment_status, created_at 
FROM teams 
WHERE team_id = YOUR_TEAM_ID;
```

## Expected Response Format

### Successful Test Email Response
```json
{
  "success": true,
  "message": "Test registration email sent successfully to your-email@example.com",
  "emailSent": {
    "to": "your-email@example.com",
    "subject": "Team registration confirmed – Bid War",
    "type": "registration"
  }
}
```

### Failed Test Email Response
```json
{
  "success": false,
  "error": "Failed to send test email",
  "details": "[Error details]"
}
```

## Production Testing

Before deploying to production:

1. **Test with real email addresses**
2. **Verify all email templates render correctly**
3. **Check email delivery time (should be < 5 seconds)**
4. **Test with different email providers** (Gmail, Outlook, Yahoo, etc.)
5. **Verify emails don't land in spam**
6. **Test email links and formatting on mobile devices**
7. **Monitor SendGrid quota and usage**

## Monitoring

### Key Metrics to Monitor
- Email delivery rate
- Email open rate (if tracking enabled)
- Bounce rate
- Spam complaints
- SendGrid API quota usage

### Log Monitoring
Watch for these log entries:
```
✓ Email sent successfully: [messageId]
✗ Registration email failed: [error]
✗ Payment receipt email failed: [error]
✗ SMTP Error: [error]
```

## Support

If emails are still not working after troubleshooting:

1. Check SendGrid status page: https://status.sendgrid.com/
2. Review SendGrid documentation: https://docs.sendgrid.com/
3. Contact SendGrid support with error logs
4. Verify account is not suspended or rate-limited

## Notes

- Emails are sent asynchronously (non-blocking)
- Registration and payment operations succeed even if email fails
- Email failures are logged but don't affect user experience
- Test in development before deploying to production
- Keep SMTP credentials secure and never commit to version control
