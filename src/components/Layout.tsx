import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../store/AuthContext';
import { Bell, Search, UserCircle } from 'lucide-react';

export function Layout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 text-slate-400 w-96 bg-slate-50 px-3 py-2 rounded-md border border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
            <Search className="w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search customers, loans..." 
              className="bg-transparent border-none outline-none text-sm w-full text-slate-800"
            />
          </div>
          
          <div className="flex items-center gap-6 text-slate-600">
            <button className="hover:text-indigo-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-sm text-right">
                <p className="font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
              <UserCircle className="w-8 h-8 text-slate-400" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
