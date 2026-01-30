# Email Setup Guide

This guide explains how to set up email notifications for the USIU Leave Management System using Firebase Extensions and other methods.

## Overview

The Leave Management System can send email notifications for:
- Leave request submissions
- Leave request approvals
- Leave request rejections
- Password reset emails
- New user registration confirmations

## Option 1: Firebase Extensions (Recommended)

Firebase Extensions provide pre-built solutions for common tasks, including sending emails.

### Step 1: Install the Trigger Email Extension

1. Go to your Firebase Console
2. Click on "Extensions" in the left sidebar
3. Click on "Explore Extensions"
4. Search for "Trigger Email from Firestore"
5. Click "Install" on the "Trigger Email from Firestore" extension
6. Follow the installation wizard

### Step 2: Configure SMTP Settings

During installation, you'll need to provide:

**Using Gmail:**
1. SMTP Host: `smtp.gmail.com`
2. SMTP Port: `465` (or `587` for TLS)
3. SMTP Username: Your Gmail address
4. SMTP Password: **App Password** (not your regular password)

**To create a Gmail App Password:**
1. Go to your Google Account settings
2. Select Security
3. Under "Signing in to Google," select App Passwords
4. Generate a new app password
5. Use this password in the extension configuration

**Using Other Email Services:**
- **Office 365/Outlook:**
  - Host: `smtp.office365.com`
  - Port: `587`
  - Username: Your email
  - Password: Your password

- **SendGrid:**
  - Host: `smtp.sendgrid.net`
  - Port: `587`
  - Username: `apikey`
  - Password: Your SendGrid API key

- **Mailgun:**
  - Host: `smtp.mailgun.org`
  - Port: `587`
  - Username: Your Mailgun SMTP username
  - Password: Your Mailgun SMTP password

### Step 3: Configure the Extension

1. **Collection path**: `mail`
2. **Email from address**: `noreply@usiu.ac.ke` (or your preferred email)
3. **Email from name**: `USIU Leave Management System`
4. **Default reply-to**: `hr@usiu.ac.ke` (optional)

### Step 4: Create Cloud Functions for Email Triggers

Create a new file `functions/index.js` in your project:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Send email when leave request is created
exports.sendLeaveRequestEmail = functions.firestore
    .document('leaveRequests/{requestId}')
    .onCreate(async (snap, context) => {
        const request = snap.data();
        
        // Send email to admins
        const admins = await db.collection('users')
            .where('role', '==', 'admin')
            .get();
        
        admins.forEach(async (adminDoc) => {
            const admin = adminDoc.data();
            
            await db.collection('mail').add({
                to: admin.email,
                message: {
                    subject: 'New Leave Request Submitted',
                    html: `
                        <h2>New Leave Request</h2>
                        <p><strong>Staff:</strong> ${request.userName}</p>
                        <p><strong>Department:</strong> ${request.department}</p>
                        <p><strong>Leave Type:</strong> ${request.leaveType}</p>
                        <p><strong>Duration:</strong> ${request.startDate} to ${request.endDate}</p>
                        <p><strong>Days:</strong> ${request.days}</p>
                        <p><strong>Reason:</strong> ${request.reason}</p>
                        <p>Please log in to the system to review this request.</p>
                    `
                }
            });
        });
        
        // Send confirmation to staff member
        await db.collection('mail').add({
            to: request.userEmail,
            message: {
                subject: 'Leave Request Submitted Successfully',
                html: `
                    <h2>Leave Request Confirmation</h2>
                    <p>Dear ${request.userName},</p>
                    <p>Your leave request has been submitted successfully and is pending approval.</p>
                    <p><strong>Request Details:</strong></p>
                    <ul>
                        <li>Leave Type: ${request.leaveType}</li>
                        <li>Start Date: ${request.startDate}</li>
                        <li>End Date: ${request.endDate}</li>
                        <li>Duration: ${request.days} days</li>
                    </ul>
                    <p>You will be notified once your request is reviewed.</p>
                    <p>Best regards,<br>USIU HR Department</p>
                `
            }
        });
    });

