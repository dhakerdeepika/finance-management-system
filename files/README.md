# 💰 Finance Management System - Admin Panel

A comprehensive React Native & Firebase-based admin dashboard for managing loans, customers, and payments for lending authorities.

## 🎯 Features Overview

### 📊 Dashboard
- **Real-time Statistics**: Active customers, approved loans, pending payments
- **Financial Metrics**: Total disbursed, repaid amounts, pending collections
- **Quick Actions**: Fast access to frequent operations
- **Performance Charts**: Visual loan and payment analytics

### 👥 Customer Management
- **Complete CRUD Operations**: Add, view, edit, delete customers
- **KYC Verification**: Upload and verify Aadhar, PAN documents
- **Credit Scoring**: Track customer creditworthiness
- **Customer Profile**: Comprehensive customer information dashboard
- **Search & Filters**: Find customers by name, email, phone

### 💳 Loan Management
- **Loan Applications**: Create and track loan applications
- **Approval Workflow**: Multi-level approval system for loans
- **EMI Calculation**: Automatic calculation of monthly installments
- **Disbursement Tracking**: Monitor fund disbursements
- **Repayment Tracking**: Track loan repayment status
- **Loan Timeline**: View complete loan lifecycle history

### 💸 Payment Management
- **Payment Recording**: Log payment transactions
- **Multiple Payment Methods**: Support for bank transfers, UPI, checks, cash
- **Payment Reports**: Generate daily/monthly payment reports
- **Transaction History**: Complete transaction audit trail
- **Payment Filters**: Filter by date, method, amount range

### 🔐 Security & Access Control
- **Firebase Authentication**: Secure email/password login
- **Role-Based Access**: Admin, Manager, Operator roles
- **Custom Permissions**: Granular permission control
- **Audit Logging**: Complete audit trail of all actions
- **Data Encryption**: End-to-end encrypted data storage

### 📱 User Experience
- **Responsive Design**: Works on phones, tablets, web
- **Offline Support**: Continue working offline, sync when online
- **Real-time Updates**: Live data synchronization
- **Intuitive UI**: Clean and easy-to-use interface
- **Dark Mode**: Eye-friendly dark theme support

---

## 🛠 Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - React Native development platform
- **React Navigation** - Screen routing and navigation
- **StyleSheet** - Native styling

### Backend & Database
- **Firebase Authentication** - Secure user authentication
- **Firestore** - Real-time NoSQL database
- **Cloud Storage** - Document storage and retrieval
- **Cloud Functions** - Serverless backend logic

### Development
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **Husky** - Git hooks

---

## 📦 Project Structure

```
finance-admin-app/
├── src/
│   ├── screens/              # All screen components
│   │   ├── auth/            # Login screens
│   │   ├── dashboard/       # Dashboard screens
│   │   ├── customers/       # Customer management
│   │   ├── loans/          # Loan management
│   │   ├── payments/       # Payment management
│   │   └── settings/       # App settings
│   │
│   ├── services/            # Firebase services
│   │   ├── firebaseConfig.js
│   │   ├── authService.js
│   │   ├── customerService.js
│   │   ├── loanService.js
│   │   ├── paymentService.js
│   │   └── storageService.js
│   │
│   ├── components/          # Reusable components
│   │   ├── common/         # Common components
│   │   ├── forms/          # Form components
│   │   ├── cards/          # Card components
│   │   └── tables/         # Table components
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useCustomers.js
│   │   ├── useLoans.js
│   │   └── usePayments.js
│   │
│   ├── context/             # Context API
│   │   ├── AuthContext.js
│   │   └── AppContext.js
│   │
│   ├── navigation/          # Navigation setup
│   │   ├── RootNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── AppNavigator.js
│   │
│   ├── styles/              # Style constants
│   │   ├── colors.js
│   │   ├── spacing.js
│   │   └── typography.js
│   │
│   ├── utils/               # Utility functions
│   │   ├── validation.js
│   │   ├── formatters.js
│   │   └── constants.js
│   │
│   ├── assets/              # Images, icons, fonts
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   └── App.js               # App entry point
│
├── functions/               # Firebase Cloud Functions
│   └── index.js
│
├── firebaseRules/           # Firebase security rules
│   ├── firestore.rules
│   ├── storage.rules
│   └── database.rules
│
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── firebase.json           # Firebase configuration
├── package.json            # Dependencies
├── app.json                # Expo configuration
└── README.md               # This file
```

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Install Node.js (14+) and npm (6+)
# Install Expo CLI
npm install -g expo-cli

