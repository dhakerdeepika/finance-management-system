import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Loan } from '../types';
import { Plus, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export function Loans() {
  const { loans, customers, addLoan, updateLoanStatus } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ customerId: '', amount: 0, interestRate: 0, durationMonths: 12, status: 'Pending' as Loan['status'] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || formData.amount <= 0 || formData.interestRate <= 0) {
      alert("Please fill all required fields correctly.");
      return;
    }
    addLoan(formData);
    setIsModalOpen(false);
    setFormData({ customerId: '', amount: 0, interestRate: 0, durationMonths: 12, status: 'Pending' });
  };

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.fullName || 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loan Management</h1>
          <p className="text-sm text-slate-500">Manage applications, approvals, and tracking.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" /> New Loan
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="p-4 font-medium">ID / Customer</th>
              <th className="p-4 font-medium">Amount / Rate</th>
              <th className="p-4 font-medium">Duration</th>
              <th className="p-4 font-medium">Progress</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loans.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50 transition">
                <td className="p-4">
                  <p className="font-semibold text-slate-800">{getCustomerName(l.customerId)}</p>
                  <p className="text-slate-500 text-xs font-mono">{l.id}</p>
                </td>
                <td className="p-4">
                  <p className="font-semibold text-slate-800">${l.amount.toLocaleString()}</p>
                  <p className="text-slate-500 text-xs">{l.interestRate}% APR</p>
                </td>
                <td className="p-4 text-slate-600">
                  {l.durationMonths} mths
                </td>
                <td className="p-4">
                  <div className="w-full bg-slate-200 rounded-full h-2.5 mb-1 max-w-[150px]">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${Math.min((l.amountPaid / l.amount) * 100, 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-500">${l.amountPaid.toLocaleString()} paid</p>
                </td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-1 text-xs font-semibold rounded-full",
                    l.status === 'Approved' ? "bg-emerald-100 text-emerald-700" :
                    l.status === 'Completed' ? "bg-purple-100 text-purple-700" :
                    l.status === 'Rejected' ? "bg-red-100 text-red-700" :
                    l.status === 'Active' ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-700"
                  )}>
                    {l.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {l.status === 'Pending' && (
                      <>
                        <button onClick={() => updateLoanStatus(l.id, 'Approved')} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition" title="Approve">
                          <CheckCircle2 className="w-5 h-5"/>
                        </button>
                        <button onClick={() => updateLoanStatus(l.id, 'Rejected')} className="text-red-600 hover:bg-red-50 p-1 rounded transition" title="Reject">
                          <XCircle className="w-5 h-5"/>
                        </button>
                      </>
                    )}
                    {l.status === 'Approved' && (
                       <button onClick={() => updateLoanStatus(l.id, 'Active')} className="text-blue-600 hover:bg-blue-50 p-1 rounded text-xs font-semibold transition" title="Activate Loan">
                         ACTIVATE
                       </button>
                    )}
                    {l.status === 'Active' && l.amountPaid >= l.amount && (
                       <button onClick={() => updateLoanStatus(l.id, 'Completed')} className="text-purple-600 hover:bg-purple-50 p-1 rounded text-xs font-semibold transition" title="Mark Completed">
                         COMPLETE
                       </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">No loans found. Create a new loan application.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

       {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">New Loan Application</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><FileText className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                <select required value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500">
                  <option value="" disabled>Select a customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                  <input required type="number" min="100" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Interest Rate (%)</label>
                  <input required type="number" min="0" step="0.1" value={formData.interestRate} onChange={e => setFormData({...formData, interestRate: Number(e.target.value)})} className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Months)</label>
                  <input required type="number" min="1" max="120" value={formData.durationMonths} onChange={e => setFormData({...formData, durationMonths: Number(e.target.value)})} className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500">
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">Create Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
