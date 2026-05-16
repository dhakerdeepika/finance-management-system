import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Customer } from '../types';
import { Plus, Edit2, Trash2, X, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', address: '', kycStatus: 'Pending' as Customer['kycStatus'] });

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        kycStatus: customer.kycStatus,
      });
    } else {
      setEditingId(null);
      setFormData({ fullName: '', email: '', phone: '', address: '', kycStatus: 'Pending' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCustomer(editingId, formData);
    } else {
      addCustomer(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Manage borrowers and their KYC status.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Joined Date</th>
              <th className="p-4 font-medium">KYC Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition">
                <td className="p-4">
                  <p className="font-semibold text-slate-800">{c.fullName}</p>
                  <p className="text-slate-500 text-xs">{c.address}</p>
                </td>
                <td className="p-4">
                  <p className="text-slate-800">{c.email}</p>
                  <p className="text-slate-500">{c.phone}</p>
                </td>
                <td className="p-4 text-slate-600">
                  {format(new Date(c.joinedDate), 'MMM dd, yyyy')}
                </td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-1 text-xs font-semibold rounded-full",
                    c.kycStatus === 'Approved' ? "bg-emerald-100 text-emerald-700" :
                    c.kycStatus === 'Rejected' ? "bg-red-100 text-red-700" :
                    "bg-amber-100 text-amber-700"
                  )}>
                    {c.kycStatus}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2 text-slate-400">
                    <button onClick={() => handleOpenModal(c)} className="hover:text-indigo-600"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => {if(confirm('Are you sure?')) deleteCustomer(c.id)}} className="hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No customers found. Add your first customer.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">KYC Status</label>
                <select value={formData.kycStatus} onChange={e => setFormData({...formData, kycStatus: e.target.value as any})} className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-indigo-500">
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