# Install Firebase CLI
npm install -g firebase-tools
```

### 2. Clone Repository
```bash
git clone https://github.com/yourorg/finance-admin-app
cd finance-admin-app
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your Firebase credentials
nano .env
```

Add your Firebase config:
```env
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 5. Setup Firebase
```bash
# Login to Firebase
firebase login

# Initialize Firebase (if new project)
firebase init
```

See [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) for detailed setup.

### 6. Run Application

**Web:**
```bash
npm run web
# Opens http://localhost:19006
```

**Android:**
```bash
npm run android
# Requires Android Studio and emulator
```

**iOS:**
```bash
npm run ios
# Requires Xcode and iOS simulator
```

---

## 📚 API Documentation

### Authentication Service
```javascript
import AuthService from './services/authService';

// Login
const result = await AuthService.loginUser(email, password);

// Logout
await AuthService.logoutUser();

// Reset password
await AuthService.resetPassword(email);

// Get current user
const user = AuthService.getCurrentUser();
```

### Customer Service
```javascript
import CustomerService from './services/customerService';

// Create customer
const result = await CustomerService.createCustomer(customerData, userId);

// Get customer
const result = await CustomerService.getCustomerById(customerId);

// Update customer
await CustomerService.updateCustomer(customerId, updatedData, userId);

// Get all customers
const result = await CustomerService.getAllCustomers();
```

### Loan Service
```javascript
import LoanService from './services/loanService';

// Create loan
const result = await LoanService.createLoan(loanData, userId);

// Approve loan
await LoanService.approveLoan(loanId, approvedAmount, userId);

// Reject loan
await LoanService.rejectLoan(loanId, reason, userId);

// Get loan statistics
const stats = await LoanService.getLoanStats();
```

### Payment Service
```javascript
import PaymentService from './services/paymentService';

// Record payment
const result = await PaymentService.recordPayment(paymentData, userId);

// Get payments by loan
const payments = await PaymentService.getPaymentsByLoan(loanId);

// Generate report
const report = await PaymentService.getMonthlyReport(year, month);
```

---

## 🔐 Security

### Firestore Rules
Data is protected by security rules that ensure:
- Only authenticated users can access
- Role-based access control (Admin/Manager/Operator)
- Users can only access their own data
- Audit logs are immutable

### Storage Rules
Documents are protected by:
- Size limits (max 5MB per file)
- Type restrictions (PDF, PNG, JPEG only)
- User-level access control

### Authentication
- Firebase Authentication handles user login
- Passwords are hashed by Firebase
- Sessions are securely managed
- Logout clears all local data

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Run Linter
```bash
npm run lint
```

### Fix Linting Issues
```bash
npm run lint:fix
```

---

## 📊 Demo Credentials

For testing purposes, use these credentials:

**Admin Account:**
- Email: `admin@financeapp.com`
- Password: `Demo@123`

**Manager Account:**
- Email: `manager@financeapp.com`
- Password: `Demo@123`

**Operator Account:**
- Email: `operator@financeapp.com`
- Password: `Demo@123`

---

## 🚀 Deployment

### Deploy to Firebase Hosting
```bash
npm run build:web
firebase deploy --only hosting
```

### Deploy to Play Store (Android)
```bash
npm run build:android
# Follow Play Store submission guidelines
```

### Deploy to App Store (iOS)
```bash
npm run build:ios
# Follow App Store submission guidelines
```

### Deploy Cloud Functions
```bash
firebase deploy --only functions
```

---

## 📈 Performance Tips

1. **Code Splitting**: Load screens lazily to reduce bundle size
2. **Image Optimization**: Use compressed images, implement lazy loading
3. **Database Indexing**: Create Firestore indexes for frequently queried fields
4. **Pagination**: Implement pagination for large datasets
5. **Caching**: Use AsyncStorage for offline data caching
6. **Memoization**: Use React.memo() to prevent unnecessary re-renders

---

## 🐛 Troubleshooting

### "Permission denied" errors
- Check Firestore security rules
- Verify user authentication
- Check role permissions

### "Cannot find module" errors
- Run `npm install` again
- Clear node_modules: `rm -rf node_modules && npm install`

### Firebase connection issues
- Check internet connection
- Verify Firebase credentials in .env
- Check Firebase project status in console

### Emulator issues
- Ensure port 8080, 9099 are not in use
- Kill existing emulator: `firebase emulators:stop`
- Check firestore emulator setup

---

## 📞 Support & Contact

- **Documentation**: See `/docs` folder
- **Issues**: Report via GitHub Issues
- **Firebase Docs**: https://firebase.google.com/docs
- **React Native Docs**: https://reactnative.dev

---

## 📝 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📋 Changelog

### Version 1.0.0 (May 2026)
- Initial release
- All core features implemented
- Firebase integration complete
- Security rules deployed

---

**Made with ❤️ for Lending Authorities**

**Last Updated**: May 2026
