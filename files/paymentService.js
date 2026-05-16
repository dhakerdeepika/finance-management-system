// src/services/paymentService.js
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import AuthService from './authService';
import LoanService from './loanService';

class PaymentService {
  /**
   * Record new payment
   */
  static async recordPayment(paymentData, recordedByUserId) {
    try {
      const paymentRef = doc(collection(db, 'payments'));

      const newPayment = {
        loanId: paymentData.loanId,
        customerId: paymentData.customerId,
        amount: parseFloat(paymentData.amount),
        paymentDate: Timestamp.fromDate(new Date(paymentData.paymentDate)),
        paymentMethod: paymentData.paymentMethod, // bank_transfer, upi, check, cash
        referenceNumber: paymentData.referenceNumber,
        status: 'completed', // pending, completed, failed, reversed
        recordedBy: recordedByUserId,
        notes: paymentData.notes || '',
        transactionId: this.generateTransactionId(),
        createdAt: new Date(),
      };

      await setDoc(paymentRef, newPayment);

      // Update loan repayment status
      await LoanService.updateRepayment(paymentData.loanId, paymentData.amount, recordedByUserId);

      // Log audit action
      await AuthService.logAuditAction(
        recordedByUserId,
        'RECORD_PAYMENT',
        'payments',
        paymentRef.id,
        { loanId: paymentData.loanId, amount: paymentData.amount }
      );

      return {
        success: true,
        paymentId: paymentRef.id,
        message: 'Payment recorded successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get payment by ID
   */
  static async getPaymentById(paymentId) {
    try {
      const paymentDoc = await getDoc(doc(db, 'payments', paymentId));

      if (!paymentDoc.exists()) {
        return {
          success: false,
          error: 'Payment not found',
        };
      }

      return {
        success: true,
        payment: {
          id: paymentDoc.id,
          ...paymentDoc.data(),
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
   * Get all payments with filters
   */
  static async getAllPayments(filters = {}) {
    try {
      const paymentsRef = collection(db, 'payments');
      let q = query(paymentsRef, orderBy('createdAt', 'desc'));

      if (filters.loanId) {
        q = query(
          paymentsRef,
          where('loanId', '==', filters.loanId),
          orderBy('createdAt', 'desc')
        );
      }

      if (filters.customerId) {
        q = query(
          paymentsRef,
          where('customerId', '==', filters.customerId),
          orderBy('createdAt', 'desc')
        );
      }

      if (filters.paymentMethod) {
        q = query(
          paymentsRef,
          where('paymentMethod', '==', filters.paymentMethod),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const payments = [];

      snapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        payments,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get payments by loan
   */
  static async getPaymentsByLoan(loanId) {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, where('loanId', '==', loanId), orderBy('paymentDate', 'desc'));
      const snapshot = await getDocs(q);

      const payments = [];
      snapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        payments,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get payments by customer
   */
  static async getPaymentsByCustomer(customerId) {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef,
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      const payments = [];
      snapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        payments,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get payments within date range
   */
  static async getPaymentsByDateRange(startDate, endDate) {
    try {
      const paymentsRef = collection(db, 'payments');
      const startTimestamp = Timestamp.fromDate(new Date(startDate));
      const endTimestamp = Timestamp.fromDate(new Date(endDate));

      const q = query(
        paymentsRef,
        where('paymentDate', '>=', startTimestamp),
        where('paymentDate', '<=', endTimestamp),
        orderBy('paymentDate', 'desc')
      );

      const snapshot = await getDocs(q);
      const payments = [];

      snapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        payments,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get transaction summary by payment method
   */
  static async getTransactionSummary() {
    try {
      const paymentsRef = collection(db, 'payments');
      const snapshot = await getDocs(paymentsRef);

      const summary = {
        bank_transfer: 0,
        upi: 0,
        check: 0,
        cash: 0,
        total: 0,
      };

      snapshot.forEach((doc) => {
        const data = doc.data();
        const amount = data.amount || 0;
        summary[data.paymentMethod] = (summary[data.paymentMethod] || 0) + amount;
        summary.total += amount;
      });

      return {
        success: true,
        summary,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get daily transaction report
   */
  static async getDailyReport(date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const result = await this.getPaymentsByDateRange(startOfDay, endOfDay);

      if (!result.success) {
        return result;
      }

      const payments = result.payments;
      let totalAmount = 0;
      const methodBreakdown = {};

      payments.forEach((payment) => {
        totalAmount += payment.amount;
        methodBreakdown[payment.paymentMethod] =
          (methodBreakdown[payment.paymentMethod] || 0) + payment.amount;
      });

      return {
        success: true,
        report: {
          date,
          totalTransactions: payments.length,
          totalAmount,
          methodBreakdown,
          payments,
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
   * Get monthly report
   */
  static async getMonthlyReport(year, month) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const result = await this.getPaymentsByDateRange(startDate, endDate);

      if (!result.success) {
        return result;
      }

      const payments = result.payments;
      let totalAmount = 0;
      const dayWiseTotal = {};
      const methodBreakdown = {};

      payments.forEach((payment) => {
        totalAmount += payment.amount;

        const paymentDate = payment.paymentDate.toDate
          ? payment.paymentDate.toDate()
          : new Date(payment.paymentDate);
        const day = paymentDate.toISOString().split('T')[0];

        dayWiseTotal[day] = (dayWiseTotal[day] || 0) + payment.amount;
        methodBreakdown[payment.paymentMethod] =
          (methodBreakdown[payment.paymentMethod] || 0) + payment.amount;
      });

      return {
        success: true,
        report: {
          year,
          month,
          totalTransactions: payments.length,
          totalAmount,
          methodBreakdown,
          dayWiseTotal,
          payments,
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
   * Generate unique transaction ID
   */
  static generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `TXN-${timestamp}-${random}`;
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStats() {
    try {
      const paymentsRef = collection(db, 'payments');
      const snapshot = await getDocs(paymentsRef);

      let totalPayments = 0;
      let totalAmount = 0;
      let completedPayments = 0;
      let failedPayments = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalPayments++;
        totalAmount += data.amount || 0;

        if (data.status === 'completed') completedPayments++;
        if (data.status === 'failed') failedPayments++;
      });

      return {
        success: true,
        stats: {
          totalPayments,
          totalAmount: Math.round(totalAmount * 100) / 100,
          completedPayments,
          failedPayments,
          avgPaymentAmount: totalPayments > 0 ? Math.round((totalAmount / totalPayments) * 100) / 100 : 0,
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

export default PaymentService;
