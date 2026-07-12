import React, { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Download,
  Edit3,
  FileSpreadsheet,
  Filter,
  Loader2,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  UserRound,
  XCircle,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../../services/api';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const currentYear = new Date().getFullYear();
const defaultForm = {
  user_id: '',
  month: months[new Date().getMonth()],
  year: currentYear,
  basic: '',
  allowances: '0',
  deductions: '0',
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const toNumber = (value) => Number.parseFloat(value || 0) || 0;

const formatMoney = (value) => currency.format(toNumber(value));

const AdminPayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('All');
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [errorMessage, setErrorMessage] = useState('');

  const loadPayroll = async () => {
    try {
      setLoading(true);
      const [payrollResponse, employeeResponse] = await Promise.all([
        api.get('/payroll'),
        api.get('/payroll/employees'),
      ]);

      setPayrolls(payrollResponse.data?.payrolls || []);
      setEmployees(employeeResponse.data?.employees || []);
      setErrorMessage('');
    } catch (error) {
      console.error('Unable to load payroll:', error);
      setErrorMessage('Unable to load payroll records from the server.');
      setPayrolls([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayroll();
  }, []);

  const periods = useMemo(() => {
    const uniquePeriods = new Set(payrolls.map((item) => `${item.month} ${item.year}`));
    return ['All', ...Array.from(uniquePeriods)];
  }, [payrolls]);

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter((item) => {
      const haystack = [item.employeeName, item.employeeEmail, item.month, item.year]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      const matchesPeriod = periodFilter === 'All' || `${item.month} ${item.year}` === periodFilter;
      return matchesSearch && matchesPeriod;
    });
  }, [payrolls, periodFilter, searchTerm]);

  const stats = useMemo(() => {
    const totalNet = filteredPayrolls.reduce((sum, item) => sum + toNumber(item.net_pay), 0);
    const totalGross = filteredPayrolls.reduce((sum, item) => sum + toNumber(item.basic) + toNumber(item.allowances), 0);
    const totalDeductions = filteredPayrolls.reduce((sum, item) => sum + toNumber(item.deductions), 0);
    const employeeCount = new Set(filteredPayrolls.map((item) => item.user_id)).size;

    return [
      { title: 'Net Payroll', value: formatMoney(totalNet), sub: `${filteredPayrolls.length} processed records`, icon: <Banknote size={18} className="text-blue-400" /> },
      { title: 'Gross Earnings', value: formatMoney(totalGross), sub: 'Basic salary plus allowances', icon: <ReceiptText size={18} className="text-emerald-400" /> },
      { title: 'Deductions', value: formatMoney(totalDeductions), sub: 'Tax, PF, and adjustments', icon: <FileSpreadsheet size={18} className="text-red-400" /> },
      { title: 'Staff Paid', value: employeeCount, sub: 'Unique staff in view', icon: <UserRound size={18} className="text-purple-400" /> },
    ];
  }, [filteredPayrolls]);

  const chartData = useMemo(() => {
    const byPeriod = new Map();

    payrolls.forEach((item) => {
      const key = `${item.month} ${item.year}`;
      const current = byPeriod.get(key) || { period: key, net: 0, gross: 0 };
      current.net += toNumber(item.net_pay);
      current.gross += toNumber(item.basic) + toNumber(item.allowances);
      byPeriod.set(key, current);
    });

    return Array.from(byPeriod.values()).reverse().slice(-6);
  }, [payrolls]);

  const netPreview = useMemo(() => {
    return toNumber(formData.basic) + toNumber(formData.allowances) - toNumber(formData.deductions);
  }, [formData]);

  const openCreateForm = () => {
    setSelectedPayroll(null);
    setFormData(defaultForm);
    setShowForm(true);
    setErrorMessage('');
  };

  const openEditForm = (payroll) => {
    setSelectedPayroll(payroll);
    setFormData({
      user_id: payroll.user_id || '',
      month: payroll.month || defaultForm.month,
      year: payroll.year || currentYear,
      basic: payroll.basic ?? '',
      allowances: payroll.allowances ?? '0',
      deductions: payroll.deductions ?? '0',
    });
    setShowForm(true);
    setErrorMessage('');
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedPayroll(null);
    setFormData(defaultForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');

    try {
      const payload = {
        ...formData,
        user_id: Number(formData.user_id),
        year: Number(formData.year),
        basic: toNumber(formData.basic),
        allowances: toNumber(formData.allowances),
        deductions: toNumber(formData.deductions),
      };

      const response = selectedPayroll
        ? await api.put(`/payroll/${selectedPayroll.id}`, payload)
        : await api.post('/payroll', payload);

      if (response.data?.success) {
        closeForm();
        await loadPayroll();
      } else {
        setErrorMessage(response.data?.message || 'Unable to save payroll record.');
      }
    } catch (error) {
      console.error('Unable to save payroll:', error);
      setErrorMessage(error.response?.data?.message || 'Unable to save payroll record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (payroll) => {
    const confirmed = window.confirm(`Delete payroll for ${payroll.employeeName} (${payroll.month} ${payroll.year})?`);
    if (!confirmed) return;

    try {
      const response = await api.delete(`/payroll/${payroll.id}`);
      if (response.data?.success) {
        await loadPayroll();
      } else {
        setErrorMessage(response.data?.message || 'Unable to delete payroll record.');
      }
    } catch (error) {
      console.error('Unable to delete payroll:', error);
      setErrorMessage(error.response?.data?.message || 'Unable to delete payroll record.');
    }
  };

  const exportCsv = () => {
    const headers = ['Staff Member', 'Email', 'Period', 'Basic', 'Allowances', 'Deductions', 'Net Pay'];
    const rows = filteredPayrolls.map((item) => [
      item.employeeName,
      item.employeeEmail,
      `${item.month} ${item.year}`,
      item.basic,
      item.allowances,
      item.deductions,
      item.net_pay,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll-${periodFilter === 'All' ? 'all-periods' : periodFilter.replace(/\s+/g, '-').toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 pb-8 text-[var(--text-primary)] font-sans">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payroll Management</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Generate salary records, review payroll cost, and keep staff payslips ready.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportCsv}
            disabled={filteredPayrolls.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            <Plus size={16} />
            Add Payroll
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">{item.title}</p>
                <h3 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{item.value}</h3>
              </div>
              <div className="rounded-xl bg-[var(--bg-input)] p-2">{item.icon}</div>
            </div>
            <p className="mt-4 text-sm text-[var(--text-muted)]">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Payroll Trend</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Gross and net pay across recent periods.</p>
            </div>
            <Calendar size={18} className="text-blue-400" />
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} dx={-8} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} formatter={(value) => formatMoney(value)} />
                <Bar dataKey="gross" name="Gross Pay" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="net" name="Net Pay" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Payroll Readiness</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Approved Admin, HR, and Employee users with payslip records.</p>
            </div>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800/80 bg-[var(--bg-input)] p-4">
              <p className="text-sm text-[var(--text-muted)]">Approved staff</p>
              <p className="mt-2 text-3xl font-semibold">{employees.length}</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-[var(--bg-input)] p-4">
              <p className="text-sm text-[var(--text-muted)]">Payroll records</p>
              <p className="mt-2 text-3xl font-semibold">{payrolls.length}</p>
            </div>
            <button onClick={openCreateForm} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
              <Plus size={16} />
              Generate Record
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2.5">
            <Search size={16} className="text-[var(--text-muted)]" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search staff, email, or period"
              className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-muted)]">
            <Filter size={14} />
            <select value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)} className="bg-transparent text-sm text-[var(--text-primary)] outline-none">
              {periods.map((period) => (
                <option key={period} value={period}>{period === 'All' ? 'All periods' : period}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Basic</th>
                <th className="px-4 py-3">Allowances</th>
                <th className="px-4 py-3">Deductions</th>
                <th className="px-4 py-3">Net Pay</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                    <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading payroll records...</span>
                  </td>
                </tr>
              ) : filteredPayrolls.length > 0 ? (
                filteredPayrolls.map((item) => (
                  <tr key={item.id} className="border-b border-slate-800/70 transition hover:bg-slate-800/30">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-sm font-semibold text-blue-400">
                          {item.employeeName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--text-primary)]">{item.employeeName}</div>
                          <div className="text-xs text-[var(--text-muted)]">{item.employeeEmail || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-muted)]">{item.month} {item.year}</td>
                    <td className="px-4 py-4 text-sm text-[var(--text-primary)]">{formatMoney(item.basic)}</td>
                    <td className="px-4 py-4 text-sm text-emerald-400">+{formatMoney(item.allowances)}</td>
                    <td className="px-4 py-4 text-sm text-red-400">-{formatMoney(item.deductions)}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-blue-400">{formatMoney(item.net_pay)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditForm(item)} className="rounded-lg border border-slate-700/70 bg-[var(--bg-input)] p-2 text-[var(--text-muted)] transition hover:text-blue-400" title="Edit payroll">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => handleDelete(item)} className="rounded-lg border border-slate-700/70 bg-[var(--bg-input)] p-2 text-[var(--text-muted)] transition hover:text-red-400" title="Delete payroll">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                    No payroll records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  {selectedPayroll ? 'Edit payroll' : 'New payroll'}
                </p>
                <h3 className="mt-1 text-xl font-semibold">{selectedPayroll ? 'Update salary record' : 'Generate salary record'}</h3>
              </div>
              <button onClick={closeForm} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-slate-800/50" title="Close">
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">Staff Member</label>
                  <select
                    value={formData.user_id}
                    onChange={(event) => setFormData((prev) => ({ ...prev, user_id: event.target.value }))}
                    className="w-full rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none"
                    required
                  >
                    <option value="">Select staff member</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>{employee.name} - {employee.role} - {employee.email}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">Month</label>
                    <select
                      value={formData.month}
                      onChange={(event) => setFormData((prev) => ({ ...prev, month: event.target.value }))}
                      className="w-full rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none"
                      required
                    >
                      {months.map((month) => <option key={month} value={month}>{month}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">Year</label>
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={formData.year}
                      onChange={(event) => setFormData((prev) => ({ ...prev, year: event.target.value }))}
                      className="w-full rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">Basic Salary</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.basic}
                    onChange={(event) => setFormData((prev) => ({ ...prev, basic: event.target.value }))}
                    className="w-full rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">Allowances</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.allowances}
                    onChange={(event) => setFormData((prev) => ({ ...prev, allowances: event.target.value }))}
                    className="w-full rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">Deductions</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.deductions}
                    onChange={(event) => setFormData((prev) => ({ ...prev, deductions: event.target.value }))}
                    className="w-full rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-300">Calculated Net Pay</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Basic plus allowances minus deductions</p>
                </div>
                <p className="text-2xl font-semibold text-blue-300">{formatMoney(netPreview)}</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeForm} className="rounded-xl border border-slate-700/70 px-4 py-2 text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text-primary)]">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {selectedPayroll ? 'Save changes' : 'Create payroll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayroll;

