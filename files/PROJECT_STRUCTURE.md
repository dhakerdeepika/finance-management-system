# Finance Management System - Admin Panel
## Project Structure & Documentation

### 📁 Folder Organization

```
finance-admin-app/
├── src/
│   ├── navigation/
│   │   ├── RootNavigator.js          # Main navigation setup
│   │   ├── AuthNavigator.js          # Auth stack navigation
│   │   └── AppNavigator.js           # App stack navigation
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js        # Admin login screen
│   │   │   └── ForgotPasswordScreen.js
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardScreen.js    # Main dashboard
│   │   │   ├── StatsCard.js          # Reusable stats component
│   │   │   └── ChartComponent.js     # Charts for metrics
│   │   │
│   │   ├── customers/
│   │   │   ├── CustomersListScreen.js      # List all customers
│   │   │   ├── CustomerDetailsScreen.js    # View customer profile
│   │   │   ├── AddCustomerScreen.js        # Add new customer
│   │   │   ├── EditCustomerScreen.js       # Edit customer info
│   │   │   └── KYCUploadScreen.js          # KYC document upload
│   │   │
│   │   ├── loans/
│   │   │   ├── LoansListScreen.js          # List all loans
│   │   │   ├── LoanDetailsScreen.js        # View loan details
│   │   │   ├── AddLoanScreen.js            # Create new loan
│   │   │   ├── LoanApprovalScreen.js       # Approve/reject loans
│   │   │   └── RepaymentTrackingScreen.js  # Track repayments
│   │   │
│   │   ├── payments/
│   │   │   ├── PaymentsListScreen.js       # View payment history
│   │   │   ├── RecordPaymentScreen.js      # Record new payment
│   │   │   └── TransactionFilterScreen.js  # Filter transactions
│   │   │
│   │   └── settings/
│   │       ├── SettingsScreen.js
│   │       ├── UserManagementScreen.js
│   │       └── RolesPermissionsScreen.js
│   │
│   ├── services/
│   │   ├── firebaseConfig.js         # Firebase configuration
│   │   ├── authService.js            # Authentication logic
│   │   ├── customerService.js        # Customer CRUD operations
│   │   ├── loanService.js            # Loan management logic
│   │   ├── paymentService.js         # Payment operations
│   │   └── storageService.js         # File upload/download
│   │
│   ├── hooks/
│   │   ├── useAuth.js                # Authentication hook
│   │   ├── useCustomers.js           # Customers data hook
│   │   ├── useLoans.js               # Loans data hook
│   │   └── usePayments.js            # Payments data hook
│   │
│   ├── context/
│   │   ├── AuthContext.js            # Auth state management
│   │   ├── AppContext.js             # App-wide state
│   │   └── ThemeContext.js           # Theme state
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── LoadingSpinner.js
│   │   │   ├── ErrorBoundary.js
│   │   │   ├── ModalComponent.js
│   │   │   └── ToastNotification.js
│   │   │
│   │   ├── forms/
│   │   │   ├── TextInputField.js
│   │   │   ├── DatePickerField.js
│   │   │   ├── DropdownField.js
│   │   │   ├── FileUploadField.js
│   │   │   └── FormValidator.js
│   │   │
│   │   ├── cards/
│   │   │   ├── CustomerCard.js
│   │   │   ├── LoanCard.js
│   │   │   ├── PaymentCard.js
│   │   │   └── StatCard.js
│   │   │
│   │   └── tables/
│   │       ├── DataTable.js
│   │       ├── PaginationComponent.js
│   │       └── SortableColumn.js
│   │
│   ├── styles/
│   │   ├── colors.js                 # Color constants
│   │   ├── spacing.js                # Spacing/padding values
│   │   ├── typography.js             # Font sizes & styles
│   │   ├── globalStyles.js           # Global stylesheet
│   │   └── themes.js                 # Theme configurations
│   │
│   ├── utils/
│   │   ├── validation.js             # Input validation
│   │   ├── formatters.js             # Date/number formatting
│   │   ├── constants.js              # App constants
│   │   ├── errorHandler.js           # Error handling
│   │   └── permissions.js            # Role-based permissions
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   └── App.js                        # Entry point
│
├── functions/
│   ├── index.js                      # Firebase Cloud Functions
│   ├── loanApprovalFunction.js       # Loan approval logic
│   ├── paymentUpdateFunction.js      # Payment update logic
│   └── notificationFunction.js       # Send notifications
│
├── firebaseRules/
│   ├── firestore.rules               # Firestore security rules
│   ├── storage.rules                 # Storage security rules
│   └── database.rules                # Real-time database rules
│
├── .env                              # Environment variables (LOCAL ONLY)
├── .env.example                      # Environment template
├── package.json
├── firebase.json
├── app.json
└── README.md
```