// Send email when leave request is approved
exports.sendLeaveApprovalEmail = functions.firestore
    .document('leaveRequests/{requestId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        
        // Check if status changed to approved
        if (before.status !== 'approved' && after.status === 'approved') {
            await db.collection('mail').add({
                to: after.userEmail,
                message: {
                    subject: 'Leave Request Approved',
                    html: `
                        <h2>Leave Request Approved</h2>
                        <p>Dear ${after.userName},</p>
                        <p>Your leave request has been approved!</p>
                        <p><strong>Request Details:</strong></p>
                        <ul>
                            <li>Leave Type: ${after.leaveType}</li>
                            <li>Start Date: ${after.startDate}</li>
                            <li>End Date: ${after.endDate}</li>
                            <li>Duration: ${after.days} days</li>
                        </ul>
                        <p>Enjoy your time off!</p>
                        <p>Best regards,<br>USIU HR Department</p>
                    `
                }
            });
        }
        
        // Check if status changed to rejected
        if (before.status !== 'rejected' && after.status === 'rejected') {
            await db.collection('mail').add({
                to: after.userEmail,
                message: {
                    subject: 'Leave Request Update',
                    html: `
                        <h2>Leave Request Status Update</h2>
                        <p>Dear ${after.userName},</p>
                        <p>Unfortunately, your leave request has not been approved at this time.</p>
                        <p><strong>Request Details:</strong></p>
                        <ul>
                            <li>Leave Type: ${after.leaveType}</li>
                            <li>Start Date: ${after.startDate}</li>
                            <li>End Date: ${after.endDate}</li>
                        </ul>
                        ${after.adminComment ? `<p><strong>Admin Comment:</strong> ${after.adminComment}</p>` : ''}
                        <p>Please contact HR if you have any questions.</p>
                        <p>Best regards,<br>USIU HR Department</p>
                    `
                }
            });
        }
    });
```

### Step 5: Deploy Cloud Functions

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase Functions:
```bash
firebase init functions
```

4. Install dependencies:
```bash
cd functions
npm install firebase-admin firebase-functions
```

5. Deploy the functions:
```bash
firebase deploy --only functions
```

## Option 2: Custom Email Service Integration

If you prefer to use a dedicated email service:

### Using SendGrid

1. Sign up for [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Install SendGrid in your Cloud Functions:

```bash
cd functions
npm install @sendgrid/mail
```

4. Add SendGrid code to your functions:

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('YOUR_SENDGRID_API_KEY');

exports.sendEmail = functions.firestore
    .document('leaveRequests/{requestId}')
    .onCreate(async (snap, context) => {
        const request = snap.data();
        
        const msg = {
            to: request.userEmail,
            from: 'noreply@usiu.ac.ke',
            subject: 'Leave Request Submitted',
            html: '...'
        };
        
        await sgMail.send(msg);
    });
```

### Using Nodemailer

1. Install Nodemailer:
```bash
npm install nodemailer
```

2. Configure Nodemailer in your functions:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password'
    }
});

exports.sendEmail = functions.firestore
    .document('leaveRequests/{requestId}')
    .onCreate(async (snap, context) => {
        const request = snap.data();
        
        await transporter.sendMail({
            from: '"USIU Leave System" <noreply@usiu.ac.ke>',
            to: request.userEmail,
            subject: 'Leave Request Submitted',
            html: '...'
        });
    });
```

## Email Templates

You can customize email templates to match your institution's branding:

### Leave Request Submission Template

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a237e; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #fdb913; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>USIU Leave Management System</h1>
        </div>
        <div class="content">
            <h2>Leave Request Submitted</h2>
            <p>Dear [Staff Name],</p>
            <p>Your leave request has been submitted successfully.</p>
            <!-- Add more details -->
        </div>
    </div>
</body>
</html>
```

## Testing Email Delivery

1. Submit a test leave request
2. Check the Firestore `mail` collection for the email document
3. Verify the email was delivered to the recipient
4. Check spam folder if email is not in inbox
5. Review Cloud Functions logs for any errors

## Troubleshooting

### Emails not sending:
1. Check Cloud Functions logs in Firebase Console
2. Verify SMTP credentials are correct
3. Ensure "Less secure app access" is enabled (for Gmail)
4. Check that the extension is properly installed

### Emails going to spam:
1. Configure SPF and DKIM records for your domain
2. Use a professional email service (SendGrid, Mailgun)
3. Avoid spam trigger words in subject lines
4. Include unsubscribe links if sending bulk emails

### Gmail App Password issues:
1. Ensure 2-factor authentication is enabled on your Google account
2. Generate a new app password if the old one doesn't work
3. Use the 16-character app password, not your regular password

## Best Practices

1. **Use a dedicated email service** for production (SendGrid, Mailgun, etc.)
2. **Implement rate limiting** to prevent abuse
3. **Track email delivery** using the email service's dashboard
4. **Customize email templates** to match your branding
5. **Test thoroughly** before deploying to production
6. **Monitor email bounce rates** and adjust accordingly

## Additional Resources

- [Firebase Extensions Documentation](https://firebase.google.com/docs/extensions)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)

For support, contact your Firebase administrator or refer to the Firebase documentation.
