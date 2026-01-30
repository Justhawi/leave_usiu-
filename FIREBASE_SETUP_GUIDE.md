# Firebase Setup Guide

This guide will walk you through setting up Firebase for the USIU Leave Management System.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click on "Add project" or "Create a project"
3. Enter your project name (e.g., "USIU-Leave-System")
4. Click "Continue"
5. Disable Google Analytics (optional) or configure it
6. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click on the web icon (</>) to add a web app
2. Enter an app nickname (e.g., "USIU Leave System Web")
3. Check "Also set up Firebase Hosting" if you want to use Firebase Hosting (optional)
4. Click "Register app"
5. **Important**: Copy the Firebase configuration object shown. You'll need this for Step 6.

The configuration will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## Step 3: Enable Authentication

1. In the Firebase Console, click on "Authentication" in the left sidebar
2. Click on "Get started"
3. Go to the "Sign-in method" tab
4. Click on "Email/Password"
5. Enable the "Email/Password" toggle
6. Click "Save"

## Step 4: Set Up Firestore Database

1. In the Firebase Console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in test mode" (we'll secure it later)
4. Choose your Cloud Firestore location (select the one closest to your users)
5. Click "Enable"

### Set Up Firestore Security Rules

After creating your database:

1. Go to the "Rules" tab in Firestore Database
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // Leave requests collection
    match /leaveRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Attendance collection
    match /attendance/{recordId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

3. Click "Publish"

## Step 5: Create an Admin User

Since the first user registered through the system will be a regular staff member, you need to manually create an admin user:

### Option 1: Using Firebase Console

1. Go to "Authentication" in Firebase Console
2. Click on "Users" tab
3. Click "Add user"
4. Enter email and password for the admin account
5. Click "Add user"
6. Copy the User UID that is generated
7. Go to "Firestore Database"
8. Click "Start collection"
9. Collection ID: `users`
10. Document ID: Paste the User UID you copied
11. Add the following fields:
    - Field: `name`, Type: string, Value: "Admin User"
    - Field: `email`, Type: string, Value: (same email you used)
    - Field: `role`, Type: string, Value: "admin"
    - Field: `staffId`, Type: string, Value: "ADMIN-001"
    - Field: `department`, Type: string, Value: "Administration"
    - Field: `leaveBalance`, Type: number, Value: 21
    - Field: `createdAt`, Type: timestamp, Value: (current time)
12. Click "Save"

### Option 2: Using Firestore Console Directly

1. Go to Firestore Database
2. If you haven't created any users yet, create the collection first
3. Click "Add document"
4. Use the User UID from Authentication as the Document ID
5. Add all the fields mentioned above

## Step 6: Configure Your Application

1. Open the file `js/firebase-config.js` in your project
2. Replace the placeholder configuration with your actual Firebase configuration from Step 2:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## Step 7: Test Your Setup

1. Open `index.html` in your web browser
2. Click "Login" and try logging in with your admin credentials
3. If successful, you should be redirected to the admin dashboard
4. Try registering a new staff member through the registration form
5. Test creating leave requests and approving them

## Troubleshooting

### Issue: "Permission denied" errors
- Make sure your Firestore security rules are properly set up
- Verify that the user is authenticated before performing operations

### Issue: "Firebase not defined" error
- Check that the Firebase CDN scripts are loading correctly
- Make sure firebase-config.js is included after the Firebase CDN scripts

### Issue: Cannot login or register
- Verify that Email/Password authentication is enabled
- Check browser console for specific error messages
- Ensure your Firebase configuration is correct

### Issue: Admin user cannot access admin dashboard
- Verify that the user document in Firestore has `role: "admin"`
- Check that the User UID matches between Authentication and Firestore

## Additional Configuration (Optional)

### Enable Email Verification

1. Go to Authentication > Templates
2. Edit the email templates for verification, password reset, etc.
3. Customize the sender name and email

### Set Up Custom Domain (for Firebase Hosting)

1. Go to Hosting in Firebase Console
2. Click "Add custom domain"
3. Follow the instructions to verify domain ownership
4. Configure DNS records

## Security Best Practices

1. **Never commit your Firebase config with sensitive data to public repositories**
2. **Use environment variables for production deployments**
3. **Regularly review Firestore security rules**
4. **Enable App Check for additional security** (in Firebase Console > App Check)
5. **Monitor usage in Firebase Console to detect unusual activity**

## Next Steps

After completing Firebase setup:
1. Review the EMAIL_SETUP_GUIDE.md for email notification configuration
2. Test all features thoroughly
3. Deploy your application using Firebase Hosting or GitHub Pages
4. Set up backups for your Firestore data

## Support

For more information:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
