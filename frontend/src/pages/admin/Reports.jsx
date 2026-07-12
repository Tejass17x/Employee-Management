import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  Download,
  FileText,
  Filter,
  Loader2,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../services/api';

const today = new Date().toISOString().slice(0, 10);
const yearStart = `${new Date().getFullYear()}-01-01`;

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const numberFormat = new Intl.NumberFormat('en-US');
const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const toNumber = (value) => Number(value || 0);
const formatMoney = (value) => currency.format(toNumber(value));
const formatNumber = (value) => numberFormat.format(toNumber(value));

const reportTabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'people', label: 'People' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'operations', label: 'Operations' },
];

const AdminReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: yearStart, endDate: today });

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/reports', { params: dateRange });
      setReportData(response.data);
      setErrorMessage('');
    } catch (error) {
      console.error('Unable to load reports:', error);
      setErrorMessage(error.response?.data?.message || 'Unable to load system reports.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const summary = reportData?.summary || {};
  const payrollTrend = reportData?.payrollByPeriod?.map((item) => ({
    ...item,
    period: `${item.month.slice(0, 3)} ${item.year}`,
    netPay: toNumber(item.netPay),
    grossPay: toNumber(item.grossPay),
    deductions: toNumber(item.deductions),
  })) || [];

  const roleBreakdown = reportData?.roleBreakdown || [];
  const statusBreakdown = reportData?.statusBreakdown || [];
  const attendanceByStatus = reportData?.attendanceByStatus || [];
  const leaveByStatus = reportData?.leaveByStatus || [];
  const taskByStatus = reportData?.taskByStatus || [];
  const departmentBreakdown = reportData?.departmentBreakdown || [];
  const trainingStatus = reportData?.trainingStatus || [];

  const recentPayrolls = useMemo(() => {
    const rows = reportData?.recentPayrolls || [];
    return rows.filter((item) => {
      const matchesRole = roleFilter === 'All' || item.role === roleFilter;
      const haystack = [item.name, item.email, item.role, item.month, item.year].filter(Boolean).join(' ').toLowerCase();
      return matchesRole && haystack.includes(searchTerm.toLowerCase());
    });
  }, [reportData, roleFilter, searchTerm]);

  const recentLeaves = useMemo(() => {
    const rows = reportData?.recentLeaveRequests || [];
    return rows.filter((item) => {
      const matchesRole = roleFilter === 'All' || item.role === roleFilter;
      const haystack = [item.name, item.email, item.role, item.leaveType, item.status].filter(Boolean).join(' ').toLowerCase();
      return matchesRole && haystack.includes(searchTerm.toLowerCase());
    });
  }, [reportData, roleFilter, searchTerm]);

  const topPayrollRecipients = useMemo(() => {
    const rows = reportData?.topPayrollRecipients || [];
    return rows.filter((item) => roleFilter === 'All' || item.role === roleFilter);
  }, [reportData, roleFilter]);

  const kpis = [
    {
      title: 'Total Users',
      value: formatNumber(summary.totalUsers),
      sub: `${formatNumber(summary.approvedUsers)} approved accounts`,
      icon: <Users size={18} className="text-blue-400" />,
    },
    {
      title: 'Payroll Total',
      value: formatMoney(summary.payrollTotal),
      sub: `${formatMoney(summary.averageNetPay)} average net pay`,
      icon: <Wallet size={18} className="text-emerald-400" />,
    },
    {
      title: 'Attendance Rate',
      value: `${formatNumber(summary.attendanceRate)}%`,
      sub: `${formatNumber(summary.attendanceRecords)} records in range`,
      icon: <Activity size={18} className="text-cyan-400" />,
    },
    {
      title: 'Open Work',
      value: formatNumber(summary.openTasks),
      sub: `${formatNumber(summary.pendingLeaves)} pending leave requests`,
      icon: <TrendingUp size={18} className="text-amber-400" />,
    },
  ];

  const exportCsv = () => {
    if (!reportData) return;

    const rows = [
      ['Metric', 'Value'],
      ['Total Users', summary.totalUsers],
      ['Approved Users', summary.approvedUsers],
      ['Payroll Total', summary.payrollTotal],
      ['Average Net Pay', summary.averageNetPay],
      ['Attendance Rate', `${summary.attendanceRate}%`],
      ['Open Tasks', summary.openTasks],
      [],
      ['Recent Payroll'],
      ['Name', 'Email', 'Role', 'Period', 'Basic', 'Allowances', 'Deductions', 'Net Pay'],
      ...recentPayrolls.map((item) => [item.name, item.email, item.role, `${item.month} ${item.year}`, item.basic, item.allowances, item.deductions, item.netPay]),
      [],
      ['Recent Leave Requests'],
      ['Name', 'Email', 'Role', 'Leave Type', 'Start', 'End', 'Status'],
      ...recentLeaves.map((item) => [item.name, item.email, item.role, item.leaveType, item.startDate, item.endDate, item.status]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    void loadReports();
  };

  const renderRoleBadge = (role) => {
    const styles = {
      Admin: 'bg-red-500/10 text-red-400 border-red-500/20',
      HR: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      Employee: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[role] || 'border-slate-700 text-slate-300'}`}>{role || 'Unknown'}</span>;
  };

  const renderStatusBadge = (status) => {
    const styles = {
      Approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      Rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
      Done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'To Do': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] || 'border-slate-700 bg-slate-700/30 text-slate-300'}`}>{status}</span>;
  };

  return (
    <div className="flex flex-col gap-6 pb-8 text-[var(--text-primary)] font-sans">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Reports</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Review live workforce, payroll, attendance, leave, task, and training metrics from the database.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-blue-500/50"
          >
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={exportCsv}
            disabled={!reportData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={loadReports}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <form onSubmit={handleApplyFilters} className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-muted)]">
              <Calendar size={14} />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(event) => setDateRange((prev) => ({ ...prev, startDate: event.target.value }))}
                className="bg-transparent text-sm text-[var(--text-primary)] outline-none"
              />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-muted)]">
              <Calendar size={14} />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(event) => setDateRange((prev) => ({ ...prev, endDate: event.target.value }))}
                className="bg-transparent text-sm text-[var(--text-primary)] outline-none"
              />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-muted)]">
              <Filter size={14} />
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="bg-transparent text-sm text-[var(--text-primary)] outline-none">
                <option value="All">All roles</option>
                <option value="Admin">Admin</option>
                <option value="HR">HR</option>
                <option value="Employee">Employee</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex min-w-[260px] items-center gap-3 rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2.5">
              <Search size={16} className="text-[var(--text-muted)]" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search staff, role, or status"
                className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
            </div>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500">
              Apply Range
            </button>
          </div>
        </div>
      </form>

      {errorMessage ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errorMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="flex h-[50vh] items-center justify-center text-[var(--text-muted)]">
          <Loader2 className="mr-2 animate-spin" size={22} /> Loading live system reports...
        </div>
      ) : reportData ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => (
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

          <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-2 shadow-sm">
            {reportTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {(activeTab === 'overview' || activeTab === 'payroll') && (
            <div className="grid gap-5 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm xl:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold">Payroll Trend</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Gross, net pay, and deductions by period.</p>
                  </div>
                  <BarChart3 size={18} className="text-blue-400" />
                </div>
                <div className="h-[290px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={payrollTrend}>
                      <defs>
                        <linearGradient id="reportNet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} dx={-8} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} formatter={(value) => formatMoney(value)} />
                      <Area type="monotone" dataKey="grossPay" name="Gross Pay" stroke="#10b981" strokeWidth={2} fill="transparent" />
                      <Area type="monotone" dataKey="netPay" name="Net Pay" stroke="#3b82f6" strokeWidth={2} fill="url(#reportNet)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold">Account Status</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Approval state across users.</p>
                  </div>
                  <ShieldCheck size={18} className="text-emerald-400" />
                </div>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusBreakdown} dataKey="total" nameKey="status" innerRadius={48} outerRadius={82} paddingAngle={4}>
                        {statusBreakdown.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {statusBreakdown.map((item, index) => (
                    <div key={item.status} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-[var(--text-muted)]"><span className="h-2.5 w-2.5 rounded-full" style={{ background: chartColors[index % chartColors.length] }} />{item.status}</span>
                      <span className="font-semibold">{formatNumber(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'people') && (
            <div className="grid gap-5 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
                <h2 className="text-base font-semibold">Role Breakdown</h2>
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="border-b border-slate-800/80 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                      <tr><th className="px-4 py-3">Role</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Approved</th><th className="px-4 py-3">Pending</th><th className="px-4 py-3">Rejected</th></tr>
                    </thead>
                    <tbody>
                      {roleBreakdown.map((item) => (
                        <tr key={item.role} className="border-b border-slate-800/70">
                          <td className="px-4 py-4">{renderRoleBadge(item.role)}</td>
                          <td className="px-4 py-4 font-semibold">{formatNumber(item.total)}</td>
                          <td className="px-4 py-4 text-emerald-400">{formatNumber(item.approved)}</td>
                          <td className="px-4 py-4 text-amber-400">{formatNumber(item.pending)}</td>
                          <td className="px-4 py-4 text-red-400">{formatNumber(item.rejected)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
                <h2 className="text-base font-semibold">Department Distribution</h2>
                <div className="mt-5 h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentBreakdown} layout="vertical" margin={{ left: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis dataKey="department" type="category" width={110} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                      <Bar dataKey="total" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'operations') && (
            <div className="grid gap-5 xl:grid-cols-3">
              {[
                { title: 'Attendance', rows: attendanceByStatus, keyName: 'status', valueName: 'total', color: '#06b6d4' },
                { title: 'Leave Requests', rows: leaveByStatus, keyName: 'status', valueName: 'total', color: '#f59e0b' },
                { title: 'Tasks', rows: taskByStatus, keyName: 'status', valueName: 'total', color: '#3b82f6' },
              ].map((section) => (
                <div key={section.title} className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
                  <h2 className="text-base font-semibold">{section.title}</h2>
                  <div className="mt-5 space-y-3">
                    {section.rows.length > 0 ? section.rows.map((item) => {
                      const max = Math.max(...section.rows.map((row) => toNumber(row[section.valueName])), 1);
                      return (
                        <div key={item[section.keyName]}>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-[var(--text-muted)]">{item[section.keyName]}</span>
                            <span className="font-semibold">{formatNumber(item[section.valueName])}</span>
                          </div>
                          <div className="h-2 rounded-full bg-[var(--bg-input)]">
                            <div className="h-full rounded-full" style={{ width: `${(toNumber(item[section.valueName]) / max) * 100}%`, background: section.color }} />
                          </div>
                        </div>
                      );
                    }) : <p className="text-sm text-[var(--text-muted)]">No records in selected range.</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(activeTab === 'operations') && (
            <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
              <h2 className="text-base font-semibold">Training Progress</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {trainingStatus.map((item) => (
                  <div key={item.status} className="rounded-xl border border-slate-800/80 bg-[var(--bg-input)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      {renderStatusBadge(item.status)}
                      <span className="text-sm font-semibold">{formatNumber(item.total)}</span>
                    </div>
                    <p className="mt-4 text-2xl font-semibold">{toNumber(item.avgProgress).toFixed(1)}%</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Average progress</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'payroll') && (
            <div className="grid gap-5 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm xl:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-base font-semibold">Recent Payroll Records</h2>
                  <FileText size={18} className="text-blue-400" />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="border-b border-slate-800/80 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                      <tr><th className="px-4 py-3">Staff</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Period</th><th className="px-4 py-3">Gross</th><th className="px-4 py-3">Deductions</th><th className="px-4 py-3">Net</th></tr>
                    </thead>
                    <tbody>
                      {recentPayrolls.length > 0 ? recentPayrolls.map((item) => (
                        <tr key={item.id} className="border-b border-slate-800/70 transition hover:bg-slate-800/30">
                          <td className="px-4 py-4"><div className="font-semibold">{item.name || 'Unknown'}</div><div className="text-xs text-[var(--text-muted)]">{item.email || 'No email'}</div></td>
                          <td className="px-4 py-4">{renderRoleBadge(item.role)}</td>
                          <td className="px-4 py-4 text-sm text-[var(--text-muted)]">{item.month} {item.year}</td>
                          <td className="px-4 py-4 text-sm">{formatMoney(toNumber(item.basic) + toNumber(item.allowances))}</td>
                          <td className="px-4 py-4 text-sm text-red-400">-{formatMoney(item.deductions)}</td>
                          <td className="px-4 py-4 text-sm font-semibold text-blue-400">{formatMoney(item.netPay)}</td>
                        </tr>
                      )) : <tr><td colSpan="6" className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">No payroll records match the filters.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
                <h2 className="text-base font-semibold">Top Payroll Recipients</h2>
                <div className="mt-5 space-y-3">
                  {topPayrollRecipients.length > 0 ? topPayrollRecipients.map((item, index) => (
                    <div key={item.id} className="rounded-xl border border-slate-800/80 bg-[var(--bg-input)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{index + 1}. {item.name}</p>
                          <p className="mt-1 text-xs text-[var(--text-muted)]">{item.role} - {formatNumber(item.payrollCount)} records</p>
                        </div>
                        <p className="text-sm font-semibold text-blue-400">{formatMoney(item.totalNetPay)}</p>
                      </div>
                    </div>
                  )) : <p className="text-sm text-[var(--text-muted)]">No recipients match the role filter.</p>}
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'operations') && (
            <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
              <h2 className="text-base font-semibold">Recent Leave Requests</h2>
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="border-b border-slate-800/80 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                    <tr><th className="px-4 py-3">Staff</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Status</th></tr>
                  </thead>
                  <tbody>
                    {recentLeaves.length > 0 ? recentLeaves.map((item) => (
                      <tr key={item.id} className="border-b border-slate-800/70 transition hover:bg-slate-800/30">
                        <td className="px-4 py-4"><div className="font-semibold">{item.name || 'Unknown'}</div><div className="text-xs text-[var(--text-muted)]">{item.email || 'No email'}</div></td>
                        <td className="px-4 py-4">{renderRoleBadge(item.role)}</td>
                        <td className="px-4 py-4 text-sm text-[var(--text-muted)]">{item.leaveType}</td>
                        <td className="px-4 py-4 text-sm text-[var(--text-muted)]">{item.startDate} to {item.endDate}</td>
                        <td className="px-4 py-4">{renderStatusBadge(item.status)}</td>
                      </tr>
                    )) : <tr><td colSpan="5" className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">No leave requests match the filters.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default AdminReports;



