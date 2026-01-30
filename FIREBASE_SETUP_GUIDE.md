# Firebase Setup Guide for USIU Leave Management System

This guide will walk you through setting up Firebase for the Leave Management System in the correct order.

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "USIU Leave Management System")
4. Click **"Continue"**
5. **Disable** Google Analytics (optional, you can enable later if needed)
6. Click **"Create project"**
7. Wait for the project to be created, then click **"Continue"**

---

## Step 2: Get Your Firebase Configuration Keys

1. In the Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to the **"Your apps"** section
4. Click the **Web icon** `</>` to add a web app
5. Register your app:
   - Enter an app nickname (e.g., "Leave Management Web")
   - **Do NOT** check "Also set up Firebase Hosting" (unless you want to use it)
   - Click **"Register app"**
6. Copy the `firebaseConfig` object that appears
7. Open `js/firebase-config.js` in your code editor
8. Find the `firebaseConfig` object (around line 4-11)
9. Replace the placeholder values with your actual config:

```javascript
const firebaseConfig = {
  apiKey: 'YOUR_ACTUAL_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID'
};
```

**⚠️ Important:** Keep your `apiKey` secure. For production, consider using environment variables or Firebase Hosting environment config.

---

## Step 3: Enable Email/Password Authentication

1. In the Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"** (if you see it)
3. Click the **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. Toggle **"Enable"** to ON
6. Leave **"Email link (passwordless sign-in)"** as OFF (unless you want it)
7. Click **"Save"**

---

## Step 4: Create Firestore Database

1. In the Firebase Console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll add security rules in Step 6)
4. Select a **Cloud Firestore location** (choose the closest to your users)
   - Recommended: `us-central1` or `europe-west1` 
5. Click **"Enable"**
6. Wait for the database to be created

---

## Step 5: Set Up Firestore Security Rules

1. In Firestore Database, click the **"Rules"** tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isOwner(userId);
      // Users can create their own profile during registration
      allow create: if isOwner(userId) && request.resource.data.role in ['staff', 'admin', 'hr', 'finance', 'academics', 'administration', 'it', 'library', 'marketing'];
      // Only admins can update profiles (or users updating their own basic info)
      allow update: if isAdmin() || (isOwner(userId) && 
                                     request.resource.data.diff(resource.data).affectedKeys().hasOnly(['fullName', 'email', 'department']));
      // Only admins can delete profiles
      allow delete: if isAdmin();
    }
    
    // Leave requests collection
    match /leave_requests/{requestId} {
      // Users can read their own requests, admins and department heads can read department requests
      allow read: if isAuthenticated() && 
                     (resource.data.userId == request.auth.uid || 
                      isAdmin() || 
                      resource.data.department == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.department);
      // Staff can create their own requests
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      // Admins and department heads can update requests
      allow update: if isAdmin() || 
                      (isAuthenticated() && 
                       resource.data.department == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.department &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'hr', 'finance', 'academics', 'administration', 'it', 'library', 'marketing']);
      // Only admins can delete requests
      allow delete: if isAdmin();
    }
    
    // Departments collection (read-only for all authenticated users)
    match /departments/{departmentId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Leave balances collection
    match /leave_balances/{userId} {
      // Users can read their own leave balance
      allow read: if isOwner(userId);
      // Admins and HR can read all balances
      allow read: if isAuthenticated() && 
                     (isOwner(userId) || 
                      isAdmin() || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'hr');
      // Only admins and HR can update balances
      allow write: if isAdmin() || 
                    (isAuthenticated() && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'hr');
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      // Users can read their own notifications
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      // System can create notifications for any user
      allow create: if isAuthenticated();
      // Users can mark their own notifications as read
      allow update: if isAuthenticated() && 
                       resource.data.userId == request.auth.uid &&
                       request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']);
      // Only admins can delete notifications
      allow delete: if isAdmin();
    }
  }
}
```

3. Click **"Publish"** to save the rules
4. You should see a green success message

---

## Step 6: Seed Initial Department Data

1. In Firestore Database, click the **"Data"** tab
2. Click **"Start collection"**
3. Collection ID: `departments` 
4. Click **"Next"**
5. Add the first document:
   - **Document ID:** Click "Auto-ID" or use a custom ID like `hr` 
   - **Fields:**
     - `name` (string): `Human Resources` 
     - `description` (string): `Handles employee relations, benefits, and leave policies.` 
     - `head` (string): `HR Manager` 
     - `contact_email` (string): `hr@usiu.ac.ke` 
   - Click **"Save"**
6. Repeat for other departments. Click **"Add document"** in the `departments` collection:

   **Document 2:**
   - Document ID: `finance` (or Auto-ID)
   - `name`: `Finance Department` 
   - `description`: `Manages budget, payroll, and financial operations.` 
   - `head`: `Finance Manager` 
   - `contact_email`: `finance@usiu.ac.ke` 

   **Document 3:**
   - Document ID: `academics` (or Auto-ID)
   - `name`: `Academics Department` 
   - `description`: `Handles academic programs, faculty affairs, and curriculum.` 
   - `head`: `Academic Director` 
   - `contact_email`: `academics@usiu.ac.ke` 

   **Document 4:**
   - Document ID: `administration` (or Auto-ID)
   - `name`: `Administration Department` 
   - `description`: `Manages general administration and facilities.` 
   - `head`: `Administration Manager` 
   - `contact_email`: `admin@usiu.ac.ke` 

   **Document 5:**
   - Document ID: `it` (or Auto-ID)
   - `name`: `IT Services` 
   - `description`: `Handles technology infrastructure and support.` 
   - `head`: `IT Manager` 
   - `contact_email`: `it@usiu.ac.ke` 

   **Document 6:**
   - Document ID: `library` (or Auto-ID)
   - `name`: `Library Department` 
   - `description`: `Manages library resources and information services.` 
   - `head`: `Library Director` 
   - `contact_email`: `library@usiu.ac.ke` 

   **Document 7:**
   - Document ID: `marketing` (or Auto-ID)
   - `name`: `Marketing Department` 
   - `description`: `Handles marketing, communications, and public relations.` 
   - `head`: `Marketing Manager` 
   - `contact_email`: `marketing@usiu.ac.ke` 

---

## Step 7: Test the Application - Create Test Accounts

### 7.1: Open the Application

1. Open `index.html` in your web browser
   - You can drag and drop the file into your browser
   - Or use a local server (recommended):
     - **VS Code:** Install "Live Server" extension, right-click `index.html` → "Open with Live Server"
     - **Python:** Run `python -m http.server 8000` in the project folder, then visit `http://localhost:8000` 
     - **Node.js:** Install `http-server` globally: `npm install -g http-server`, then run `http-server` in the project folder

