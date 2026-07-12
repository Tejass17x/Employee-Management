import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  Shield,
  SlidersHorizontal,
} from 'lucide-react';
import api from '../../services/api';

const tabs = [
  { key: 'organization', label: 'Organization', icon: <Building2 size={16} /> },
  { key: 'security', label: 'Security', icon: <Shield size={16} /> },
  { key: 'attendance', label: 'Attendance', icon: <CalendarClock size={16} /> },
  { key: 'payroll', label: 'Payroll', icon: <DollarSign size={16} /> },
  { key: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
];

const fallbackSettings = {
  organization: {
    companyName: 'Nexus HR',
    companyEmail: 'admin@nexus.io',
    timezone: 'Asia/Calcutta',
    fiscalYearStart: 'January',
    defaultCurrency: 'USD',
  },
  security: {
    requireApprovalForSignup: true,
    allowEmployeeSelfRegistration: true,
    sessionTimeoutMinutes: 60,
    passwordMinLength: 8,
    maintenanceMode: false,
  },
  attendance: {
    workdayStart: '09:00',
    workdayEnd: '18:00',
    lateGraceMinutes: 15,
    weeklyWorkDays: 5,
    allowSelfCheckout: true,
  },
  payroll: {
    payrollCycle: 'Monthly',
    payDay: 30,
    overtimeEnabled: false,
    taxDeductionLabel: 'Taxes & PF',
    autoGeneratePayslips: false,
  },
  notifications: {
    emailNotifications: true,
    leaveAlerts: true,
    payrollAlerts: true,
    taskAlerts: true,
    systemDigest: 'Weekly',
  },
};

const monthOptions = ['January', 'April', 'July', 'October'];
const timezoneOptions = ['Asia/Calcutta', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Dubai'];
const currencyOptions = ['USD', 'INR', 'EUR', 'GBP', 'AED'];
const payrollCycles = ['Monthly', 'Biweekly', 'Weekly'];
const digestOptions = ['Daily', 'Weekly', 'Monthly', 'Disabled'];

const AdminSystemSettings = () => {
  const [settings, setSettings] = useState(fallbackSettings);
  const [defaults, setDefaults] = useState(fallbackSettings);
  const [activeTab, setActiveTab] = useState('organization');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      setSettings(response.data?.settings || fallbackSettings);
      setDefaults(response.data?.defaults || fallbackSettings);
      setUpdatedAt(response.data?.updatedAt || null);
      setErrorMessage('');
    } catch (error) {
      console.error('Unable to load system settings:', error);
      setErrorMessage(error.response?.data?.message || 'Unable to load system settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const updateField = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setMessage('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put('/admin/settings', { settings });
      if (response.data?.success) {
        setSettings(response.data.settings || settings);
        setMessage('System settings saved successfully.');
        setErrorMessage('');
        await loadSettings();
      } else {
        setErrorMessage(response.data?.message || 'Unable to save system settings.');
      }
    } catch (error) {
      console.error('Unable to save system settings:', error);
      setErrorMessage(error.response?.data?.message || 'Unable to save system settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset system settings to default values?')) return;

    try {
      setResetting(true);
      const response = await api.post('/admin/settings/reset');
      if (response.data?.success) {
        setSettings(response.data.settings || defaults);
        setMessage('System settings reset to defaults.');
        setErrorMessage('');
        await loadSettings();
      } else {
        setErrorMessage(response.data?.message || 'Unable to reset system settings.');
      }
    } catch (error) {
      console.error('Unable to reset system settings:', error);
      setErrorMessage(error.response?.data?.message || 'Unable to reset system settings.');
    } finally {
      setResetting(false);
    }
  };

  const changedCount = useMemo(() => {
    return Object.keys(fallbackSettings).reduce((count, section) => {
      const fields = Object.keys(fallbackSettings[section]);
      return count + fields.filter((field) => String(settings?.[section]?.[field]) !== String(defaults?.[section]?.[field])).length;
    }, 0);
  }, [defaults, settings]);

  const summaryCards = [
    { title: 'Active Module', value: tabs.find((tab) => tab.key === activeTab)?.label, sub: 'Currently editing', icon: <SlidersHorizontal size={18} className="text-blue-400" /> },
    { title: 'Custom Values', value: changedCount, sub: 'Different from defaults', icon: <CheckCircle2 size={18} className="text-emerald-400" /> },
    { title: 'Session Timeout', value: `${settings.security.sessionTimeoutMinutes}m`, sub: 'Admin security window', icon: <Clock size={18} className="text-amber-400" /> },
    { title: 'Payroll Cycle', value: settings.payroll.payrollCycle, sub: `Pay day ${settings.payroll.payDay}`, icon: <DollarSign size={18} className="text-purple-400" /> },
  ];

  const Toggle = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-[var(--bg-input)] p-4">
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 flex-shrink-0 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-slate-700'}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );

  const Field = ({ label, children }) => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[var(--text-muted)]">{label}</span>
      {children}
    </label>
  );

  const inputClass = 'w-full rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-blue-500';

  const renderTabContent = () => {
    if (activeTab === 'organization') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Company name">
            <input className={inputClass} value={settings.organization.companyName} onChange={(event) => updateField('organization', 'companyName', event.target.value)} />
          </Field>
          <Field label="Company email">
            <input type="email" className={inputClass} value={settings.organization.companyEmail} onChange={(event) => updateField('organization', 'companyEmail', event.target.value)} />
          </Field>
          <Field label="Timezone">
            <select className={inputClass} value={settings.organization.timezone} onChange={(event) => updateField('organization', 'timezone', event.target.value)}>
              {timezoneOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Fiscal year starts">
            <select className={inputClass} value={settings.organization.fiscalYearStart} onChange={(event) => updateField('organization', 'fiscalYearStart', event.target.value)}>
              {monthOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Default currency">
            <select className={inputClass} value={settings.organization.defaultCurrency} onChange={(event) => updateField('organization', 'defaultCurrency', event.target.value)}>
              {currencyOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
        </div>
      );
    }

    if (activeTab === 'security') {
      return (
        <div className="grid gap-4 lg:grid-cols-2">
          <Toggle checked={settings.security.requireApprovalForSignup} onChange={(value) => updateField('security', 'requireApprovalForSignup', value)} label="Require account approval" description="New HR and employee registrations need admin review." />
          <Toggle checked={settings.security.allowEmployeeSelfRegistration} onChange={(value) => updateField('security', 'allowEmployeeSelfRegistration', value)} label="Allow self registration" description="Users can request access from the login screen." />
          <Toggle checked={settings.security.maintenanceMode} onChange={(value) => updateField('security', 'maintenanceMode', value)} label="Maintenance mode" description="Mark the portal as under maintenance for operational pauses." />
          <Field label="Session timeout minutes">
            <input type="number" min="15" max="480" className={inputClass} value={settings.security.sessionTimeoutMinutes} onChange={(event) => updateField('security', 'sessionTimeoutMinutes', Number(event.target.value))} />
          </Field>
          <Field label="Minimum password length">
            <input type="number" min="6" max="32" className={inputClass} value={settings.security.passwordMinLength} onChange={(event) => updateField('security', 'passwordMinLength', Number(event.target.value))} />
          </Field>
        </div>
      );
    }

    if (activeTab === 'attendance') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Workday start">
            <input type="time" className={inputClass} value={settings.attendance.workdayStart} onChange={(event) => updateField('attendance', 'workdayStart', event.target.value)} />
          </Field>
          <Field label="Workday end">
            <input type="time" className={inputClass} value={settings.attendance.workdayEnd} onChange={(event) => updateField('attendance', 'workdayEnd', event.target.value)} />
          </Field>
          <Field label="Late grace minutes">
            <input type="number" min="0" max="120" className={inputClass} value={settings.attendance.lateGraceMinutes} onChange={(event) => updateField('attendance', 'lateGraceMinutes', Number(event.target.value))} />
          </Field>
          <Field label="Weekly work days">
            <input type="number" min="1" max="7" className={inputClass} value={settings.attendance.weeklyWorkDays} onChange={(event) => updateField('attendance', 'weeklyWorkDays', Number(event.target.value))} />
          </Field>
          <Toggle checked={settings.attendance.allowSelfCheckout} onChange={(value) => updateField('attendance', 'allowSelfCheckout', value)} label="Allow self checkout" description="Employees can check out from their attendance page." />
        </div>
      );
    }

    if (activeTab === 'payroll') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Payroll cycle">
            <select className={inputClass} value={settings.payroll.payrollCycle} onChange={(event) => updateField('payroll', 'payrollCycle', event.target.value)}>
              {payrollCycles.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Pay day">
            <input type="number" min="1" max="31" className={inputClass} value={settings.payroll.payDay} onChange={(event) => updateField('payroll', 'payDay', Number(event.target.value))} />
          </Field>
          <Field label="Deduction label">
            <input className={inputClass} value={settings.payroll.taxDeductionLabel} onChange={(event) => updateField('payroll', 'taxDeductionLabel', event.target.value)} />
          </Field>
          <Toggle checked={settings.payroll.overtimeEnabled} onChange={(value) => updateField('payroll', 'overtimeEnabled', value)} label="Enable overtime" description="Allow payroll policy to include overtime calculations." />
          <Toggle checked={settings.payroll.autoGeneratePayslips} onChange={(value) => updateField('payroll', 'autoGeneratePayslips', value)} label="Auto-generate payslips" description="Prepare payslip records automatically for active staff." />
        </div>
      );
    }

    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Toggle checked={settings.notifications.emailNotifications} onChange={(value) => updateField('notifications', 'emailNotifications', value)} label="Email notifications" description="Send system notifications through email where supported." />
        <Toggle checked={settings.notifications.leaveAlerts} onChange={(value) => updateField('notifications', 'leaveAlerts', value)} label="Leave alerts" description="Notify admins and HR about leave status changes." />
        <Toggle checked={settings.notifications.payrollAlerts} onChange={(value) => updateField('notifications', 'payrollAlerts', value)} label="Payroll alerts" description="Notify staff when payroll records are updated." />
        <Toggle checked={settings.notifications.taskAlerts} onChange={(value) => updateField('notifications', 'taskAlerts', value)} label="Task alerts" description="Notify employees about task updates and deadlines." />
        <Field label="System digest">
          <select className={inputClass} value={settings.notifications.systemDigest} onChange={(event) => updateField('notifications', 'systemDigest', event.target.value)}>
            {digestOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </Field>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-8 text-[var(--text-primary)] font-sans">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Configure organization defaults, access policies, attendance rules, payroll behavior, and notifications.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={loadSettings} className="inline-flex items-center gap-2 rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-blue-500/50">
            <RefreshCw size={16} />
            Reload
          </button>
          <button onClick={handleReset} disabled={resetting} className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-70">
            {resetting ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
            Reset
          </button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Settings
          </button>
        </div>
      </div>

      {errorMessage ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{errorMessage}</div> : null}
      {message ? <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">{message}</div> : null}

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

      <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-3 shadow-sm">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Settings sections</div>
          <div className="mt-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-slate-800/80 bg-[var(--bg-input)] p-4">
            <p className="text-sm font-semibold">Last saved</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{updatedAt ? new Date(updatedAt).toLocaleString() : 'Defaults are active'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">{tabs.find((tab) => tab.key === activeTab)?.label}</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Changes are saved to the database and reloaded across admin sessions.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
              <CheckCircle2 size={14} />
              Live database settings
            </span>
          </div>

          {loading ? (
            <div className="flex h-[260px] items-center justify-center text-[var(--text-muted)]">
              <Loader2 size={22} className="mr-2 animate-spin" /> Loading settings...
            </div>
          ) : renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminSystemSettings;
