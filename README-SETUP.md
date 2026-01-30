# USIU Leave Management System - Setup Guide

## Quick Start

The project is now running in demo mode with error handling in place. To enable full functionality:

### 1. Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Copy your Firebase configuration
6. Replace the demo values in `js/firebase-config.js`

### 2. Update Firebase Config
Replace the demo configuration in `js/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

### 3. Security Rules
Set up Firestore security rules in Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /leaveRequests/{requestId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Current Status
✅ HTML structure is complete and valid
✅ CSS styling is responsive and functional  
✅ JavaScript error handling implemented
✅ Demo mode prevents crashes
✅ Local server running successfully
✅ All modals and forms working
✅ Navigation and smooth scrolling functional

## Features Working in Demo Mode
- Website navigation and sections
- Login/Registration modals (show demo messages)
- Responsive design
- Form validation
- Toast notifications
- Smooth scrolling

## Features Requiring Firebase Setup
- User authentication
- Leave request submission
- Dashboard functionality
- Data persistence

## Running Locally
```bash
cd "leave-management-system"
python -m http.server 8000
```
Then visit http://localhost:8000

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support
- Mobile: Responsive design

## Troubleshooting
- If you see "Firebase initialization failed" - this is normal in demo mode
- Login/Register buttons show demo messages until Firebase is configured
- All UI elements should work without JavaScript errors
