# USIU Leave Management System

A comprehensive web-based leave management and attendance tracking system built for USIU staff members. This system streamlines the entire leave request and approval process with role-based access control, automated leave balance calculations, and comprehensive reporting features.

![USIU Leave System](https://img.shields.io/badge/Version-1.0.0-blue)
![Firebase](https://img.shields.io/badge/Backend-Firebase-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Features

### For Staff Members
- **Leave Request Management**: Submit and track leave requests with real-time status updates
- **Multiple Leave Types**: Annual, sick, maternity, paternity, unpaid, study, and compassionate leave
- **Leave Balance Tracking**: Automated calculation and display of remaining leave days
- **Attendance Recording**: Quick and easy attendance marking with historical records
- **Request History**: View all past leave requests with filtering options
- **Email Notifications**: Receive updates on request status changes

### For Administrators/Managers
- **Request Approval Workflow**: Review and approve/reject leave requests with comments
- **Department Filtering**: View requests by department, leave type, or status
- **Analytics Dashboard**: Visual charts showing leave trends and patterns
- **Attendance Overview**: Monitor staff attendance across the organization
- **Report Generation**: Export leave data to CSV for external analysis
- **Staff Management**: View all staff members and their leave balances

### System Features
- **Role-Based Access Control**: Separate interfaces for staff and administrators
- **Secure Authentication**: Firebase authentication with email/password
- **Real-time Updates**: Instant synchronization across all users
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with USIU branding
- **Data Persistence**: All data securely stored in Firebase Firestore

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic markup for accessibility
- **CSS3**: Custom styling with CSS variables and animations
- **JavaScript (ES6+)**: Modern vanilla JavaScript
- **Chart.js**: Data visualization for analytics

### Backend
- **Firebase Authentication**: Secure user authentication
- **Firebase Firestore**: NoSQL database for real-time data
- **Firebase Hosting**: Fast and secure web hosting (optional)

### Additional Tools
- **Google Fonts**: Poppins font family for typography
- **SVG Icons**: Scalable vector graphics for icons

## 📋 Prerequisites

Before you begin, ensure you have:
- A Google account for Firebase
- A web browser (Chrome, Firefox, Safari, or Edge)
- Basic understanding of Firebase Console
- Text editor (VS Code, Sublime Text, etc.) - optional

## 🚀 Installation & Setup

### 1. Download the System

Extract the ZIP file to your desired location:
```
leave-management-system/
├── index.html
├── staff-dashboard.html
├── admin-dashboard.html
├── css/
│   └── style.css
├── js/
│   ├── firebase-config.js
│   ├── auth.js
│   ├── main.js
│   ├── staff-dashboard.js
│   └── admin-dashboard.js
├── docs/
│   ├── FIREBASE_SETUP_GUIDE.md
│   └── EMAIL_SETUP_GUIDE.md
└── README.md
```

### 2. Set Up Firebase

Follow the detailed instructions in `docs/FIREBASE_SETUP_GUIDE.md`:

1. Create a Firebase project
2. Enable Email/Password authentication
3. Set up Firestore database
4. Configure security rules
5. Create an admin user
6. Update `js/firebase-config.js` with your configuration

### 3. Configure Email Notifications (Optional)

For email notifications, follow `docs/EMAIL_SETUP_GUIDE.md`:

1. Install Firebase Extensions for email
2. Configure SMTP settings
3. Deploy Cloud Functions for email triggers
4. Test email delivery

### 4. Deploy Your Application

Choose one of these deployment options:

#### Option A: Firebase Hosting (Recommended)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

#### Option B: GitHub Pages
1. Create a new GitHub repository
2. Push your code to the repository
3. Go to Settings > Pages
4. Select your branch and root folder
5. Your site will be live at `https://username.github.io/repo-name`

#### Option C: Local Testing
Simply open `index.html` in your web browser to test locally.

## 📖 User Guide

### First Time Setup

1. **Create Admin Account**:
   - Follow Firebase Setup Guide to create admin user manually
   - Admin credentials are needed to approve leave requests

2. **Register Staff Members**:
   - Staff can self-register using the registration form
   - Or admin can create accounts via Firebase Console

### For Staff Members

**Logging In:**
1. Open the application
2. Click "Login"
3. Enter your email and password
4. Click "Login"

**Submitting a Leave Request:**
1. Click "New Leave Request" button
2. Select leave type
3. Choose start and end dates
4. Enter reason for leave
5. Click "Submit Request"

**Marking Attendance:**
1. Go to Attendance section
2. Click "Mark Today's Attendance"
3. Confirmation will appear

**Viewing Leave Balance:**
- Your current leave balance is displayed on the dashboard
- Updates automatically when requests are approved

### For Administrators

**Reviewing Requests:**
1. Pending requests appear on the dashboard
2. Click "Approve" or "Reject" on any request
3. Optionally add a comment when rejecting
4. Staff member receives notification

**Generating Reports:**
1. Select date range (optional)
2. Click "Generate Report"
3. CSV file downloads automatically

**Viewing Attendance:**
1. Select a date
2. Click "View Attendance"
3. See all staff who marked attendance

## 🔧 Configuration

### Customizing Leave Types

Edit the leave type options in both dashboard HTML files:

```html
<option value="custom-leave">Custom Leave Type</option>
```

### Adjusting Leave Balance

Default leave balance is 21 days. To change:

1. Update `js/auth.js` in the register function:
```javascript
leaveBalance: 30, // Change to desired number
```

2. For existing users, update in Firebase Console:
   - Go to Firestore Database
   - Navigate to users collection
   - Edit the leaveBalance field

### Changing Colors/Branding

Update CSS variables in `css/style.css`:

```css
:root {
  --usiu-blue: #1a237e;      /* Primary color */
  --usiu-gold: #fdb913;       /* Accent color */
  /* Add more custom colors */
}
```

## 🔒 Security

### Authentication
- Email/password authentication via Firebase
- Secure password requirements (minimum 6 characters)
- Password reset functionality built-in

### Data Protection
- Firestore security rules enforce access control
- Users can only view/edit their own data
- Admins have elevated permissions
- All communication encrypted via HTTPS

### Best Practices
1. Never share admin credentials
2. Use strong passwords
3. Regularly review user access
4. Monitor Firebase usage
5. Keep Firebase SDK updated

## 📊 Database Structure

### Users Collection
```javascript
{
  name: "John Doe",
  email: "john@usiu.ac.ke",
  staffId: "USIU-001",
  department: "IT",
  role: "staff", // or "admin"
  leaveBalance: 21,
  createdAt: timestamp
}
```

### Leave Requests Collection
```javascript
{
  userId: "user_id",
  userName: "John Doe",
  userEmail: "john@usiu.ac.ke",
  staffId: "USIU-001",
  department: "IT",
  leaveType: "annual",
  startDate: "2025-02-01",
  endDate: "2025-02-05",
  days: 5,
  reason: "Family vacation",
  status: "pending", // "approved" or "rejected"
  createdAt: timestamp,
  approvedBy: "admin_id", // optional
  approvedAt: timestamp,  // optional
  adminComment: "..."     // optional
}
```

### Attendance Collection
```javascript
{
  userId: "user_id",
  userName: "John Doe",
  staffId: "USIU-001",
  department: "IT",
  date: "2025-01-27",
  status: "present",
  timestamp: timestamp
}
```

## 🐛 Troubleshooting

### Common Issues

**Issue: "Permission denied" errors**
- **Solution**: Check Firestore security rules are properly configured
- Verify user is authenticated before accessing data

**Issue: Cannot see dashboard after login**
- **Solution**: Clear browser cache and cookies
- Check browser console for JavaScript errors
- Verify Firebase configuration is correct

**Issue: Leave balance not updating**
- **Solution**: Check that approval function updates user document
- Verify days calculation is correct

**Issue: Emails not sending**
- **Solution**: Review EMAIL_SETUP_GUIDE.md
- Check Cloud Functions logs in Firebase Console
- Verify SMTP credentials

### Getting Help

1. Check the documentation in `/docs` folder
2. Review Firebase Console logs
3. Check browser console for errors
4. Verify Firebase configuration
5. Contact your system administrator

## 🔄 Updates & Maintenance

### Updating the System

1. Backup your Firebase data
2. Download new version
3. Update `firebase-config.js` with your credentials
4. Deploy updated files
5. Test thoroughly

### Regular Maintenance

- Review and update security rules quarterly
- Monitor Firebase usage and costs
- Backup Firestore data regularly
- Update Firebase SDK versions
- Review user access and permissions

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

- Development Team
- USIU IT Department
- HR Department

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Chart.js for data visualization
- Google Fonts for typography
- USIU-Africa for project requirements

## 📞 Support

For technical support:
- Email: it-support@usiu.ac.ke
- Phone: +254 123 456 789
- Office: IT Department, Main Campus

For HR-related queries:
- Email: hr@usiu.ac.ke
- Phone: +254 123 456 790
- Office: HR Department, Administration Block

## 🗺️ Roadmap

Future enhancements planned:
- [ ] Mobile app (Android/iOS)
- [ ] SMS notifications
- [ ] Leave calendar integration
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Document attachments
- [ ] Leave delegation
- [ ] Automated reminders

## 📸 Screenshots

### Landing Page
Professional landing page with feature highlights and easy access to login/registration.

### Staff Dashboard
Intuitive interface showing leave balance, request history, and attendance records.

### Admin Dashboard
Comprehensive management panel with analytics, approval workflow, and reporting tools.

---

**Version**: 1.0.0
**Last Updated**: January 2025
**Built with ❤️ for USIU-Africa**
