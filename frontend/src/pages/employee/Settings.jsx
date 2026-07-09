import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Eye, Globe, Save, Loader2, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);

  // Forms states
  const [accountForm, setAccountForm] = useState({
    username: user?.name || '',
    email: user?.email || '',
    timezone: 'UTC-08:00 (Pacific Time)'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [toggles, setToggles] = useState({
    twoFactor: false,
    emailAlerts: true,
    taskAlerts: true,
    leaveUpdates: true,
    themeMode: 'dark',
    lang: 'en'
  });

  const handleSaveAccount = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Account settings updated successfully!');
    }, 800);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    }, 800);
  };

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="text-white font-sans pb-10">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Navigation Links */}
        <div className="w-full lg:w-1/4 bg-[#12192b] p-4 rounded-2xl border border-slate-800 flex flex-col gap-1.5 h-fit">
          {[
            { id: 'account', name: 'Account Settings', icon: <SettingsIcon size={16} /> },
            { id: 'security', name: 'Security & Auth', icon: <Shield size={16} /> },
            { id: 'notifications', name: 'Notifications Toggles', icon: <Bell size={16} /> },
            { id: 'appearance', name: 'Appearance & UI', icon: <Eye size={16} /> },
            { id: 'language', name: 'Region & Language', icon: <Globe size={16} /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-left transition-all ${
                activeTab === t.id ? 'bg-[#1a233a] text-blue-400 border border-blue-500/10' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.icon}
              {t.name}
            </button>
          ))}
        </div>

        {/* Right Side: Tab Contents */}
        <div className="flex-1 bg-[#12192b] p-6 rounded-2xl border border-slate-800 min-h-[400px]">
          
          {activeTab === 'account' && (
            <form onSubmit={handleSaveAccount} className="space-y-4 max-w-lg">
              <h3 className="text-base font-bold mb-4">Account Settings</h3>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">DISPLAY NAME</label>
                <input 
                  type="text" 
                  value={accountForm.username}
                  onChange={e => setAccountForm({ ...accountForm, username: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  disabled
                  value={accountForm.email}
                  className="w-full px-4 py-2.5 bg-[#0a0f1c]/50 border border-slate-800 rounded-lg outline-none text-sm text-slate-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">TIMEZONE</label>
                <select 
                  value={accountForm.timezone}
                  onChange={e => setAccountForm({ ...accountForm, timezone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                >
                  <option>UTC-08:00 (Pacific Time)</option>
                  <option>UTC-05:00 (Eastern Time)</option>
                  <option>UTC+00:00 (GMT/UTC)</option>
                  <option>UTC+05:30 (India Standard Time)</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Settings
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-lg">
              {/* Change password */}
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <h3 className="text-base font-bold mb-4">Change Password</h3>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">CURRENT PASSWORD</label>
                  <input 
                    type="password" 
                    required
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">NEW PASSWORD</label>
                  <input 
                    type="password" 
                    required
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">CONFIRM NEW PASSWORD</label>
                  <input 
                    type="password" 
                    required
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Key size={16} />} Update Password
                </button>
              </form>

              {/* 2FA Toggle */}
              <div className="border-t border-slate-800 pt-6">
                <div className="flex justify-between items-center bg-[#0a0f1c] p-4 rounded-xl border border-slate-800/80">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Require verification code sent to your email when logging in.</p>
                  </div>
                  <button 
                    onClick={() => handleToggle('twoFactor')}
                    className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
                      toggles.twoFactor ? 'bg-blue-600' : 'bg-slate-800'
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      toggles.twoFactor ? 'right-1' : 'left-1'
                    }`}></span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-bold mb-4">Notification Subscriptions</h3>
              {[
                { key: 'emailAlerts', title: 'System email alerts', desc: 'Get updates on company-wide news, holidays, policies.' },
                { key: 'taskAlerts', title: 'Task assignments', desc: 'Notify me when I am assigned a new task or priority changes.' },
                { key: 'leaveUpdates', title: 'Leave approval status', desc: 'Get immediate confirmation or update on leave requests.' }
              ].map(item => (
                <div key={item.key} className="flex justify-between items-center bg-[#0a0f1c] p-4 rounded-xl border border-slate-800/80">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                  </div>
                  <button 
                    onClick={() => handleToggle(item.key)}
                    className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
                      toggles[item.key] ? 'bg-blue-600' : 'bg-slate-800'
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      toggles[item.key] ? 'right-1' : 'left-1'
                    }`}></span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-bold mb-4">Appearance Settings</h3>
              <div className="flex justify-between items-center bg-[#0a0f1c] p-4 rounded-xl border border-slate-800/80">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Theme Mode</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Switch theme styling mode.</p>
                </div>
                <select
                  value={toggles.themeMode}
                  onChange={e => setToggles({ ...toggles, themeMode: e.target.value })}
                  className="bg-[#12192b] border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 outline-none"
                >
                  <option value="dark">Dark Theme (Active)</option>
                  <option value="light">Light Theme</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-bold mb-4">Regional & Language</h3>
              <div className="flex justify-between items-center bg-[#0a0f1c] p-4 rounded-xl border border-slate-800/80">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Language</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Set portal locale rendering language.</p>
                </div>
                <select
                  value={toggles.lang}
                  onChange={e => setToggles({ ...toggles, lang: e.target.value })}
                  className="bg-[#12192b] border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 outline-none"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Settings;
