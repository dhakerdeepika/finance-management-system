import React, { useMemo } from 'react';
import { useData } from '../store/DataContext';
import { Activity, Users, CreditCard, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

export function Dashboard() {
  const { customers, loans, payments } = useData();

  const stats = useMemo(() => {
    const totalLoans = loans.reduce((acc, curr) => acc + curr.amount, 0);
    const activeLoans = loans.filter(l => l.status === 'Active' || l.status === 'Pending').length;
    const totalPayments = payments.reduce((acc, p) => p.status === 'Completed' ? acc + p.amount : acc, 0);
    const outstanding = totalLoans - totalPayments;

    return {
      totalCustomers: customers.length,
      activeLoans,
      totalLoansArranged: totalLoans,
      outstandingAmount: outstanding
    };
  }, [customers, loans, payments]);

  const loanStatusData = useMemo(() => {
    const statusCounts = loans.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [loans]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

  const recentActivity = [...loans, ...payments]
    .sort((a, b) => {
      const dateA = new Date('applicationDate' in a ? a.applicationDate : a.date).getTime();
      const dateB = new Date('applicationDate' in b ? b.applicationDate : b.date).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of lending operations and metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          icon={Users} 
          trend="+12% from last month" 
          trendType="positive"
        />
        <StatCard 
          title="Active/Pending Loans" 
          value={stats.activeLoans} 
          icon={Activity} 
          trend="3 requires attention"
          trendType="neutral"
        />
        <StatCard 
          title="Total Originatons" 
          value={`$${stats.totalLoansArranged.toLocaleString()}`} 
          icon={CreditCard} 
          trend="+5% from last month"
          trendType="positive"
        />
        <StatCard 
          title="Outstanding Portfolio" 
          value={`$${stats.outstandingAmount.toLocaleString()}`} 
          icon={DollarSign} 
          trend="-2% collection rate"
          trendType="negative"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((item) => {
              const isLoan = 'applicationDate' in item;
              const date = new Date(isLoan ? item.applicationDate : item.date);
              const customer = customers.find(c => c.id === item.customerId);
              
              return (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isLoan ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                      {isLoan ? <CreditCard className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {isLoan ? 'New Loan Application' : 'Payment Received'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {customer?.fullName || 'Unknown Customer'} • {format(date, 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">
                      ${item.amount.toLocaleString()}
                    </p>
                    <p className={cn(
                      "text-xs font-medium px-2 py-1 inline-flex rounded-full mt-1",
                      item.status === 'Approved' || item.status === 'Completed' ? "bg-emerald-100 text-emerald-700" :
                      item.status === 'Pending' ? "bg-amber-100 text-amber-700" :
                      item.status === 'Active' ? "bg-blue-100 text-blue-700" :
                      "bg-slate-100 text-slate-700"
                    )}>
                      {item.status}
                    </p>
                  </div>
                </div>
              );
            })}
            {recentActivity.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Loan Distribution</h3>
          <div className="flex-1 min-h-[300px]">
             {loanStatusData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={loanStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {loanStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-400 text-sm">No loan data available.</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendType }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-slate-400" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className={cn(
          "text-sm font-medium",
          trendType === 'positive' ? "text-emerald-600" :
          trendType === 'negative' ? "text-red-600" :
          "text-slate-500"
        )}>
          {trend}
        </p>
      </div>
    </div>
  );
}
