# Quick Start Guide

Get your USIU Leave Management System up and running in minutes!

## 🚀 5-Minute Setup

### Step 1: Firebase Setup (2 minutes)

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Name it "USIU-Leave-System"
   - Disable Google Analytics (optional)
   - Click "Create project"

2. **Enable Authentication**
   - Click "Authentication" → "Get started"
   - Click "Email/Password" → Enable it → Save

3. **Create Database**
   - Click "Firestore Database" → "Create database"
   - Select "Start in test mode"
   - Choose your region
   - Click "Enable"

4. **Get Your Config**
   - Click the web icon (</>) in Project Overview
   - Register app as "USIU Leave System"
   - Copy the firebaseConfig object

### Step 2: Configure Your App (1 minute)

1. Open `js/firebase-config.js`
2. Replace the placeholder config with yours:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_ACTUAL_API_KEY",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abc123"
   };
   ```
3. Save the file

### Step 3: Create Admin User (2 minutes)

1. **In Firebase Console**:
   - Go to Authentication → Users
   - Click "Add user"
   - Email: `admin@usiu.ac.ke`
   - Password: `Admin123` (change later!)
   - Copy the User UID shown

2. **Create User Document**:
   - Go to Firestore Database
   - Start collection: `users`
   - Document ID: Paste the User UID
   - Add fields:
     ```
     name: "Admin User"
     email: "admin@usiu.ac.ke"
     role: "admin"
     staffId: "ADMIN-001"
     department: "Administration"
     leaveBalance: 21
     ```
   - Click Save

### Step 4: Launch! (30 seconds)

1. Open `index.html` in your browser
2. Click "Login"
3. Use admin credentials
4. You're in! 🎉

## ✅ What You Can Do Now

### As Admin
- ✓ View dashboard with statistics
- ✓ Review and approve leave requests
- ✓ Generate reports
- ✓ View attendance records
- ✓ Manage staff leave balances

### Register Staff
1. Click "Logout"
2. Click "Login" → "Don't have an account? Register"
3. Fill in staff details
4. They can now submit leave requests!

## 📱 Testing the System

### Test Workflow

1. **Register a Test Staff Member**
   ```
   Name: John Doe
   Email: john@usiu.ac.ke
   Staff ID: USIU-001
   Department: IT
   Password: Test123
   ```

2. **Submit Leave Request (as John)**
   - Click "New Leave Request"
   - Select "Annual Leave"
   - Choose dates
   - Add reason
   - Submit

3. **Approve Request (as Admin)**
   - Logout from John's account
   - Login as admin
   - See pending request
   - Click "Approve"

4. **Verify Balance Updated**
   - Logout and login as John
   - Check leave balance decreased

## 🔒 Secure Your System

After testing, secure your Firebase:

### Update Security Rules

1. Go to Firestore Database → Rules
2. Replace with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth.uid == userId;
       }
       match /leaveRequests/{requestId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
         allow update: if request.auth != null && 
           (request.auth.uid == resource.data.userId || 
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
       }
       match /attendance/{recordId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
         allow update, delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
     }
   }
   ```
3. Click "Publish"

### Change Admin Password

1. In Firebase Console → Authentication
2. Click on admin user
3. Reset password
4. Use a strong password

## 🌐 Deploy to GitHub Pages

### Quick Deploy

1. **Create GitHub Repository**
   - Go to https://github.com/new
   - Name: `usiu-leave-system`
   - Create repository

2. **Upload Files**
   - Click "uploading an existing file"
   - Drag all your project files
   - Commit changes

3. **Enable GitHub Pages**
   - Settings → Pages
   - Source: main branch, / (root)
   - Save
   - Visit: `https://YOUR-USERNAME.github.io/usiu-leave-system/`

## 📚 Need More Help?

Check these guides in the `docs` folder:

- **FIREBASE_SETUP_GUIDE.md** - Detailed Firebase setup
- **EMAIL_SETUP_GUIDE.md** - Email notifications
- **GITHUB_DEPLOYMENT_GUIDE.md** - Detailed deployment
- **README.md** - Complete documentation

## 🐛 Troubleshooting

### Can't Login?
- Check Firebase config is correct
- Verify user exists in Authentication
- Check browser console for errors

### Leave Request Not Showing?
- Ensure Firestore security rules are set
- Check user is authenticated
- Verify data structure in Firestore

### Dashboard Not Loading?
- Check user document has `role` field
- Clear browser cache
- Verify Firebase initialization

## 💡 Pro Tips

1. **Bookmark Admin Dashboard**
   Save the direct URL for quick access

2. **Use Browser Password Manager**
   Save login credentials securely

3. **Regular Backups**
   Export Firestore data monthly

4. **Test Before Going Live**
   Create multiple test users and scenarios

5. **Monitor Usage**
   Check Firebase Console regularly

## 🎓 Next Steps

After basic setup:

1. ✓ Customize leave types
2. ✓ Adjust leave balances
3. ✓ Set up email notifications
4. ✓ Customize branding/colors
5. ✓ Train staff on system use
6. ✓ Deploy to production
7. ✓ Monitor and maintain

## 📞 Support

Need help?
- 📧 Email: it-support@usiu.ac.ke
- 📱 Phone: +254 123 456 789
- 🏢 Office: IT Department

---

**Time to Complete**: ~5 minutes
**Difficulty**: Beginner-friendly
**Cost**: Free (Firebase Free Tier)

**Now you're ready to go! Start managing leave requests efficiently! 🚀**