---

## 🔧 Firebase Setup Guide

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Name: "Finance Admin System"
4. Enable Google Analytics (optional)

### Step 2: Add React Native App
1. In Firebase Console, click "Add app" → Select React Native icon
2. Register app as "finance-admin"
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)

### Step 3: Enable Firebase Services

**Authentication:**
- Go to Authentication → Sign-in method
- Enable Email/Password
- Enable Google Sign-in (optional)
- Set up custom claims for roles

**Firestore Database:**
- Create database in production mode
- Start in test mode for development

**Storage:**
- Create bucket for KYC documents
- Set retention policy for security

**Cloud Functions:**
- Deploy functions for business logic
- Set up triggers for loan approval, payment updates

### Step 4: Database Structure

```
Firestore Collections:

1. users/
   ├── {userId}
   │   ├── email: string
   │   ├── name: string
   │   ├── role: "admin" | "manager" | "operator"
   │   ├── phone: string
   │   ├── createdAt: timestamp
   │   ├── permissions: array
   │   └── isActive: boolean

2. customers/
   ├── {customerId}
   │   ├── basicInfo: {
   │   │   ├── fullName: string
   │   │   ├── email: string
   │   │   ├── phone: string
   │   │   ├── dateOfBirth: date
   │   │   └── address: string
   │   │ }
   │   ├── kycDetails: {
   │   │   ├── aadharNumber: string
   │   │   ├── panNumber: string
   │   │   ├── aadharDocument: string (storage path)
   │   │   ├── panDocument: string (storage path)
   │   │   └── verificationStatus: "pending" | "verified" | "rejected"
   │   │ }
   │   ├── employment: {
   │   │   ├── status: "employed" | "self-employed" | "unemployed"
   │   │   ├── company: string
   │   │   ├── designation: string
   │   │   └── monthlyIncome: number
   │   │ }
   │   ├── creditScore: number
   │   ├── createdAt: timestamp
   │   ├── lastUpdated: timestamp
   │   └── status: "active" | "inactive" | "blocked"

3. loans/
   ├── {loanId}
   │   ├── customerId: string (reference)
   │   ├── loanType: "personal" | "home" | "auto" | "education"
   │   ├── principal: number
   │   ├── interestRate: number
   │   ├── tenure: number (months)
   │   ├── status: "applied" | "approved" | "rejected" | "active" | "closed"
   │   ├── approvedAmount: number
   │   ├── disbursedAmount: number
   │   ├── disbursementDate: timestamp
   │   ├── dueDate: timestamp
   │   ├── repaidAmount: number
   │   ├── pendingAmount: number
   │   ├── approvedBy: string (userId)
   │   ├── approvalDate: timestamp
   │   ├── rejectionReason: string (if rejected)
   │   ├── documents: array of { name, url, uploadedAt }
   │   ├── timeline: array of { event, date, notes }
   │   ├── createdAt: timestamp
   │   └── lastUpdated: timestamp

4. payments/
   ├── {paymentId}
   │   ├── loanId: string (reference)
   │   ├── customerId: string (reference)
   │   ├── amount: number
   │   ├── paymentDate: timestamp
   │   ├── paymentMethod: "bank_transfer" | "upi" | "check" | "cash"
   │   ├── referenceNumber: string
   │   ├── status: "pending" | "completed" | "failed" | "reversed"
   │   ├── recordedBy: string (userId)
   │   ├── notes: string
   │   ├── transactionId: string
   │   └── createdAt: timestamp

5. approvals/
   ├── {approvalId}
   │   ├── loanId: string (reference)
   │   ├── requestedBy: string (userId)
   │   ├── approverEmail: string
   │   ├── status: "pending" | "approved" | "rejected"
   │   ├── comments: string
   │   ├── createdAt: timestamp
   │   └── reviewedAt: timestamp

6. auditLog/
   ├── {logId}
   │   ├── action: string
   │   ├── userId: string
   │   ├── documentType: string
   │   ├── documentId: string
   │   ├── changes: object
   │   ├── timestamp: timestamp
   │   └── ipAddress: string
```

