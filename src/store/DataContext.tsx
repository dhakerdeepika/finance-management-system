import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Loan, Payment } from '../types';

// Initial Mock Data
const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', fullName: 'John Doe', email: 'john@example.com', phone: '+1 555-0100', kycStatus: 'Approved', address: '123 Main St, NY', joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'c2', fullName: 'Jane Smith', email: 'jane@example.com', phone: '+1 555-0101', kycStatus: 'Pending', address: '456 Oak Ave, CA', joinedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
];

const MOCK_LOANS: Loan[] = [
  { id: 'l1', customerId: 'c1', amount: 5000, interestRate: 5.5, durationMonths: 12, status: 'Active', applicationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), amountPaid: 450 },
  { id: 'l2', customerId: 'c2', amount: 15000, interestRate: 6.0, durationMonths: 24, status: 'Pending', applicationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), amountPaid: 0 },
];

const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', loanId: 'l1', customerId: 'c1', amount: 450, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), method: 'Bank Transfer', status: 'Completed' },
];

interface DataContextType {
  customers: Customer[];
  loans: Loan[];
  payments: Payment[];
  addCustomer: (c: Omit<Customer, 'id' | 'joinedDate'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addLoan: (l: Omit<Loan, 'id' | 'applicationDate' | 'amountPaid'>) => void;
  updateLoanStatus: (id: string, status: Loan['status']) => void;
  addPayment: (p: Omit<Payment, 'id' | 'date'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS);
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);

  // Load from local storage
  useEffect(() => {
    const savedCustomers = localStorage.getItem('customers');
    const savedLoans = localStorage.getItem('loans');
    const savedPayments = localStorage.getItem('payments');
    
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedLoans) setLoans(JSON.parse(savedLoans));
    if (savedPayments) setPayments(JSON.parse(savedPayments));
  }, []);

  // Save to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('loans', JSON.stringify(loans));
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [customers, loans, payments]);

  const addCustomer = (c: Omit<Customer, 'id' | 'joinedDate'>) => {
    const newCustomer: Customer = {
      ...c,
      id: `c${Date.now()}`,
      joinedDate: new Date().toISOString()
    };
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    // Optionally clean up loans and payments, but let's keep it simple
  };

  const addLoan = (l: Omit<Loan, 'id' | 'applicationDate' | 'amountPaid'>) => {
    const newLoan: Loan = {
      ...l,
      id: `l${Date.now()}`,
      applicationDate: new Date().toISOString(),
      amountPaid: 0,
    };
    setLoans(prev => [newLoan, ...prev]);
  };

  const updateLoanStatus = (id: string, status: Loan['status']) => {
    setLoans(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const addPayment = (p: Omit<Payment, 'id' | 'date'>) => {
    const newPayment: Payment = {
      ...p,
      id: `p${Date.now()}`,
      date: new Date().toISOString()
    };
    setPayments(prev => [newPayment, ...prev]);
    
    // Auto update loan amount Paid
    if (p.status === 'Completed') {
      setLoans(prev => prev.map(l => {
        if (l.id === p.loanId) {
          return { ...l, amountPaid: l.amountPaid + p.amount };
        }
        return l;
      }));
    }
  };

  return (
    <DataContext.Provider value={{
      customers, loans, payments,
      addCustomer, updateCustomer, deleteCustomer,
      addLoan, updateLoanStatus, addPayment
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
