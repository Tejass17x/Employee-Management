import React, { useState, useEffect } from 'react';
import { Calendar, Plus, FileText, CheckCircle, Clock, X, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const Leave = () => {
  const [balances, setBalances] = useState({ casual_days: 10, sick_days: 10, earned_days: 15 });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    leave_type: 'Casual',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const balanceRes = await api.get('/employee/leave/balances');
      setBalances(balanceRes.data);

      const requestsRes = await api.get('/employee/leave/requests');
      setRequests(requestsRes.data);
    } catch (e) {
      console.error('Error fetching leave details:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      await api.post('/employee/leave/requests', form);
      alert('Leave request submitted successfully!');
      setShowModal(false);
      setForm({ leave_type: 'Casual', start_date: '', end_date: '', reason: '' });
      fetchLeaveData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Usage chart data
  // Casual max 10, Sick max 10, Earned max 15. Remaining balances:
  const casualUsed = 10 - (balances.casual_days || 0);
  const sickUsed = 10 - (balances.sick_days || 0);
  const earnedUsed = 15 - (balances.earned_days || 0);

  const usageChartData = [
    { name: 'Casual', used: casualUsed, total: 10 },
    { name: 'Sick', used: sickUsed, total: 10 },
    { name: 'Earned', used: earnedUsed, total: 15 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading Leave Details...
      </div>
    );
  }

  return (
    <div className="text-white font-sans pb-10 flex flex-col gap-6">
      
      {/* Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'CASUAL LEAVE', remaining: balances.casual_days, max: 10, used: casualUsed, color: 'bg-blue-500', barBg: 'bg-blue-500/10' },
          { title: 'SICK LEAVE', remaining: balances.sick_days, max: 10, used: sickUsed, color: 'bg-emerald-500', barBg: 'bg-emerald-500/10' },
          { title: 'EARNED LEAVE', remaining: balances.earned_days, max: 15, used: earnedUsed, color: 'bg-purple-500', barBg: 'bg-purple-500/10' }
        ].map((bal, idx) => {
          const pct = Math.round((bal.remaining / bal.max) * 100);
          return (
            <div key={idx} className="bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-400 tracking-wider">{bal.title}</span>
                <span className="text-xs font-bold text-slate-500">{bal.used} / {bal.max} days used</span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-extrabold">{bal.remaining}d</span>
                <span className="text-xs text-slate-500 font-semibold">available</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                <div className={`h-full ${bal.color}`} style={{ width: `${pct}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Usage Chart & Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Usage Bar Chart */}
        <div className="lg:col-span-2 bg-[#12192b] p-6 rounded-2xl border border-slate-800 h-[300px] flex flex-col">
          <h3 className="text-base font-bold mb-6">Leave Usage Statistics</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageChartData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px'}} />
                <Bar dataKey="used" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Days Used" />
                <Bar dataKey="total" fill="#1e293b" radius={[4, 4, 0, 0]} name="Total Allowance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Call to action card */}
        <div className="bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-[300px]">
          <div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-6">
              <Calendar size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Need Time Off?</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Submit your request here. It will be routed directly to your HR Manager for approval. 
              Make sure you have enough remaining balance.
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={18} /> Apply for Leave
          </button>
        </div>

      </div>

      {/* Leave Request History */}
      <div className="bg-[#12192b] p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold mb-6">Leave Requests History</h3>
        {requests.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No leave requests logged.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                  <th className="pb-3">Leave Type</th>
                  <th className="pb-3">Date Range</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Applied At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/10">
                    <td className="py-3.5 font-medium text-slate-200">{r.leave_type}</td>
                    <td className="py-3.5 text-slate-300">
                      {new Date(r.start_date).toLocaleDateString()} — {new Date(r.end_date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-slate-400 max-w-xs truncate" title={r.reason}>{r.reason || 'N/A'}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        r.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                        r.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                      }`}>{r.status}</span>
                    </td>
                    <td className="py-3.5 text-slate-400 text-xs">{new Date(r.applied_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply for Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12192b] border border-slate-800 rounded-2xl max-w-md w-full p-6 relative animate-zoom-in">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-6">Apply for Leave</h3>
            
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">LEAVE TYPE</label>
                <select 
                  value={form.leave_type} 
                  onChange={e => setForm({ ...form, leave_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Earned">Earned Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">START DATE</label>
                  <input 
                    type="date" 
                    required
                    value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">END DATE</label>
                  <input 
                    type="date" 
                    required
                    value={form.end_date}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">REASON / REMARKS</label>
                <textarea 
                  rows="3"
                  required
                  placeholder="Explain reason for leave..."
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
              >
                {submitLoading ? <Loader2 className="animate-spin" size={18} /> : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Leave;