---

## 🔐 Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isManager() {
      return isAuthenticated() && 
             (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager' ||
              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isManager());
      allow write: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Customers collection
    match /customers/{customerId} {
      allow read: if isAuthenticated();
      allow create: if isManager() && request.resource.data.createdAt == request.time;
      allow update: if isManager();
      allow delete: if isAdmin();
    }
    
    // Loans collection
    match /loans/{loanId} {
      allow read: if isAuthenticated();
      allow create: if isManager();
      allow update: if isManager();
      allow delete: if isAdmin();
    }
    
    // Payments collection
    match /payments/{paymentId} {
      allow read: if isAuthenticated();
      allow create: if isManager();
      allow update: if isManager();
      allow delete: if isAdmin();
    }
    
    // Audit logs (read-only)
    match /auditLog/{logId} {
      allow read: if isManager();
      allow write: if false;
    }
  }
}
```

---

## 📦 Installation & Setup

### Prerequisites
- Node.js >= 14
- npm or yarn
- React Native CLI
- Android Studio (for Android) / Xcode (for iOS)
- Firebase CLI

### Step 1: Clone & Install Dependencies

```bash
git clone <your-repo>
cd finance-admin-app
npm install
# or
yarn install
```

### Step 2: Install Firebase

```bash
npm install firebase react-native-firebase-app react-native-firebase-auth
# or with Expo
expo install firebase @react-native-firebase/app @react-native-firebase/auth
```

### Step 3: Configure Environment Variables

Create `.env` file in root directory:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# App settings
API_BASE_URL=https://your-api.com
ENV=development
LOG_LEVEL=debug
```

### Step 4: Run the Application

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android

# Or with Expo
expo start
```

---

## 🎯 Key Features Implementation

### 1. Authentication Flow
- Email/Password login with Firebase Authentication
- Session management with Context API
- Automatic token refresh
- Secure logout

### 2. Role-Based Access Control
- Admin: Full access to all modules
- Manager: Can manage customers, loans, approve/reject
- Operator: Can view and record transactions only

### 3. Data Validation
- Input validation for forms
- Firebase rules for data integrity
- Real-time error handling

### 4. Responsive Design
- Mobile-first approach
- Adapts to tablets
- Touch-optimized UI

### 5. Offline Support
- Local caching with AsyncStorage
- Sync when online
- Offline-first architecture

---

## 📊 Performance Optimization

1. **Code Splitting**: Lazy load screens
2. **Image Optimization**: Compress and cache images
3. **Database Indexing**: Create Firestore indexes
4. **Pagination**: Implement for large datasets
5. **Memoization**: Use React.memo for components

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# Build for production
npm run build
```

---

## 📝 Documentation

- **API Docs**: See `docs/API.md`
- **Component Guide**: See `docs/COMPONENTS.md`
- **Firebase Setup**: See `docs/FIREBASE_SETUP.md`

---

## 🚀 Deployment

### Firebase Hosting
```bash
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Play Store / App Store
Follow platform-specific guidelines for app submission.

---

## 📞 Support & Troubleshooting

See `docs/TROUBLESHOOTING.md` for common issues.

---

**Last Updated**: May 2026
**Version**: 1.0.0
