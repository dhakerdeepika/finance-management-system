// src/services/loanService.js
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import AuthService from './authService';

class LoanService {
  /**
   * Create new loan application
   */
  static async createLoan(loanData, createdByUserId) {
    try {
      const loanRef = doc(collection(db, 'loans'));

      const principalAmount = parseFloat(loanData.principalAmount);
      const interestRate = parseFloat(loanData.interestRate);
      const tenure = parseInt(loanData.tenure);

      const newLoan = {
        customerId: loanData.customerId,
        loanType: loanData.loanType, // personal, home, auto, education
        principal: principalAmount,
        interestRate,
        tenure, // months
        emi: this.calculateEMI(principalAmount, interestRate, tenure),
        totalAmount: this.calculateTotalAmount(principalAmount, interestRate, tenure),
        status: 'applied', // applied, approved, rejected, active, closed
        approvedAmount: 0,
        disbursedAmount: 0,
        repaidAmount: 0,
        pendingAmount: 0,
        approvedBy: null,
        approvalDate: null,
        disbursementDate: null,
        dueDate: null,
        rejectionReason: '',
        documents: loanData.documents || [],
        timeline: [
          {
            event: 'APPLIED',
            date: new Date(),
            notes: 'Loan application created',
          },
        ],
        createdAt: new Date(),
        createdBy: createdByUserId,
        lastUpdated: new Date(),
        notes: loanData.notes || '',
      };

      await setDoc(loanRef, newLoan);

      // Log audit action
      await AuthService.logAuditAction(
        createdByUserId,
        'CREATE_LOAN',
        'loans',
        loanRef.id,
        { customerId: loanData.customerId, loanType: loanData.loanType }
      );

      return {
        success: true,
        loanId: loanRef.id,
        message: 'Loan application created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get loan by ID
   */
  static async getLoanById(loanId) {
    try {
      const loanDoc = await getDoc(doc(db, 'loans', loanId));

      if (!loanDoc.exists()) {
        return {
          success: false,
          error: 'Loan not found',
        };
      }

      return {
        success: true,
        loan: {
          id: loanDoc.id,
          ...loanDoc.data(),
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
   * Get all loans with filters
   */
  static async getAllLoans(filters = {}) {
    try {
      const loansRef = collection(db, 'loans');
      let q = query(loansRef, orderBy('createdAt', 'desc'));

      if (filters.status) {
        q = query(loansRef, where('status', '==', filters.status), orderBy('createdAt', 'desc'));
      }

      if (filters.customerId) {
        q = query(
          loansRef,
          where('customerId', '==', filters.customerId),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const loans = [];

      snapshot.forEach((doc) => {
        loans.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        loans,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get loans by status
   */
  static async getLoansByStatus(status) {
    try {
      const loansRef = collection(db, 'loans');
      const q = query(loansRef, where('status', '==', status));
      const snapshot = await getDocs(q);

      const loans = [];
      snapshot.forEach((doc) => {
        loans.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        loans,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get loans by customer
   */
  static async getLoansByCustomer(customerId) {
    try {
      const loansRef = collection(db, 'loans');
      const q = query(loansRef, where('customerId', '==', customerId));
      const snapshot = await getDocs(q);

      const loans = [];
      snapshot.forEach((doc) => {
        loans.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        loans: loans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Approve loan application
   */
  static async approveLoan(loanId, approvedAmount, approvedBy, notes = '') {
    try {
      const loanRef = doc(db, 'loans', loanId);

      const disbursementDate = new Date();
      const loanDoc = await getDoc(loanRef);
      const loanData = loanDoc.data();
      const tenure = loanData.tenure;

      // Calculate due date
      const dueDate = new Date(disbursementDate);
      dueDate.setMonth(dueDate.getMonth() + tenure);

      const updateData = {
        status: 'approved',
        approvedAmount: parseFloat(approvedAmount),
        approvedBy,
        approvalDate: new Date(),
        disbursementDate,
        dueDate,
        notes,
        lastUpdated: new Date(),
        timeline: [
          ...loanData.timeline,
          {
            event: 'APPROVED',
            date: new Date(),
            notes: `Approved for ₹${approvedAmount}`,
          },
        ],
      };

      await updateDoc(loanRef, updateData);

      // Log audit action
      await AuthService.logAuditAction(
        approvedBy,
        'APPROVE_LOAN',
        'loans',
        loanId,
        { approvedAmount }
      );

      return {
        success: true,
        message: 'Loan approved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Reject loan application
   */
  static async rejectLoan(loanId, rejectionReason, rejectedBy) {
    try {
      const loanRef = doc(db, 'loans', loanId);
      const loanDoc = await getDoc(loanRef);
      const loanData = loanDoc.data();

      const updateData = {
        status: 'rejected',
        rejectionReason,
        lastUpdated: new Date(),
        timeline: [
          ...loanData.timeline,
          {
            event: 'REJECTED',
            date: new Date(),
            notes: rejectionReason,
          },
        ],
      };

      await updateDoc(loanRef, updateData);

      // Log audit action
      await AuthService.logAuditAction(
        rejectedBy,
        'REJECT_LOAN',
        'loans',
        loanId,
        { rejectionReason }
      );

      return {
        success: true,
        message: 'Loan rejected successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Disburse loan amount
   */
  static async disburseLoan(loanId, disbursedAmount, disbursedBy) {
    try {
      const loanRef = doc(db, 'loans', loanId);
      const loanDoc = await getDoc(loanRef);
      const loanData = loanDoc.data();

      const newDisbursedAmount = (loanData.disbursedAmount || 0) + parseFloat(disbursedAmount);

      const updateData = {
        disbursedAmount: newDisbursedAmount,
        status: newDisbursedAmount >= loanData.approvedAmount ? 'active' : 'approved',
        pendingAmount: loanData.approvedAmount - newDisbursedAmount,
        lastUpdated: new Date(),
        timeline: [
          ...loanData.timeline,
          {
            event: 'DISBURSED',
            date: new Date(),
            notes: `Disbursed amount: ₹${disbursedAmount}`,
          },
        ],
      };

      await updateDoc(loanRef, updateData);

      // Log audit action
      await AuthService.logAuditAction(
        disbursedBy,
        'DISBURSE_LOAN',
        'loans',
        loanId,
        { disbursedAmount }
      );

      return {
        success: true,
        message: 'Loan amount disbursed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update loan repayment status
   */
  static async updateRepayment(loanId, repaidAmount, updatedBy) {
    try {
      const loanRef = doc(db, 'loans', loanId);
      const loanDoc = await getDoc(loanRef);
      const loanData = loanDoc.data();

      const totalRepaid = (loanData.repaidAmount || 0) + parseFloat(repaidAmount);
      const pendingAmount = loanData.approvedAmount - totalRepaid;
      const newStatus =
        pendingAmount <= 0
          ? 'closed'
          : loanData.status === 'approved'
            ? 'active'
            : loanData.status;

      const updateData = {
        repaidAmount: totalRepaid,
        pendingAmount: Math.max(0, pendingAmount),
        status: newStatus,
        lastUpdated: new Date(),
        timeline: [
          ...loanData.timeline,
          {
            event: 'REPAID',
            date: new Date(),
            notes: `Payment received: ₹${repaidAmount}`,
          },
        ],
      };

      await updateDoc(loanRef, updateData);

      // Log audit action
      await AuthService.logAuditAction(
        updatedBy,
        'UPDATE_REPAYMENT',
        'loans',
        loanId,
        { repaidAmount }
      );

      return {
        success: true,
        message: 'Repayment recorded successfully',
        updatedLoan: updateData,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Calculate EMI (Equated Monthly Installment)
   */
  static calculateEMI(principal, annualRate, tenure) {
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) return principal / tenure;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi * 100) / 100;
  }

  /**
   * Calculate total loan amount
   */
  static calculateTotalAmount(principal, annualRate, tenure) {
    const emi = this.calculateEMI(principal, annualRate, tenure);
    return Math.round(emi * tenure * 100) / 100;
  }

  /**
   * Get loan statistics
   */
  static async getLoanStats() {
    try {
      const loansRef = collection(db, 'loans');
      const snapshot = await getDocs(loansRef);

      let totalLoans = 0;
      let approvedLoans = 0;
      let activeLoans = 0;
      let closedLoans = 0;
      let rejectedLoans = 0;
      let totalDisbursed = 0;
      let totalRepaid = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalLoans++;

        if (data.status === 'approved') approvedLoans++;
        if (data.status === 'active') activeLoans++;
        if (data.status === 'closed') closedLoans++;
        if (data.status === 'rejected') rejectedLoans++;

        totalDisbursed += data.disbursedAmount || 0;
        totalRepaid += data.repaidAmount || 0;
      });

      return {
        success: true,
        stats: {
          totalLoans,
          approvedLoans,
          activeLoans,
          closedLoans,
          rejectedLoans,
          totalDisbursed,
          totalRepaid,
          pendingAmount: totalDisbursed - totalRepaid,
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
   * Get pending approvals
   */
  static async getPendingApprovals() {
    try {
      const loansRef = collection(db, 'loans');
      const q = query(loansRef, where('status', '==', 'applied'));
      const snapshot = await getDocs(q);

      const pendingLoans = [];
      snapshot.forEach((doc) => {
        pendingLoans.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        loans: pendingLoans.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default LoanService;
