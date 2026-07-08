import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, Clock, TrendingUp, Check, X, ShieldAlert, Edit, Trash2, Search } from 'lucide-react';

const growthData = [ { name: 'Feb', value: 100 }, { name: 'Mar', value: 102 }, { name: 'Apr', value: 105 }, { name: 'May', value: 105 }, { name: 'Jun', value: 107 }, { name: 'Jul', value: 108 } ];
const payrollData = [ { name: 'Feb', value: 9 }, { name: 'Mar', value: 9.5 }, { name: 'Apr', value: 10.2 }, { name: 'May', value: 10.6 }, { name: 'Jun', value: 10.7 }, { name: 'Jul', value: 10.8 } ];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  // CRASH-PROOF FETCH FUNCTION
  const fetchPendingUsers = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/pending?role=${user?.role}`);
      const data = await response.json();
      setPendingUsers(Array.isArray(data) ? data : []); // Agar error object aayega toh empty array set karega
    } catch (error) { 
      console.error(error); 
      setPendingUsers([]); 
    }
  };

  // CRASH-PROOF FETCH FUNCTION
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/all?role=${user?.role}`);
      const data = await response.json();
      setAllUsers(Array.isArray(data) ? data : []); // Agar error object aayega toh empty array set karega
    } catch (error) { 
      console.error(error); 
      setAllUsers([]); 
    }
  };

  useEffect(() => {
    fetchPendingUsers();
    fetchAllUsers();
  }, [user]);

  const activeAdminHR = allUsers.filter(u => u.status === 'Approved').length;

  const handleUserAction = async (userId, action) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/action', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action })
      });
      const data = await response.json();
      if (data.success) { fetchPendingUsers(); fetchAllUsers(); }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (userId) => {
    if(!window.confirm("Are you sure you want to completely delete this user?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) fetchAllUsers();
    } catch (error) { console.error(error); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingUser)
      });
      const data = await response.json();
      if (data.success) { setEditingUser(null); fetchAllUsers(); }
    } catch (error) { console.error(error); }
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div className="flex flex-col gap-6 text-white font-sans pb-10">
        <div><h1 className="text-2xl font-bold mb-1">Analytics</h1><p className="text-slate-400 text-sm">Company-wide metrics and insights</p></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { title: 'MANAGEMENT HEADCOUNT', value: activeAdminHR, sub: 'Active Admin/HR', icon: <Users size={18} className="text-blue-400" />, iconBg: 'bg-blue-500/10' },
            { title: 'MONTHLY PAYROLL', value: '$1.08M', sub: '+$20k vs May', icon: <DollarSign size={18} className="text-emerald-400" />, iconBg: 'bg-emerald-500/10' },
            { title: 'AVG TENURE', value: '2.4 yrs', sub: 'Across company', icon: <Clock size={18} className="text-purple-400" />, iconBg: 'bg-purple-500/10' },
            { title: 'RETENTION RATE', value: '94.4%', sub: 'Last 12 months', icon: <TrendingUp size={18} className="text-cyan-400" />, iconBg: 'bg-cyan-500/10' }
          ].map((stat, i) => (
            <div key={i} className="bg-[#12192b] p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4"><span className="text-slate-400 text-xs font-semibold tracking-widest">{stat.title}</span><div className={`p-2 rounded-lg ${stat.iconBg}`}>{stat.icon}</div></div>
              <div><h3 className="text-3xl font-bold mb-1 text-slate-100">{stat.value}</h3><p className="text-slate-500 text-xs">{stat.sub}</p></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-[320px]">
          <div className="bg-[#12192b] p-6 rounded-xl border border-slate-800 flex flex-col"><h3 className="text-sm font-bold mb-6 text-slate-200">Employee Growth — 2024</h3><div className="flex-1 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={growthData}><defs><linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 120]} dx={-10} /><Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px'}} /><Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" /></AreaChart></ResponsiveContainer></div></div>
          <div className="bg-[#12192b] p-6 rounded-xl border border-slate-800 flex flex-col"><h3 className="text-sm font-bold mb-6 text-slate-200">Payroll Cost ($M) — 2024</h3><div className="flex-1 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={payrollData}><defs><linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val}M`} domain={[0, 12]} dx={-10} /><Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px'}} /><Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorPayroll)" /></AreaChart></ResponsiveContainer></div></div>
        </div>

        {pendingUsers.length > 0 && (
        <div className="bg-[#12192b] p-6 rounded-xl border border-slate-800 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold flex items-center gap-2"><ShieldAlert size={18} className="text-amber-500" /> Pending HR Access Requests</h3>
            <span className="bg-amber-500/20 text-amber-500 text-xs px-3 py-1 rounded-full font-bold">{pendingUsers.length} Requests</span>
          </div>
          <div className="space-y-3">
            {pendingUsers.map((reqUser) => (
              <div key={reqUser.id} className="flex items-center justify-between p-4 bg-[#0b1121] border border-slate-800 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">{reqUser.name.charAt(0)}</div>
                  <div><h4 className="font-bold text-sm">{reqUser.name}</h4><p className="text-xs text-slate-500">{reqUser.email}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleUserAction(reqUser.id, 'Approved')} className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center"><Check size={16} /></button>
                  <button onClick={() => handleUserAction(reqUser.id, 'Rejected')} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center"><X size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        <div className="bg-[#12192b] p-6 rounded-xl border border-slate-800 mt-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Users size={20} className="text-purple-500" /> HR & Admin Management
            </h3>
            
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
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan="5" className="p-4 text-center text-slate-500">No users found.</td></tr>
                ) : filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${ u.role === 'Admin' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400' }`}>
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm text-slate-200">{u.name}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-400">{u.email}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${ u.role === 'Admin' ? 'bg-red-500/10 text-red-400' : 'bg-purple-500/10 text-purple-400' }`}>{u.role}</span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold ${ u.status === 'Approved' ? 'text-emerald-400' : u.status === 'Pending' ? 'text-amber-400' : 'text-red-400' }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${ u.status === 'Approved' ? 'bg-emerald-400' : u.status === 'Pending' ? 'bg-amber-400' : 'bg-red-400' }`}></div>
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
              <h2 className="text-xl font-bold mb-4 text-white">Edit User</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div><label className="text-xs text-slate-400 font-bold mb-1 block">Full Name</label><input type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full bg-[#0b1121] border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500" required /></div>
                <div><label className="text-xs text-slate-400 font-bold mb-1 block">Email Address</label><input type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-[#0b1121] border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500" required /></div>
                <div><label className="text-xs text-slate-400 font-bold mb-1 block">Role</label>
                  <select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="w-full bg-[#0b1121] border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="HR">HR</option><option value="Admin">Admin</option>
                  </select>
                </div>
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
export default AdminDashboard;