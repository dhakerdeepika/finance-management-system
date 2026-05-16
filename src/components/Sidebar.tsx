import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Receipt,
  LogOut
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/loans', icon: CreditCard, label: 'Loans' },
    { to: '/payments', icon: Receipt, label: 'Payments' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <CreditCard className="text-indigo-400" />
          LendAdmin
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Management System</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              isActive 
                ? "bg-indigo-600 text-white" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-red-400 hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout Admin</span>
        </button>
      </div>
    </div>
  );
}
