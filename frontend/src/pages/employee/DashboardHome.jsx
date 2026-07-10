import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, CheckSquare, Calendar, DollarSign, CalendarPlus, Download, CheckCircle, User, Loader2 } from 'lucide-react';
import api from '../../services/api';

const DashboardHome = () => {
  const navigate = useNavigate();
  const navigateToTab = (path) => navigate(path);
  const { user } = useAuth();
  const [stats, setStats] = useState({
    attendancePct: '100%',
    pendingTasks: 0,
    remainingLeave: '0d',
    latestSalary: '$0.00',
    attendanceDetails: ''
  });
  const [checkStatus, setCheckStatus] = useState({
    checkedIn: false,
    checkedOut: false
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch Stats
      const statsRes = await api.get('/employee/stats');
      setStats(statsRes.data);

      // Fetch Attendance Status
      const statusRes = await api.get('/employee/attendance/status');
      setCheckStatus(statusRes.data);

      // Fetch Tasks
      const tasksRes = await api.get('/employee/tasks');
      // Sort tasks to show non-done first, then by date
      const sortedTasks = tasksRes.data
        .filter(t => t.status !== 'Done')
        .slice(0, 4);
      setRecentTasks(sortedTasks);

      // Fetch Attendance History for Chart
      const attendRes = await api.get('/employee/attendance');
      processChartData(attendRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (records) => {
    // Group records by month (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dataMap = {};
    
    // Seed last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = months[d.getMonth()];
      dataMap[mName] = { name: mName, present: 0, leave: 0 };
    }

    records.forEach(r => {
      const rDate = new Date(r.date);
      const mName = months[rDate.getMonth()];
      if (dataMap[mName]) {
        if (r.status === 'Present' || r.status === 'Late') {
          dataMap[mName].present += 1;
        } else {
          dataMap[mName].leave += 1;
        }
      }
    });

    setChartData(Object.values(dataMap));
  };

  const handleCheckInOut = async () => {
    try {
      setActionLoading(true);
      if (!checkStatus.checkedIn) {
        await api.post('/employee/attendance/checkin');
        alert('Check-In Successful!');
      } else {
        await api.post('/employee/attendance/checkout');
        alert('Check-Out Successful!');
      }
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Check-in/out action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-white font-sans pb-10">
      
      {/* Welcome Banner */}
      <div className="bg-[#111c44] rounded-2xl p-8 border border-blue-900/50 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-blue-300 text-sm font-semibold mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            Good morning, {user?.name?.split(' ')[0] || 'User'} <span className="animate-wave text-2xl">👋</span>
          </h2>
          <p className="text-blue-200/70 mb-6">
            {stats.pendingTasks > 0 
              ? `You have ${stats.pendingTasks} pending tasks in your queue.` 
              : 'You are all caught up on your tasks!'}
          </p>
          <div className="flex gap-4">
            {!checkStatus.checkedOut && (
              <button 
                onClick={handleCheckInOut}
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Clock size={18} />}
                {checkStatus.checkedIn ? 'Check Out' : 'Check In'}
              </button>
            )}
            {checkStatus.checkedOut && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2">
                <CheckCircle size={18} /> Day Completed
              </span>
            )}
            <button 
              onClick={() => navigateToTab('/employee/tasks')} 
              className="bg-[#1a295c] hover:bg-[#233570] text-blue-300 border border-blue-800/50 px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all"
            >
              <CheckSquare size={18} /> View Tasks
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-y-20 translate-x-20 pointer-events-none"></div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'ATTENDANCE', value: stats.attendancePct, sub: stats.attendanceDetails || 'Current Month', icon: <Clock size={20} className="text-blue-400" />, bg: 'bg-blue-500/10' },
          { title: 'PENDING TASKS', value: stats.pendingTasks, sub: 'In progress or todo', icon: <CheckSquare size={20} className="text-emerald-400" />, bg: 'bg-emerald-500/10' },
          { title: 'LEAVE BALANCE', value: stats.remainingLeave, sub: 'Days remaining total', icon: <Calendar size={20} className="text-purple-400" />, bg: 'bg-purple-500/10' },
          { title: 'LATEST NET PAY', value: stats.latestSalary, sub: 'Last generated payslip', icon: <DollarSign size={20} className="text-amber-400" />, bg: 'bg-amber-500/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-400 text-xs font-bold tracking-wider">{stat.title}</span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-slate-500 text-xs">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Chart and Quick Actions + Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex flex-col h-[350px]">
          <h3 className="text-lg font-bold mb-6">Attendance — last 6 months</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px'}} />
                <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="leave" fill="#f97316" radius={[4, 4, 0, 0]} name="Absent/Leave" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-[350px]">
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Apply for Leave', icon: <CalendarPlus size={18} className="text-purple-400" />, path: '/employee/leave' },
                { label: 'Download Payslip', icon: <Download size={18} className="text-emerald-400" />, path: '/employee/payroll' },
                { label: 'My Tasks', icon: <CheckSquare size={18} className="text-blue-400" />, path: '/employee/tasks' },
                { label: 'Update Profile', icon: <User size={18} className="text-amber-400" />, path: '/employee/profile' }
              ].map((action, i) => (
                <button 
                  key={i} 
                  onClick={() => navigateToTab(action.path)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-800/60 transition-colors group text-left"
                >
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-200 group-hover:text-white">
                    {action.icon}
                    {action.label}
                  </div>
                  <span className="text-slate-600 group-hover:text-slate-400">›</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks Table */}
      <div className="bg-[#12192b] p-6 rounded-2xl border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Upcoming / Current Tasks</h3>
          <button onClick={() => navigateToTab('/employee/tasks')} className="text-xs text-blue-500 hover:text-blue-400 font-semibold">View All Tasks</button>
        </div>
        
        {recentTasks.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No pending tasks found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                  <th className="pb-3">Task Title</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/10">
                    <td className="py-3.5 font-medium text-slate-200">{t.title}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        t.priority === 'High' ? 'bg-red-500/10 text-red-400' :
                        t.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>{t.priority}</span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        t.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'
                      }`}>{t.status}</span>
                    </td>
                    <td className="py-3.5 text-slate-400">{t.due_date ? new Date(t.due_date).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default DashboardHome;