### 7.2: Create an Admin Account

1. On the home page, click **"Login"** or **"Get Started"**
2. Click **"Don't have an account? Sign up"**
3. Fill in the form:
   - **Full Name:** `System Administrator` 
   - **Account Type:** Select **"Admin"**
   - **Email:** `admin@usiu.ac.ke` (use a real email you can access)
   - **Password:** `admin123456` (minimum 6 characters)
4. Click **"Create Account"**
5. You should be redirected to `admin-dashboard.html` 
6. **Verify in Firebase Console:**
   - Go to **Authentication** → **Users** tab
   - You should see the admin email listed
   - Go to **Firestore Database** → **Data** tab
   - Open the `users` collection
   - You should see a document with the admin's UID containing:
     - `fullName`: `System Administrator` 
     - `role`: `admin` 
     - `email`: `admin@usiu.ac.ke` 

### 7.3: Create Staff Accounts

1. Sign out from the admin account (click **"Sign Out"** in the admin dashboard)
2. You should be back on the home page
3. Click **"Login"**
4. Click **"Don't have an account? Sign up"**
5. Fill in the form:
   - **Full Name:** `John Smith` 
   - **Account Type:** Select **"Staff"**
   - **Department:** Select **"Finance"**
   - **Employee ID:** `EMP-001` 
   - **Email:** `jsmith@usiu.ac.ke` (use a real email you can access)
   - **Password:** `staff123` 
6. Click **"Create Account"**
7. You should be redirected to `staff-dashboard.html` 
8. **Verify in Firebase Console:**
   - Check **Authentication** → **Users** tab (should see both admin and staff)
   - Check **Firestore Database** → **users** collection
   - The staff profile should have:
     - `fullName`: `John Smith` 
     - `role`: `staff` 
     - `department`: `finance` 
     - `employeeId`: `EMP-001` 
     - `email`: `jsmith@usiu.ac.ke` 

---

## Step 8: Test Staff Functionality

### 8.1: Submit a Leave Request

1. While logged in as the staff member, click **"New Leave Request"**
2. Fill in the leave request form:
   - **Leave Type:** Select **"Annual Leave"**
   - **Start Date:** Choose a date
   - **End Date:** Choose a date
   - **Reason:** Enter a reason for the leave
