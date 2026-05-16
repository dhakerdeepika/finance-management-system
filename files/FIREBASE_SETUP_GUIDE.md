# Firebase Setup & Deployment Guide

## 📋 Pre-requisites

- Firebase account (https://firebase.google.com)
- Firebase CLI installed (`npm install -g firebase-tools`)
- Node.js >= 14.x
- React Native development environment set up

---

## 🔧 Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
- Visit https://console.firebase.google.com
- Click "Create a new project" or use existing project
- Project name: "FinanceAdminSystem"
- Select billing account
- Enable Google Analytics (optional)
- Create project

### 1.2 Register React Native App
1. From Firebase console, click "Add app" 
2. Select **Web** platform (for development/testing)
3. App name: "finance-admin-web"
4. Copy the firebase config:

```javascript
// Your Firebase config will look like this:
const firebaseConfig = {
  apiKey: "AIz...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "12345...",
  appId: "1:12345:web:abcd..."
};
```

5. Store this config securely in `.env` file

---

## 🔑 Step 2: Enable Firebase Services

### 2.1 Enable Authentication

1. Navigate to **Authentication** section
2. Go to **Sign-in method** tab
3. Enable:
   - **Email/Password** - Required
   - **Google Sign-in** - Optional
4. Set password requirements:
   - Minimum 6 characters
   - At least one uppercase letter
   - At least one number

### 2.2 Configure Firebase Auth Emulator (Dev)

```bash
# Install emulator
firebase emulators:start

# This will run auth emulator on http://localhost:9099
```

### 2.3 Set Custom Claims for Roles

Create a Cloud Function to set custom claims:

```javascript
// functions/setCustomClaims.js
const admin = require('firebase-admin');

exports.setCustomClaims = admin.auth().setCustomUserClaims(uid, {
  role: 'admin', // or 'manager', 'operator'
  permissions: ['manage_customers', 'manage_loans', ...]
});
```

---

## 📊 Step 3: Setup Firestore Database

### 3.1 Create Firestore Database

1. Go to **Firestore Database** in Firebase console
2. Click **Create database**
3. Select region: **asia-south1** (for India)
4. Start in **Production mode** (but set up security rules)

### 3.2 Create Collections

Create the following collections:

```
1. users
2. customers
3. loans
4. payments
5. approvals
6. auditLog
```

### 3.3 Create Composite Indexes

For complex queries, create indexes:

```
Collection: loans
Fields to index:
- status (Ascending)
- createdAt (Descending)

Collection: payments
Fields to index:
- loanId (Ascending)
- paymentDate (Descending)
```

Go to Firestore → Indexes → Create composite index

### 3.4 Set Security Rules

Replace default rules with:

```
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuth() {
      return request.auth != null;
    }
    
    function isAdmin(userId) {
      return get(/databases/$(database)/documents/users/$(userId)).data.role == 'admin';
    }
    
    function isManager(userId) {
      return get(/databases/$(database)/documents/users/$(userId)).data.role in ['manager', 'admin'];
    }
    
    // Users - Admins can read/write
    match /users/{userId} {
      allow read: if isAuth() && (request.auth.uid == userId || isManager(request.auth.uid));
      allow write: if isAdmin(request.auth.uid);
    }
    
    // Customers - Authenticated users can read, managers can write
    match /customers/{customerId} {
      allow read: if isAuth();
      allow create, update: if isManager(request.auth.uid);
      allow delete: if isAdmin(request.auth.uid);
    }
    
    // Loans - Similar to customers
    match /loans/{loanId} {
      allow read: if isAuth();
      allow create, update: if isManager(request.auth.uid);
      allow delete: if isAdmin(request.auth.uid);
    }
    
    // Payments - Record payments with permission
    match /payments/{paymentId} {
      allow read: if isAuth();
      allow create, update: if isManager(request.auth.uid);
      allow delete: if isAdmin(request.auth.uid);
    }
    
    // Audit logs - Read only for managers
    match /auditLog/{logId} {
      allow read: if isManager(request.auth.uid);
      allow write: if false;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## 💾 Step 4: Setup Cloud Storage

### 4.1 Create Storage Bucket

1. Go to **Storage** in Firebase console
2. Click **Create bucket**
3. Bucket location: **asia-south1** (India)
4. Choose **Standard** storage class
5. Bucket name: `your-project.appspot.com`

### 4.2 Set Storage Security Rules

```
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Allow authenticated users to read
    match /kyc/{customerId}/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024;
      allow delete: if request.auth.uid == request.resource.metadata.userId;
    }
    
    // Default deny all
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

Deploy:
```bash
firebase deploy --only storage:rules
```

---

## ⚡ Step 5: Setup Cloud Functions

### 5.1 Initialize Functions

```bash
firebase init functions
# Select JavaScript
# Install dependencies
```

