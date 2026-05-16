import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Payment } from '../types';
import { Plus, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export function Payments() {
  const { payments, loans, customers, addPayment } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const activeLoans = loans.filter(l => l.status === 'Active');
  const [formData, setFormData] = useState({ 
    loanId: '', 
    amount: 0, 
    method: 'Bank Transfer' as Payment['method'],
    status: 'Completed' as Payment['status']
  });

  const selectedLoan = loans.find(l => l.id === formData.loanId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.loanId || formData.amount <= 0) {
      alert("Please fill all required fields correctly.");
      return;
    }
    
    // Add payment records
    addPayment({
      loanId: formData.loanId,
      customerId: selectedLoan!.customerId,
      amount: formData.amount,
      method: formData.method,
      status: formData.status
    });
    
    setIsModalOpen(false);
    setFormData({ loanId: '', amount: 0, method: 'Bank Transfer', status: 'Completed' });
  };

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.fullName || 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500">Record payments and view transaction history.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="p-4 font-medium">Transaction ID</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Customer & Loan</th>
              <th className="p-4 font-medium">Amount & Method</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {[...payments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition">
                <td className="p-4">
                  <p className="font-mono text-slate-600">{p.id}</p>
                </td>
                <td className="p-4 text-slate-800">
                  {format(new Date(p.date), 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="p-4">
                  <p className="font-semibold text-slate-800">{getCustomerName(p.customerId)}</p>
                  <p className="text-slate-500 text-xs">Loan: {p.loanId}</p>
                </td>
                <td className="p-4">
                  <p className="font-bold text-slate-800">${p.amount.toLocaleString()}</p>
                  <p className="text-slate-500 text-xs">{p.method}</p>
                </td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-1 text-xs font-semibold rounded-full",
                    p.status === 'Completed' ? "bg-emerald-100 text-emerald-700" :
                    p.status === 'Failed' ? "bg-red-100 text-red-700" :
                    "bg-amber-100 text-amber-700"
                  )}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No payment history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

       {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Record Payment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Receipt className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Loan (Active Loans Only)</label>
                <select required value={formData.loanId} onChange={e => setFormData({...formData, loanId: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500">
                  <option value="" disabled>Select a loan...</option>
                  {activeLoans.map(l => (
                    <option key={l.id} value={l.id}>
                      {getCustomerName(l.customerId)} - {l.id} (Rem: ${(l.amount - l.amountPaid).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount ($)</label>
                  <input 
                    required 
                    type="number" 
                    min="1" 
                    max={selectedLoan ? selectedLoan.amount - selectedLoan.amountPaid : undefined}
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})} 
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500" 
                  />
                  {selectedLoan && (
                    <p className="text-xs text-slate-500 mt-1">Maximum: ${(selectedLoan.amount - selectedLoan.amountPaid).toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                  <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value as any})} className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500">
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Mobile Money">Mobile Money</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500">
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={!selectedLoan} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
