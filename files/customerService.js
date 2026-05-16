// src/services/customerService.js
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import AuthService from './authService';

class CustomerService {
  /**
   * Create new customer
   */
  static async createCustomer(customerData, createdByUserId) {
    try {
      const customerRef = doc(collection(db, 'customers'));

      const newCustomer = {
        basicInfo: {
          fullName: customerData.fullName,
          email: customerData.email,
          phone: customerData.phone,
          dateOfBirth: Timestamp.fromDate(new Date(customerData.dateOfBirth)),
          address: customerData.address,
          city: customerData.city,
          state: customerData.state,
          zipCode: customerData.zipCode,
        },
        kycDetails: {
          aadharNumber: customerData.aadharNumber,
          panNumber: customerData.panNumber,
          aadharDocument: '',
          panDocument: '',
          verificationStatus: 'pending',
          verifiedAt: null,
          verifiedBy: null,
        },
        employment: {
          status: customerData.employmentStatus,
          company: customerData.company || '',
          designation: customerData.designation || '',
          monthlyIncome: parseFloat(customerData.monthlyIncome) || 0,
        },
        creditScore: parseFloat(customerData.creditScore) || 0,
        status: 'active',
        createdAt: new Date(),
        createdBy: createdByUserId,
        lastUpdated: new Date(),
        notes: customerData.notes || '',
      };

      await setDoc(customerRef, newCustomer);

      // Log audit action
      await AuthService.logAuditAction(
        createdByUserId,
        'CREATE_CUSTOMER',
        'customers',
        customerRef.id,
        newCustomer
      );

      return {
        success: true,
        customerId: customerRef.id,
        message: 'Customer created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get customer by ID
   */
  static async getCustomerById(customerId) {
    try {
      const customerDoc = await getDoc(doc(db, 'customers', customerId));

      if (!customerDoc.exists()) {
        return {
          success: false,
          error: 'Customer not found',
        };
      }

      return {
        success: true,
        customer: {
          id: customerDoc.id,
          ...customerDoc.data(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all customers with pagination
   */
  static async getAllCustomers(pageSize = 20, pageNumber = 1, filters = {}) {
    try {
      const customersRef = collection(db, 'customers');
      let q = query(customersRef, orderBy('createdAt', 'desc'), limit(pageSize));

      // Apply filters
      if (filters.status) {
        q = query(customersRef, where('status', '==', filters.status));
      }

      if (filters.searchTerm) {
        // Note: Full-text search in Firestore requires Algolia or similar
        // For now, fetch all and filter client-side
      }

      const snapshot = await getDocs(q);
      const customers = [];

      snapshot.forEach((doc) => {
        customers.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        customers,
        total: customers.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update customer information
   */
  static async updateCustomer(customerId, updatedData, userId) {
    try {
      const customerRef = doc(db, 'customers', customerId);

      const updateData = {
        basicInfo: updatedData.basicInfo || {},
        employment: updatedData.employment || {},
        creditScore: updatedData.creditScore || 0,
        notes: updatedData.notes || '',
        lastUpdated: new Date(),
      };

      await updateDoc(customerRef, updateData);

      // Log audit action
      await AuthService.logAuditAction(
        userId,
        'UPDATE_CUSTOMER',
        'customers',
        customerId,
        updateData
      );

      return {
        success: true,
        message: 'Customer updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update customer KYC verification status
   */
  static async updateKYCVerification(customerId, verificationStatus, verifiedBy, documents = {}) {
    try {
      const customerRef = doc(db, 'customers', customerId);

      const kycUpdate = {
        'kycDetails.verificationStatus': verificationStatus,
        'kycDetails.verifiedBy': verifiedBy,
        'kycDetails.verifiedAt': new Date(),
        ...(documents.aadharDocument && { 'kycDetails.aadharDocument': documents.aadharDocument }),
        ...(documents.panDocument && { 'kycDetails.panDocument': documents.panDocument }),
      };

      await updateDoc(customerRef, kycUpdate);

      // Log audit action
      await AuthService.logAuditAction(
        verifiedBy,
        'UPDATE_KYC',
        'customers',
        customerId,
        { verificationStatus }
      );

      return {
        success: true,
        message: `Customer KYC status updated to ${verificationStatus}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get customers by status
   */
  static async getCustomersByStatus(status) {
    try {
      const customersRef = collection(db, 'customers');
      const q = query(customersRef, where('status', '==', status));
      const snapshot = await getDocs(q);

      const customers = [];
      snapshot.forEach((doc) => {
        customers.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        customers,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Search customers by phone or email
   */
  static async searchCustomers(searchTerm) {
    try {
      const customersRef = collection(db, 'customers');
      const snapshot = await getDocs(customersRef);

      const customers = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const basicInfo = data.basicInfo || {};

        if (
          basicInfo.phone?.includes(searchTerm) ||
          basicInfo.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          basicInfo.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          customers.push({
            id: doc.id,
            ...data,
          });
        }
      });

      return {
        success: true,
        customers,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Block/Unblock customer
   */
  static async toggleCustomerBlock(customerId, shouldBlock, userId) {
    try {
      const customerRef = doc(db, 'customers', customerId);

      await updateDoc(customerRef, {
        status: shouldBlock ? 'blocked' : 'active',
        lastUpdated: new Date(),
      });

      // Log audit action
      await AuthService.logAuditAction(
        userId,
        shouldBlock ? 'BLOCK_CUSTOMER' : 'UNBLOCK_CUSTOMER',
        'customers',
        customerId,
        {}
      );

      return {
        success: true,
        message: `Customer ${shouldBlock ? 'blocked' : 'unblocked'} successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete customer (soft delete)
   */
  static async deleteCustomer(customerId, userId) {
    try {
      const customerRef = doc(db, 'customers', customerId);

      await updateDoc(customerRef, {
        status: 'inactive',
        lastUpdated: new Date(),
      });

      // Log audit action
      await AuthService.logAuditAction(
        userId,
        'DELETE_CUSTOMER',
        'customers',
        customerId,
        {}
      );

      return {
        success: true,
        message: 'Customer deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get customer statistics
   */
  static async getCustomerStats() {
    try {
      const customersRef = collection(db, 'customers');
      const snapshot = await getDocs(customersRef);

      let totalCustomers = 0;
      let activeCustomers = 0;
      let blockedCustomers = 0;
      let kycVerified = 0;
      let totalIncome = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalCustomers++;

        if (data.status === 'active') activeCustomers++;
        if (data.status === 'blocked') blockedCustomers++;
        if (data.kycDetails?.verificationStatus === 'verified') kycVerified++;
        if (data.employment?.monthlyIncome) totalIncome += data.employment.monthlyIncome;
      });

      return {
        success: true,
        stats: {
          totalCustomers,
          activeCustomers,
          blockedCustomers,
          kycVerified,
          avgMonthlyIncome: totalCustomers > 0 ? totalIncome / totalCustomers : 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default CustomerService;
