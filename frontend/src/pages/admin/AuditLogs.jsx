import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';
import api from '../../services/api';

const today = new Date().toISOString().slice(0, 10);
const monthStart = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;
const numberFormat = new Intl.NumberFormat('en-US');

const statusStyles = {
  Success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Failed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const roleStyles = {
  Admin: 'bg-red-500/10 text-red-400 border-red-500/20',
  HR: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Employee: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Guest: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [modules, setModules] = useState([]);
  const [moduleBreakdown, setModuleBreakdown] = useState([]);
  const [actorBreakdown, setActorBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({
    module: 'All',
    actorRole: 'All',
    status: 'All',
    search: '',
    startDate: monthStart,
    endDate: today,
  });

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/audit-logs', { params: filters });
      setLogs(response.data?.logs || []);
      setStats(response.data?.stats || {});
      setModules(response.data?.modules || []);
      setModuleBreakdown(response.data?.moduleBreakdown || []);
      setActorBreakdown(response.data?.actorBreakdown || []);
      setErrorMessage('');
    } catch (error) {
      console.error('Unable to load audit logs:', error);
      setErrorMessage(error.response?.data?.message || 'Unable to load audit logs.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const summaryCards = [
    { title: 'Total Logs', value: numberFormat.format(Number(stats.totalLogs || 0)), sub: 'Tracked system events', icon: <Activity size={18} className="text-blue-400" /> },
    { title: 'Successful', value: numberFormat.format(Number(stats.successfulActions || 0)), sub: 'Completed write actions', icon: <CheckCircle2 size={18} className="text-emerald-400" /> },
    { title: 'Failed', value: numberFormat.format(Number(stats.failedActions || 0)), sub: 'Rejected or errored actions', icon: <AlertTriangle size={18} className="text-red-400" /> },
    { title: 'Modules', value: numberFormat.format(Number(stats.activeModules || 0)), sub: 'Areas with activity', icon: <ShieldCheck size={18} className="text-purple-400" /> },
  ];

  const filteredModules = useMemo(() => ['All', ...modules], [modules]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStatus = (statusCode) => Number(statusCode || 0) < 400 ? 'Success' : 'Failed';

  const parseDetails = (details) => {
    if (!details) return {};
    if (typeof details === 'object') return details;
    try {
      return JSON.parse(details);
    } catch (error) {
      return { raw: details };
    }
  };

  const exportCsv = () => {
    const headers = ['Time', 'Actor Role', 'Action', 'Module', 'Method', 'Endpoint', 'Status Code', 'IP Address'];
    const rows = logs.map((log) => [
      log.createdAt,
      log.actorRole,
      log.action,
      log.module,
      log.method,
      log.endpoint,
      log.statusCode,
      log.ipAddress,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${filters.startDate}-to-${filters.endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteLog = async (logId) => {
    if (!window.confirm('Delete this audit log entry?')) return;
    try {
      await api.delete(`/admin/audit-logs/${logId}`);
      setSelectedLog(null);
      await loadLogs();
    } catch (error) {
      console.error('Unable to delete audit log:', error);
      setErrorMessage(error.response?.data?.message || 'Unable to delete audit log.');
    }
  };

  const clearLogs = async () => {
    if (!window.confirm('Clear all audit logs? This cannot be undone.')) return;
    try {
      await api.delete('/admin/audit-logs');
      setSelectedLog(null);
      await loadLogs();
    } catch (error) {
      console.error('Unable to clear audit logs:', error);
      setErrorMessage(error.response?.data?.message || 'Unable to clear audit logs.');
    }
  };

  const roleBadge = (role) => (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${roleStyles[role] || roleStyles.Guest}`}>{role || 'Guest'}</span>
  );

  const statusBadge = (statusCode) => {
    const status = getStatus(statusCode);
    return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>{status}</span>;
  };

  return (
    <div className="flex flex-col gap-6 pb-8 text-[var(--text-primary)] font-sans">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Track admin, payroll, settings, user management, login, and registration activity from the database.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportCsv} disabled={logs.length === 0} className="inline-flex items-center gap-2 rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50">
            <Download size={16} />
            Export CSV
          </button>
          <button onClick={clearLogs} disabled={logs.length === 0} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50">
            <Trash2 size={16} />
            Clear Logs
          </button>
          <button onClick={loadLogs} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {errorMessage ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{errorMessage}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
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

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2.5">
              <Search size={16} className="text-[var(--text-muted)]" />
              <input value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search action, module, endpoint, or role" className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-muted)]">
                <Filter size={14} />
                <select value={filters.module} onChange={(event) => updateFilter('module', event.target.value)} className="bg-transparent text-sm text-[var(--text-primary)] outline-none">
                  {filteredModules.map((moduleName) => <option key={moduleName} value={moduleName}>{moduleName === 'All' ? 'All modules' : moduleName}</option>)}
                </select>
              </label>
              <select value={filters.actorRole} onChange={(event) => updateFilter('actorRole', event.target.value)} className="rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none">
                <option value="All">All roles</option>
                <option value="Admin">Admin</option>
                <option value="HR">HR</option>
                <option value="Employee">Employee</option>
                <option value="Guest">Guest</option>
              </select>
              <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className="rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none">
                <option value="All">All status</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
              </select>
              <input type="date" value={filters.startDate} onChange={(event) => updateFilter('startDate', event.target.value)} className="rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none" />
              <input type="date" value={filters.endDate} onChange={(event) => updateFilter('endDate', event.target.value)} className="rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none" />
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800/80 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-sm text-[var(--text-muted)]"><Loader2 size={16} className="mr-2 inline animate-spin" />Loading audit logs...</td></tr>
                ) : logs.length > 0 ? logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-800/70 transition hover:bg-slate-800/30">
                    <td className="px-4 py-4 text-sm text-[var(--text-muted)]">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-4">{roleBadge(log.actorRole)}</td>
                    <td className="px-4 py-4"><div className="font-semibold">{log.action}</div><div className="text-xs text-[var(--text-muted)]">{log.method} {log.endpoint}</div></td>
                    <td className="px-4 py-4 text-sm text-[var(--text-primary)]">{log.module}</td>
                    <td className="px-4 py-4">{statusBadge(log.statusCode)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedLog(log)} className="rounded-lg border border-slate-700/70 bg-[var(--bg-input)] p-2 text-[var(--text-muted)] transition hover:text-blue-400" title="View details"><Eye size={15} /></button>
                        <button onClick={() => deleteLog(log.id)} className="rounded-lg border border-slate-700/70 bg-[var(--bg-input)] p-2 text-[var(--text-muted)] transition hover:text-red-400" title="Delete log"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">No audit logs match the selected filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
            <h2 className="text-base font-semibold">Module Activity</h2>
            <div className="mt-5 space-y-3">
              {moduleBreakdown.length > 0 ? moduleBreakdown.map((item) => {
                const max = Math.max(...moduleBreakdown.map((row) => Number(row.total || 0)), 1);
                return (
                  <div key={item.module}>
                    <div className="mb-2 flex items-center justify-between text-sm"><span className="text-[var(--text-muted)]">{item.module}</span><span className="font-semibold">{item.total}</span></div>
                    <div className="h-2 rounded-full bg-[var(--bg-input)]"><div className="h-full rounded-full bg-blue-500" style={{ width: `${(Number(item.total || 0) / max) * 100}%` }} /></div>
                  </div>
                );
              }) : <p className="text-sm text-[var(--text-muted)]">No module activity yet.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
            <h2 className="text-base font-semibold">Actor Roles</h2>
            <div className="mt-5 space-y-3">
              {actorBreakdown.length > 0 ? actorBreakdown.map((item) => (
                <div key={item.actorRole || 'Guest'} className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-[var(--bg-input)] p-3">
                  {roleBadge(item.actorRole || 'Guest')}
                  <span className="font-semibold">{item.total}</span>
                </div>
              )) : <p className="text-sm text-[var(--text-muted)]">No actor activity yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Audit detail</p>
                <h3 className="mt-1 text-xl font-semibold">{selectedLog.action}</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-slate-800/50" title="Close"><XCircle size={18} /></button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[var(--bg-input)] p-4"><p className="text-xs text-[var(--text-muted)]">Module</p><p className="mt-1 font-semibold">{selectedLog.module}</p></div>
              <div className="rounded-xl bg-[var(--bg-input)] p-4"><p className="text-xs text-[var(--text-muted)]">Actor</p><div className="mt-2">{roleBadge(selectedLog.actorRole)}</div></div>
              <div className="rounded-xl bg-[var(--bg-input)] p-4"><p className="text-xs text-[var(--text-muted)]">Endpoint</p><p className="mt-1 break-all text-sm">{selectedLog.method} {selectedLog.endpoint}</p></div>
              <div className="rounded-xl bg-[var(--bg-input)] p-4"><p className="text-xs text-[var(--text-muted)]">Status</p><div className="mt-2">{statusBadge(selectedLog.statusCode)}</div></div>
            </div>
            <div className="mt-4 rounded-xl border border-slate-800/80 bg-[var(--bg-input)] p-4">
              <p className="mb-3 text-sm font-semibold">Details</p>
              <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap text-xs text-[var(--text-muted)]">{JSON.stringify(parseDetails(selectedLog.details), null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
