# Email Flow Summary

## ✅ Email Configuration Status

### Current Setup
- **Mailer:** Nodemailer with SMTP
- **Provider:** SendGrid
- **SMTP Host:** smtp.sendgrid.net
- **SMTP Port:** 587
- **Sender:** Auction Startup <placementsecy@rtu.ac.in>

### Files Updated
1. ✅ `.env` - Updated with SMTP credentials
2. ✅ `src/lib/mailer.js` - Migrated from SendGrid API to Nodemailer SMTP
3. ✅ `package.json` - Added nodemailer dependency

---

## 📧 Email Types

### 1. Registration Email
**When:** Immediately after team registration  
**To:** Captain's email  
**Subject:** "Team registration confirmed – Bid War"  
**Contains:**
- Welcome message
- Team name confirmation
- Login credentials (email + password)
- Payment reminder
- Contact information

**Code Location:** `src/app/api/teams/registration/route.js` (line ~75-85)

---

### 2. Payment Receipt Email
**When:** After successful payment completion  
**To:** Captain's email  
**Subject:** "Payment received – Bid War (Team [name])"  
**Contains:**
- Payment confirmation
- Receipt summary (team name, ID, amount, date)
- Complete team member details
- Receipt notice

**Code Location:** `src/app/api/teams/markPaid/[id]/route.js` (line ~40-75)

---

## 🔄 Complete User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  1. User fills registration form at /register               │
│     - Captain details                                        │
│     - Team name                                              │
│     - Password                                               │
│     - Team members (optional)                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. POST /api/teams/registration                            │
│     - Validates data                                         │
│     - Creates team in database                               │
│     - Hashes password                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. 📧 REGISTRATION EMAIL SENT (non-blocking)               │
│     ✉️  To: captain_email                                   │
│     📝 Subject: "Team registration confirmed – Bid War"     │
│     📄 Contains: Login credentials + next steps             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. User redirected to /payment?teamId=XXX                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    PAYMENT PROCESS                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. User clicks "Pay INR 60" button                         │
│     - Razorpay modal opens                                   │
│     - User completes payment                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  6. PATCH /api/teams/markPaid/[id]                          │
│     - Verifies user session                                  │
│     - Updates payment_status = true                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  7. 📧 PAYMENT RECEIPT EMAIL SENT (non-blocking)            │
│     ✉️  To: captain_email                                   │
│     📝 Subject: "Payment received – Bid War (Team [name])"  │
│     📄 Contains: Receipt + team details                     │
└─────────────��───────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  8. User redirected to /team/dashboard?teamId=XXX           │
│     ✅ Registration complete                                │
│     ✅ Payment confirmed                                    │
│     ✅ Both emails sent                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Instructions

### Quick Test (Using Test Endpoint)

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test Registration Email:**
   ```
   http://localhost:3000/api/test-email?email=YOUR_EMAIL&type=registration
   ```

3. **Test Payment Email:**
   ```
   http://localhost:3000/api/test-email?email=YOUR_EMAIL&type=payment
   ```

### Full Flow Test

1. **Register a new team:**
   - Go to: `http://localhost:3000/register`
   - Fill in all details
   - Submit form
   - ✅ Check email for registration confirmation

2. **Complete payment:**
   - Go to: `http://localhost:3000/payment?teamId=YOUR_TEAM_ID`
   - Click "Pay INR 60"
   - Complete payment
   - ✅ Check email for payment receipt

---

## ⚠️ Important Notes

### Email Delivery is Non-Blocking
- Registration succeeds even if email fails
- Payment status updates even if email fails
- Errors are logged but don't affect user experience

### Error Handling
```javascript
// Registration email (non-blocking)
sendMail({...}).catch((mailError) => {
  console.error("Registration email failed:", mailError);
});

// Payment email (non-blocking)
try {
  await sendMail({...});
} catch (mailError) {
  console.error("Payment receipt email failed:", mailError);
}
```

### Check Logs For
- ✅ "Email sent successfully: [messageId]"
- ❌ "Registration email failed: [error]"
- ❌ "Payment receipt email failed: [error]"
- ❌ "SMTP Error: [error]"

---

## 🔍 Troubleshooting

### Emails Not Received?

1. **Check spam/junk folder**
2. **Verify SMTP credentials in `.env`**
3. **Check server logs for errors**
4. **Test SMTP connection:** `http://localhost:3000/api/test-email?email=YOUR_EMAIL`
5. **Verify sender email in SendGrid dashboard**

### Common Issues

| Issue | Solution |
|-------|----------|
| "Missing SMTP configuration" | Check all SMTP_* variables in `.env` |
| "Invalid login" | Verify SMTP_USER and SMTP_PASS |
| "Sender not verified" | Verify MAIL_FROM in SendGrid |
| "Connection timeout" | Check if port 587 is blocked |

---

## 📊 What Happens After Payment?

```
Payment Completed
    ↓
Database Updated (payment_status = true)
    ↓
Email Sent to Captain
    ↓
User Redirected to Dashboard
    ↓
✅ Registration Complete!
```

---

## 📝 Summary

✅ **Registration Email:** Sent immediately after team registration  
✅ **Payment Receipt Email:** Sent after successful payment  
✅ **Both emails are non-blocking:** Operations succeed even if email fails  
✅ **SMTP configured:** Using SendGrid with nodemailer  
✅ **Test endpoint available:** `/api/test-email`  

**Next Steps:**
1. Test email delivery using the test endpoint
2. Complete a full registration + payment flow
3. Verify both emails are received
4. Check server logs for any errors

---

## 📚 Documentation Files

- `EMAIL_FLOW_DOCUMENTATION.md` - Detailed technical documentation
- `EMAIL_TESTING_GUIDE.md` - Comprehensive testing guide
- `EMAIL_FLOW_SUMMARY.md` - This quick reference guide

---

**Ready to test!** 🚀

Start the server with `npm run dev` and test the email flow.
