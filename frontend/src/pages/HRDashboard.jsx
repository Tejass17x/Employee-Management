import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Clock, Briefcase, Calendar, Check, X, UserPlus, Edit, Trash2, ShieldCheck, Search } from 'lucide-react';
import { getOverview, getPendingLeaves, approveLeave} from "../services/hrApi";

const attendanceData = [ { name: 'Feb', value: 92 }, { name: 'Mar', value: 94 }, { name: 'Apr', value: 93 }, { name: 'May', value: 95 }, { name: 'Jun', value: 94.2 }, { name: 'Jul', value: 96 } ];
const hiringData = [ { name: 'Feb', value: 2 }, { name: 'Mar', value: 3 }, { name: 'Apr', value: 5 }, { name: 'May', value: 4 }, { name: 'Jun', value: 6 }, { name: 'Jul', value: 8 } ];

const HRDashboard = () => {
  const { user } = useAuth();
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]); 
  const [overview, setOverview] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
  });
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  const fetchPending = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/pending?role=${user?.role}`);
      setPendingEmployees(await response.json());
    } catch (error) { console.error(error); }
  };

      const fetchAllEmployees = async () => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/users/all?role=${user?.role}`
    );

    const data = await response.json();

    console.log("All Employees Response:", data);

    setAllEmployees(data);
  } catch (error) {
    console.error(error);
  }
};
    const loadOverview = async () => {
  try {
    const data = await getOverview();

    if (data.success) {
      setOverview({
        totalEmployees: data.totalEmployees,
        pendingLeaves: data.pendingLeaves,
        approvedLeaves: data.approvedLeaves,
      });
    }
  } catch (err) {
    console.error("Overview Error:", err);
  }
  };
       const loadPendingLeaves = async () => {
  try {
    const data = await getPendingLeaves();

    if (data.success) {
      setPendingLeaves(data.leaves);
    }
  } catch (err) {
    console.error("Pending Leave Error:", err);
  }
};

