import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, CheckSquare, Calendar, DollarSign, CalendarPlus, Download, CheckCircle, User } from 'lucide-react';

const data = [
  { name: 'Feb', present: 19, leave: 1 }, { name: 'Mar', present: 22, leave: 2 },
  { name: 'Apr', present: 20, leave: 1 }, { name: 'May', present: 23, leave: 0 },
  { name: 'Jun', present: 21, leave: 1 }, { name: 'Jul', present: 15, leave: 0 },
];

const EmployeeDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6 text-white font-sans pb-10">
      
      <div className="bg-[#111c44] rounded-2xl p-8 border border-blue-900/50 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-blue-300 text-sm font-semibold mb-1">Wednesday, July 2, 2026</p>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            Good morning, {user?.name?.split(' ')[0] || 'User'} <span className="animate-wave text-2xl">👋</span>
          </h2>
          <p className="text-blue-200/70 mb-6">You have 3 tasks due this week and 2 pending reviews.</p>
          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all"><Clock size={18} /> Check In</button>
            <button className="bg-[#1a295c] hover:bg-[#233570] text-blue-300 border border-blue-800/50 px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all"><CheckSquare size={18} /> My Tasks</button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-y-20 translate-x-20 pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'ATTENDANCE', value: '96%', sub: '20 / 21 days this month', icon: <Clock size={20} className="text-blue-400" />, bg: 'bg-blue-500/10' },
          { title: 'TASKS DONE', value: '4/6', sub: '2 in progress', icon: <CheckSquare size={20} className="text-emerald-400" />, bg: 'bg-emerald-500/10' },
          { title: 'LEAVE BALANCE', value: '12d', sub: 'Annual remaining', icon: <Calendar size={20} className="text-purple-400" />, bg: 'bg-purple-500/10' },
          { title: 'NET SALARY', value: '$8,800', sub: 'June 2026', icon: <DollarSign size={20} className="text-amber-400" />, bg: 'bg-amber-500/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><span className="text-slate-400 text-xs font-bold tracking-wider">{stat.title}</span><div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div></div>
            <div><h3 className="text-3xl font-bold mb-1">{stat.value}</h3><p className="text-slate-500 text-sm">{stat.sub}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        <div className="lg:col-span-2 bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex flex-col">
          <h3 className="text-lg font-bold mb-6">Attendance — last 6 months</h3>
          <div className="flex-1 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} barSize={12}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} /><Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px'}} /><Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} /><Bar dataKey="leave" fill="#f97316" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="bg-[#12192b] p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Apply for Leave', icon: <CalendarPlus size={18} className="text-purple-400" /> },
              { label: 'Download Payslip', icon: <Download size={18} className="text-emerald-400" /> },
              { label: 'View Tasks', icon: <CheckCircle size={18} className="text-blue-400" /> },
              { label: 'Update Profile', icon: <User size={18} className="text-amber-400" /> }
            ].map((action, i) => (
              <button key={i} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-800 transition-colors group">
                <div className="flex items-center gap-4 text-sm font-medium text-slate-200 group-hover:text-white">{action.icon}{action.label}</div>
                <span className="text-slate-600 group-hover:text-slate-400">›</span>
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
export default EmployeeDashboard;