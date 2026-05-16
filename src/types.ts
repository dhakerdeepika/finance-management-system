export type UserRole = 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  kycStatus: 'Pending' | 'Approved' | 'Rejected';
  address: string;
  joinedDate: string;
}

export interface Loan {
  id: string;
  customerId: string;
  amount: number;
  interestRate: number;
  durationMonths: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed';
  applicationDate: string;
  amountPaid: number;
}

export interface Payment {
  id: string;
  loanId: string;
  customerId: string;
  amount: number;
  date: string;
  method: 'Bank Transfer' | 'Credit Card' | 'Cash' | 'Mobile Money';
  status: 'Completed' | 'Pending' | 'Failed';
}
