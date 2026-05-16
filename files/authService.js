// src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

class AuthService {
  /**
   * Register a new admin user (Admin only)
   */
  static async registerUser(email, password, userData) {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, {
        displayName: userData.name,
      });

      // Store user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: userData.name,
        phone: userData.phone || '',
        role: userData.role || 'operator',
        permissions: this.getRolePermissions(userData.role || 'operator'),
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
      });

      return {
        success: true,
        user: user.uid,
        message: 'User registered successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code),
        code: error.code,
      };
    }
  }

  /**
   * Login with email and password
   */
  static async loginUser(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role and permissions
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();

      // Check if user is active
      if (!userData.isActive) {
        await signOut(auth);
        return {
          success: false,
          error: 'Your account has been deactivated. Contact administrator.',
        };
      }

      // Update last login timestamp
      await setDoc(
        doc(db, 'users', user.uid),
        { lastLogin: new Date() },
        { merge: true }
      );

      // Log action
      await this.logAuditAction(user.uid, 'LOGIN', 'users', user.uid, {});

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: userData.name,
          role: userData.role,
          permissions: userData.permissions,
          phone: userData.phone,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code),
        code: error.code,
      };
    }
  }

  /**
   * Logout user
   */
  static async logoutUser() {
    try {
      const user = auth.currentUser;
      if (user) {
        await this.logAuditAction(user.uid, 'LOGOUT', 'users', user.uid, {});
      }
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent. Check your inbox.',
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;
        callback({
          user,
          userData,
          isAuthenticated: true,
        });
      } else {
        callback({
          user: null,
          userData: null,
          isAuthenticated: false,
        });
      }
    });
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return {
          success: true,
          user: userDoc.data(),
        };
      }
      return {
        success: false,
        error: 'User not found',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all users (Admin only)
   */
  static async getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = [];

      snapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        users: users.sort((a, b) => b.createdAt - a.createdAt),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update user role (Admin only)
   */
  static async updateUserRole(userId, newRole) {
    try {
      await setDoc(
        doc(db, 'users', userId),
        {
          role: newRole,
          permissions: this.getRolePermissions(newRole),
        },
        { merge: true }
      );

      await this.logAuditAction(
        auth.currentUser.uid,
        'UPDATE_ROLE',
        'users',
        userId,
        { newRole }
      );

      return {
        success: true,
        message: 'User role updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Deactivate user account (Admin only)
   */
  static async deactivateUser(userId) {
    try {
      await setDoc(
        doc(db, 'users', userId),
        { isActive: false },
        { merge: true }
      );

      await this.logAuditAction(
        auth.currentUser.uid,
        'DEACTIVATE_USER',
        'users',
        userId,
        {}
      );

      return {
        success: true,
        message: 'User deactivated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get role-based permissions
   */
  static getRolePermissions(role) {
    const permissions = {
      admin: [
        'view_dashboard',
        'manage_customers',
        'manage_loans',
        'manage_payments',
        'approve_loans',
        'manage_users',
        'view_reports',
        'manage_roles',
        'view_audit_logs',
      ],
      manager: [
        'view_dashboard',
        'manage_customers',
        'manage_loans',
        'manage_payments',
        'approve_loans',
        'view_reports',
      ],
      operator: [
        'view_dashboard',
        'view_customers',
        'view_loans',
        'manage_payments',
        'view_reports',
      ],
    };

    return permissions[role] || [];
  }

  /**
   * Check if user has permission
   */
  static hasPermission(userPermissions, requiredPermission) {
    return userPermissions && userPermissions.includes(requiredPermission);
  }

  /**
   * Log audit action
   */
  static async logAuditAction(userId, action, documentType, documentId, changes) {
    try {
      const auditRef = collection(db, 'auditLog');
      await setDoc(doc(auditRef), {
        userId,
        action,
        documentType,
        documentId,
        changes,
        timestamp: new Date(),
        ipAddress: '', // Would be captured from server in production
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  }

  /**
   * Get error message from Firebase error code
   */
  static getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Email not found. Please check and try again.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'Email is already registered.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Invalid email format.',
      'auth/user-disabled': 'This user account has been disabled.',
      'auth/too-many-requests': 'Too many login attempts. Please try later.',
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again.';
  }
}

export default AuthService;
