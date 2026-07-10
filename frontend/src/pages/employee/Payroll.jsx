import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Download, TrendingUp, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const Payroll = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employee/payslips');
      setPayslips(res.data);
      if (res.data.length > 0) {
        setSelectedSlip(res.data[0]); // default to latest payslip
      }
    } catch (e) {
      console.error('Error fetching payroll details:', e);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalGrossYTD = payslips.reduce((acc, p) => acc + parseFloat(p.basic) + parseFloat(p.allowances), 0);
  const totalDeductionsYTD = payslips.reduce((acc, p) => acc + parseFloat(p.deductions), 0);
  const totalNetYTD = payslips.reduce((acc, p) => acc + parseFloat(p.net_pay), 0);

  // Chart data
  const trendData = [...payslips].reverse().map(p => ({
    name: `${p.month} ${p.year}`,
    salary: parseFloat(p.net_pay)
  }));

  const handleDownloadPdf = (slip) => {
    if (!slip) return;
    alert(`Downloading Payslip PDF for ${slip.month} ${slip.year}...\n(PDF Stub generated successfully)`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading Payroll Details...
      </div>
    );
  }

  return (
    <div className="text-white font-sans pb-10 flex flex-col gap-6">
      
      {/* YTD Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'YTD GROSS EARNINGS', value: `$${totalGrossYTD.toLocaleString()}`, sub: 'Allowances included', icon: <DollarSign size={20} className="text-emerald-400" />, bg: 'bg-emerald-500/10' },
          { title: 'YTD DEDUCTIONS', value: `$${totalDeductionsYTD.toLocaleString()}`, sub: 'Taxes & PF deducted', icon: <CreditCard size={20} className="text-red-400" />, bg: 'bg-red-500/10' },
          { title: 'YTD NET RECEIVED', value: `$${totalNetYTD.toLocaleString()}`, sub: 'Directly deposited', icon: <TrendingUp size={20} className="text-blue-400" />, bg: 'bg-blue-500/10' }
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

      {/* Main Row: Salary Trend Area Chart & Current Payslip Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-[#12192b] p-6 rounded-2xl border border-slate-800 h-[350px] flex flex-col">
          <h3 className="text-base font-bold mb-6">Salary Net Pay Trend</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px'}} />
                <Area type="monotone" dataKey="salary" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSalary)" name="Net Pay" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected Payslip Breakdown (1 Col) */}
        <div className="bg-[#12192b] p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-[350px]">
          {selectedSlip ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold">Statement Detail</h3>
                  <span className="text-xs bg-[#1a233a] text-blue-400 px-2 py-0.5 rounded font-semibold">{selectedSlip.month} {selectedSlip.year}</span>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between text-slate-400"><span>Basic Salary</span><span className="font-semibold text-slate-200">${parseFloat(selectedSlip.basic).toLocaleString()}</span></div>
                  <div className="flex justify-between text-slate-400"><span>Allowances</span><span className="font-semibold text-slate-200">+${parseFloat(selectedSlip.allowances).toLocaleString()}</span></div>
                  <div className="flex justify-between text-slate-400"><span>Deductions</span><span className="font-semibold text-red-400">-${parseFloat(selectedSlip.deductions).toLocaleString()}</span></div>
                  <div className="border-t border-slate-800 pt-3 flex justify-between text-base font-bold text-slate-100">
                    <span>Net Pay</span>
                    <span>${parseFloat(selectedSlip.net_pay).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleDownloadPdf(selectedSlip)}
                className="w-full bg-[#1a233a] hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4"
              >
                <Download size={18} /> Download Payslip
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No statements available.</p>
          )}
        </div>

      </div>

      {/* Payslips History List */}
      <div className="bg-[#12192b] p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold mb-6">All Payslip History</h3>
        {payslips.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                  <th className="pb-3">Period</th>
                  <th className="pb-3">Basic</th>
                  <th className="pb-3">Allowances</th>
                  <th className="pb-3">Deductions</th>
                  <th className="pb-3">Net Pay</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {payslips.map((slip) => (
                  <tr 
                    key={slip.id} 
                    className={`hover:bg-slate-800/10 cursor-pointer ${selectedSlip?.id === slip.id ? 'bg-[#1e293b]/20' : ''}`}
                    onClick={() => setSelectedSlip(slip)}
                  >
                    <td className="py-3.5 font-bold text-slate-200">{slip.month} {slip.year}</td>
                    <td className="py-3.5">${parseFloat(slip.basic).toLocaleString()}</td>
                    <td className="py-3.5 text-emerald-400">+${parseFloat(slip.allowances).toLocaleString()}</td>
                    <td className="py-3.5 text-red-400">-${parseFloat(slip.deductions).toLocaleString()}</td>
                    <td className="py-3.5 font-bold text-blue-400">${parseFloat(slip.net_pay).toLocaleString()}</td>
                    <td className="py-3.5 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownloadPdf(slip); }}
                        className="p-2 bg-slate-800/60 hover:bg-blue-600 rounded-lg text-slate-300 hover:text-white inline-flex items-center"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                    </td>
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

export default Payroll;