const handleApproveLeave = async (id) => {
  try {
    const data = await approveLeave(id);

    if (data.success) {
      loadPendingLeaves();
      loadOverview();
    }
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    if (!user) return;

    fetchPending();
    fetchAllEmployees();
    loadOverview();
    loadPendingLeaves();

  }, [user]);

  const activeEmployees = allEmployees.filter(u => u.status === 'Approved').length;

  const handleAction = async (userId, action) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/action', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action })
      });
      const data = await response.json();
      if (data.success) { fetchPending(); fetchAllEmployees(); }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (userId) => {
    if(!window.confirm("Are you sure you want to completely remove this employee?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) fetchAllEmployees();
    } catch (error) { console.error(error); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingUser)
      });
      const data = await response.json();
      if (data.success) { setEditingUser(null); fetchAllEmployees(); }
    } catch (error) { console.error(error); }
  };

  const filteredEmployees = allEmployees.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 text-white font-sans pb-10">
      
      <div><h1 className="text-2xl font-bold mb-1">HR Analytics</h1><p className="text-slate-400 text-sm">Company-wide workforce summary</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { title: 'TOTAL EMPLOYEES', value: overview.totalEmployees, sub: 'Active Workforce', icon: <Users size={18} className="text-blue-400" />, iconBg: 'bg-blue-500/10' },
          { title: 'AVG ATTENDANCE', value: '94.2%', sub: 'Across all depts', icon: <Clock size={18} className="text-emerald-400" />, iconBg: 'bg-emerald-500/10' },
          { title: 'OPEN POSITIONS', value: '8', sub: '4 departments', icon: <Briefcase size={18} className="text-amber-400" />, iconBg: 'bg-amber-500/10' },
          { title: 'PENDING LEAVES', value: overview.pendingLeaves, sub: 'Awaiting approval', icon: <Calendar size={18} className="text-purple-400" />, iconBg: 'bg-purple-500/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-[#12192b] p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><span className="text-slate-400 text-xs font-semibold tracking-widest">{stat.title}</span><div className={`p-2 rounded-lg ${stat.iconBg}`}>{stat.icon}</div></div>
            <div><h3 className="text-3xl font-bold mb-1 text-slate-100">{stat.value}</h3><p className="text-slate-500 text-xs">{stat.sub}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-[320px]">
        <div className="bg-[#12192b] p-6 rounded-xl border border-slate-800 flex flex-col"><h3 className="text-sm font-bold mb-6 text-slate-200">Attendance Rate (%)</h3><div className="flex-1 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={attendanceData}><defs><linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[80, 100]} dx={-10} /><Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px'}} /><Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAtt)" /></AreaChart></ResponsiveContainer></div></div>
        <div className="bg-[#12192b] p-6 rounded-xl border border-slate-800 flex flex-col"><h3 className="text-sm font-bold mb-6 text-slate-200">New Hires</h3><div className="flex-1 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={hiringData}><defs><linearGradient id="colorHire" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} /><Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px'}} /><Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHire)" /></AreaChart></ResponsiveContainer></div></div>
      </div>

      {pendingEmployees.length > 0 && (
      <div className="bg-[#12192b] p-6 rounded-xl border border-slate-800 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold flex items-center gap-2"><UserPlus size={18} className="text-blue-500" /> Pending Employee Sign-ups</h3>
          <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full font-bold">{pendingEmployees.length} Requests</span>
        </div>
        <div className="space-y-3">
          {pendingEmployees.map((reqUser) => (
            <div key={reqUser.id} className="flex items-center justify-between p-4 bg-[#0b1121] border border-slate-800 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">{reqUser.name.charAt(0)}</div>
                <div><h4 className="font-bold text-sm">{reqUser.name}</h4><p className="text-xs text-slate-500">{reqUser.email}</p></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleAction(reqUser.id, 'Approved')} className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center"><Check size={16} /></button>
                <button onClick={() => handleAction(reqUser.id, 'Rejected')} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center"><X size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
            {pendingLeaves.length > 0 && (
  <div className="bg-[#12192b] p-6 rounded-xl border border-slate-800 mt-6">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-sm font-bold flex items-center gap-2">
        <Calendar size={18} className="text-purple-500" />
        Pending Leave Requests
      </h3>

      <span className="bg-purple-500/20 text-purple-400 text-xs px-3 py-1 rounded-full font-bold">
        {pendingLeaves.length} Requests
      </span>
    </div>

    <div className="space-y-3">
      {pendingLeaves.map((leave) => (
        <div
          key={leave.id}
          className="flex items-center justify-between p-4 bg-[#0b1121] border border-slate-800 rounded-xl"
        >
          <div>
            <h4 className="font-bold text-sm">
              {leave.employeeName}
            </h4>

            <p className="text-xs text-slate-500">
              {leave.fromDate} → {leave.toDate}
            </p>

            <p className="text-xs text-slate-400">
              {leave.reason}
            </p>
          </div>

          <button
            onClick={() => handleApproveLeave(leave.id)}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm"
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  </div>
)}
      <div className="bg-[#12192b] p-6 rounded-xl border border-slate-800 mt-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><ShieldCheck size={20} className="text-blue-500" /> Employee Directory</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#0b1121] border border-slate-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 w-64" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Name</th><th className="p-4 font-semibold">Email Account</th>
                <th className="p-4 font-semibold">Role</th><th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredEmployees.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-slate-500">No employees found.</td></tr>
              ) : filteredEmployees.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">{u.name.charAt(0)}</div>
                    <span className="font-medium text-sm text-slate-200">{u.name}</span>
                  </td>
                  <td className="p-4 text-sm text-slate-400">{u.email}</td>
                  <td className="p-4"><span className="text-xs px-2.5 py-1 rounded-md font-semibold bg-blue-500/10 text-blue-400">{u.role}</span></td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${u.status === 'Approved' ? 'text-emerald-400' : u.status === 'Pending' ? 'text-amber-400' : 'text-red-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Approved' ? 'bg-emerald-400' : u.status === 'Pending' ? 'bg-amber-400' : 'bg-red-400'}`}></div>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => setEditingUser(u)} className="text-slate-400 hover:text-blue-400 transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(u.id)} className="text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12192b] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">Edit Employee</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div><label className="text-xs text-slate-400 font-bold mb-1 block">Full Name</label><input type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full bg-[#0b1121] border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500" required /></div>
              <div><label className="text-xs text-slate-400 font-bold mb-1 block">Email Address</label><input type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-[#0b1121] border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500" required /></div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-slate-800 text-white py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default HRDashboard;