### 5.2 Create Sample Functions

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Function: Auto-approve loans based on criteria
exports.evaluateLoanApplication = functions.firestore
  .document('loans/{loanId}')
  .onCreate(async (snap, context) => {
    const loanData = snap.data();
    
    // Get customer details
    const customerRef = admin.firestore()
      .collection('customers')
      .doc(loanData.customerId);
    
    const customerDoc = await customerRef.get();
    const customer = customerDoc.data();
    
    // Auto-approve if criteria met
    if (customer.creditScore > 700 && loanData.principal < 500000) {
      await snap.ref.update({
        status: 'auto-approved',
        autoApprovedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    return null;
  });

// Function: Update loan status when payment received
exports.updateLoanAfterPayment = functions.firestore
  .document('payments/{paymentId}')
  .onCreate(async (snap, context) => {
    const paymentData = snap.data();
    
    const loanRef = admin.firestore()
      .collection('loans')
      .doc(paymentData.loanId);
    
    const loanDoc = await loanRef.get();
    const loan = loanDoc.data();
    
    const newRepaidAmount = (loan.repaidAmount || 0) + paymentData.amount;
    const newStatus = newRepaidAmount >= loan.approvedAmount ? 'closed' : loan.status;
    
    await loanRef.update({
      repaidAmount: newRepaidAmount,
      pendingAmount: Math.max(0, loan.approvedAmount - newRepaidAmount),
      status: newStatus,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return null;
  });

// Function: Send notification on loan approval
exports.notifyOnLoanApproval = functions.firestore
  .document('loans/{loanId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    
    // If status changed to approved
    if (oldData.status !== 'approved' && newData.status === 'approved') {
      // Send email notification (integrate with SendGrid, etc.)
      console.log(`Loan ${context.params.loanId} approved!`);
    }
    
    return null;
  });
```

### 5.3 Deploy Functions

```bash
firebase deploy --only functions
```

---

## 🚀 Step 6: Environment Setup

### 6.1 Create .env file

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# App Configuration
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:3000
REACT_APP_LOG_LEVEL=debug

# Features
REACT_APP_ENABLE_OFFLINE=true
REACT_APP_CACHE_TIMEOUT=3600
```

### 6.2 Load .env in app

```javascript
// src/config/index.js
import Constants from 'expo-constants';

export const config = {
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  },
  env: process.env.REACT_APP_ENV || 'development',
  logLevel: process.env.REACT_APP_LOG_LEVEL || 'info',
};
```

---

## 🧪 Step 7: Testing Setup

### 7.1 Run Emulator Suite

```bash
# Install emulator
npm install -g @firebase/cli

# Start all emulators
firebase emulators:start

# This starts:
# - Auth emulator on :9099
# - Firestore on :8080
# - Storage on :9199
```

### 7.2 Connect App to Emulators (Dev)

```javascript
// src/services/firebaseConfig.js
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

if (process.env.REACT_APP_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

---

## 📦 Step 8: Build & Deploy

### 8.1 Build for Production

```bash
# Build React Native app
npm run build

# For web
npm run build:web

# For Android
npm run build:android

# For iOS
npm run build:ios
```

### 8.2 Deploy to Firebase Hosting

```bash
# Login to Firebase
firebase login

# Deploy to hosting
firebase deploy --only hosting

# Deploy only specific resources
firebase deploy --only firestore
firebase deploy --only storage
firebase deploy --only functions
firebase deploy --only hosting
```

### 8.3 View Deployment Status

```bash
# Check deployment history
firebase apps:list

# View logs
firebase functions:log
firebase firestore:indexes

# Monitor performance
# Go to Firebase Console → Performance
```

---

## 🔒 Security Best Practices

### 8.1 API Keys Security
- Never commit `.env` to version control
- Use `.env.example` as template
- Rotate API keys regularly
- Use Firebase App Check for additional security

### 8.2 Data Security
- Enable Firestore backups
- Use encryption at rest (automatic)
- Regular security audits
- Implement rate limiting

### 8.3 Access Control
- Use custom claims for roles
- Implement row-level security
- Regular permission reviews
- Audit all data access

---

## 📊 Monitoring & Maintenance

### 9.1 Monitor Performance
- Go to Firebase Console → Performance
- Set up alerts for errors
- Monitor database performance
- Review function execution times

### 9.2 Backup Strategy
- Enable Firestore automatic backups
- Export data monthly
- Test restore procedures
- Keep backups secure

### 9.3 Cost Optimization
- Set up budget alerts
- Monitor Cloud Function usage
- Clean up old data
- Optimize database queries

---

## 🆘 Troubleshooting

### Issue: "Permission denied" errors
**Solution**: Check Firestore security rules and ensure user has required role

### Issue: "CORS" errors
**Solution**: Configure Firebase Hosting headers in firebase.json

### Issue: "Quota exceeded" errors
**Solution**: Check Firebase pricing plan and upgrade if needed

### Issue: Functions not executing
**Solution**: Check function logs: `firebase functions:log`

---

## 📞 Support

- Firebase Documentation: https://firebase.google.com/docs
- Firebase CLI: https://firebase.google.com/docs/cli
- Community: https://stackoverflow.com/questions/tagged/firebase

---

**Last Updated**: May 2026
**Version**: 1.0.0