3. Click **"Submit Request"**
4. You should see a new request appear in the list
5. **Verify in Firebase Console:**
   - Go to **Firestore Database** → **Data** tab
   - Open the `leave_requests` collection
   - You should see a new document with:
     - `userId`: (the staff's Firebase UID)
     - `staffName`: `John Smith` 
     - `employeeId`: `EMP-001` 
     - `email`: `jsmith@usiu.ac.ke` 
     - `department`: `finance` 
     - `leaveType`: `annual` 
     - `startDate`: (timestamp)
     - `endDate`: (timestamp)
     - `reason`: Your reason text
     - `status`: `pending` 
     - `requestDate`: (timestamp)

### 8.2: View Request Status

1. On the staff dashboard, you should see:
   - The request card with status badges
   - Status showing "Pending"
   - Leave details and dates

---

## Step 9: Test Department Head Functionality

### 9.1: Create a Department Head Account

1. Sign out from the staff account
2. Create a new account:
   - **Full Name:** `Finance Manager` 
   - **Account Type:** Select **"Finance"** (Department Head)
   - **Email:** `financemanager@usiu.ac.ke` 
   - **Password:** `manager123` 
3. You should be redirected to `finance-dashboard.html` 

### 9.2: Approve Leave Request

1. On the finance dashboard, you should see:
   - Pending leave requests from finance department staff
   - Statistics cards showing leave metrics
2. Click on a pending request
3. Review the request details
4. Click **"Approve"** or **"Reject"**
5. If approving, you can add comments
6. Click **"Update Status"**
7. **Verify in Firebase Console:**
   - Go to **Firestore Database** → `leave_requests` collection
   - Open the request document
   - Verify:
     - `status`: `approved` or `rejected` 
     - `approvedBy`: (manager's UID)
     - `approvedDate`: (timestamp)
     - `comments`: Your comment text

---

## Step 10: Test Admin Functionality

### 10.1: Sign In as Admin

1. Sign out from the department head account
2. Sign in with the admin credentials:
   - Email: `admin@usiu.ac.ke` 
   - Password: `admin123456` 
3. You should be redirected to `admin-dashboard.html` 

### 10.2: View All Leave Requests

1. On the admin dashboard, you should see:
   - **Stats cards** showing total, pending, approved, rejected requests
   - **Charts** (Leave Distribution, Department Trends, Monthly Analysis)
   - **Request list** showing all leave requests from all departments

### 10.3: Manage Leave Balances

1. Click on **"Leave Balances"** or **"Manage Balances"**
2. You should see all staff members with their leave balances
3. Click **"Edit Balance"** for a staff member
4. Update the leave balance:
   - **Annual Leave:** 21 days
   - **Sick Leave:** 10 days
   - **Personal Leave:** 5 days
5. Click **"Save"**
6. **Verify in Firebase Console:**
   - Go to **Firestore Database** → `leave_balances` collection
   - You should see a document with the staff's UID containing their leave balances

---

## Step 11: Test Notifications

1. As a staff member, submit a new leave request
2. As a department head, approve the request
3. As the staff member, check your dashboard
4. You should see:
   - A notification badge
   - A notification about your leave request status
5. **Verify in Firebase Console:**
   - Go to **Firestore Database** → `notifications` collection
   - You should see notification documents for the relevant users

---

## Step 12: Test Department Dashboards

1. Sign in as different department heads:
   - HR Manager: `hr-dashboard.html`
   - Academic Director: `academics-dashboard.html`
   - IT Manager: `it-dashboard.html`
   - etc.
2. Each dashboard should show:
   - Only requests from their department
   - Department-specific statistics
   - Approval/rejection capabilities

---

## Troubleshooting

### Issue: "User profile not found" error when signing in

**Solution:** Make sure the user profile was created during sign-up. Check Firestore `users` collection. If missing, you may need to manually create it or fix the sign-up flow.

### Issue: Cannot see leave requests as department head

**Solution:**
- Verify your profile has the correct department role in Firestore
- Check Firestore security rules are published
- Ensure requests have the correct department field

### Issue: Charts not displaying

**Solution:**
- Check browser console for errors
- Ensure Chart.js is loaded (check Network tab)
- Verify you have leave requests in the database
- Check that chart rendering functions are being called with data

### Issue: Cannot approve/reject requests

**Solution:**
- Verify your role has permission (admin or department head)
- Check Firestore security rules allow updates
- Check browser console for permission errors

### Issue: Leave balance not updating

**Solution:**
- Check if leave_balances collection exists
- Verify the balance update function is working
- Ensure admin/HR permissions are correct

---

## Security Best Practices

1. **Never commit Firebase config with real keys to public repositories**
   - Use environment variables or Firebase Hosting config
   - Add `js/firebase-config.js` to `.gitignore` if it contains real keys

2. **Review Firestore Security Rules regularly**
   - Test rules using the Rules Playground in Firebase Console
   - Ensure rules match your application's requirements

3. **Enable Firebase App Check** (optional but recommended for production)
   - Helps protect your backend resources from abuse

4. **Monitor Authentication Usage**
   - Check Authentication → Users tab regularly
   - Set up alerts for suspicious activity

5. **Backup Firestore Data**
   - Use Firebase Export/Import or scheduled backups

---

## Next Steps

- Set up Firebase Hosting to deploy your application
- Configure custom domain (optional)
- Set up email notifications (using Firebase Extensions or Cloud Functions)
- Add audit logging for admin actions
- Implement leave calendar integration
- Add reporting and analytics features

---

## Support

If you encounter issues:
1. Check the browser console (F12) for JavaScript errors
2. Check Firebase Console → Firestore → Data for data structure issues
3. Verify all Firebase services are enabled
4. Review Firestore security rules syntax

---

**Congratulations!** Your USIU Leave Management System is now fully set up with Firebase! 🎉
