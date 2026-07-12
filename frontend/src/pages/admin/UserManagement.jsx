import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Search,
  Users,
  ShieldCheck,
  UserPlus,
  Filter,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronRight,
} from 'lucide-react';

const statusStyles = {
  Approved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const roleStyles = {
  Admin: 'bg-red-500/10 text-red-400 border border-red-500/20',
  HR: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  Employee: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
};

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Employee', status: 'Pending' });
  const [errorMessage, setErrorMessage] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem('user');
      const storedRole = storedUser ? JSON.parse(storedUser)?.role : null;
      const roleParam = user?.role || storedRole || 'Admin';
      const response = await fetch(`http://localhost:5000/api/users/all?role=${encodeURIComponent(roleParam)}`);
      const data = await response.json();
      const rows = Array.isArray(data) ? data : [];
      const normalizedUsers = rows.map((entry) => ({
        id: entry.id,
        name: entry.name || 'Unnamed User',
        email: entry.email || 'No email',
        role: entry.role || 'Employee',
        status: entry.status || 'Approved',
      }));
      setUsers(normalizedUsers);
      setErrorMessage('');
    } catch (error) {
      console.error('Unable to load users:', error);
      setErrorMessage('Unable to load users from the server.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [user?.role]);

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        name: selectedUser.name || '',
        email: selectedUser.email || '',
        role: selectedUser.role || 'Employee',
        status: selectedUser.status || 'Pending',
      });
    }
  }, [selectedUser]);

  const filteredUsers = useMemo(() => {
    return users.filter((entry) => {
      const searchValue = [entry.name, entry.email, entry.role]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = searchValue.includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'All' || entry.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || entry.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const activeUsers = users.filter((entry) => entry.status === 'Approved').length;
    const pendingApprovals = users.filter((entry) => entry.status === 'Pending').length;
    const adminOrHr = users.filter((entry) => entry.role === 'Admin' || entry.role === 'HR').length;

    return [
      { title: 'Total Users', value: users.length, subtitle: 'Active accounts', icon: <Users size={18} className="text-blue-400" /> },
      { title: 'Active Users', value: activeUsers, subtitle: 'Approved access', icon: <ShieldCheck size={18} className="text-emerald-400" /> },
      { title: 'Pending', value: pendingApprovals, subtitle: 'Awaiting review', icon: <Clock3 size={18} className="text-amber-400" /> },
      { title: 'Admin/HR', value: adminOrHr, subtitle: 'Privileged roles', icon: <UserPlus size={18} className="text-purple-400" /> },
    ];
  }, [users]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedUser) return;

    try {
      const response = await api.put('/users/update', {
        id: selectedUser.id,
        ...formData,
      });

      if (response.data?.success) {
        await loadUsers();
        setSelectedUser(null);
      } else {
        setErrorMessage(response.data?.message || 'Unable to save changes.');
      }
    } catch (error) {
      console.error('Unable to save user:', error);
      setErrorMessage('Unable to save changes to the database.');
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: 'welcome123',
          role: formData.role,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setFormData({ name: '', email: '', role: 'Employee', status: 'Pending' });
        setShowAddModal(false);
        await loadUsers();
      } else {
        setErrorMessage(result.message || 'Unable to create user.');
      }
    } catch (error) {
      console.error('Unable to create user:', error);
      setErrorMessage('Unable to create user in the database.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Remove this user from the directory?')) return;

    try {
      const response = await api.delete(`/users/${userId}`);
      if (response.data?.success) {
        await loadUsers();
      } else {
        setErrorMessage(response.data?.message || 'Unable to remove this user.');
      }
    } catch (error) {
      console.error('Unable to delete user:', error);
      setErrorMessage('Unable to remove this user from the database.');
    }
  };

  const handleReviewStatus = async (entry) => {
    try {
      const response = await api.put('/users/action', {
        action: 'Approved',
        userId: entry.id,
      });

      if (response.data?.success) {
        await loadUsers();
      } else {
        setErrorMessage(response.data?.message || 'Unable to update approval status.');
      }
    } catch (error) {
      console.error('Unable to review user:', error);
      setErrorMessage('Unable to update the approval status.');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-[var(--text-primary)] font-sans pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Maintain access, review approvals, and keep the admin directory organized.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', role: 'Employee', status: 'Pending' });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">{item.title}</p>
                <h3 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">{item.value}</h3>
              </div>
              <div className="rounded-xl bg-[var(--bg-input)] p-2">{item.icon}</div>
            </div>
            <p className="mt-4 text-sm text-[var(--text-muted)]">{item.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2.5">
            <Search size={16} className="text-[var(--text-muted)]" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search user, email, or role"
              className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-muted)]">
              <Filter size={14} />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="bg-transparent text-sm text-[var(--text-primary)] outline-none">
                <option value="All">All status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
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
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="border-b border-slate-800/70">
                    <td colSpan="6" className="px-4 py-4 text-sm text-[var(--text-muted)]">Loading directory…</td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-800/70 transition hover:bg-slate-800/30">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${entry.role === 'Admin' ? 'bg-red-500/15 text-red-400' : entry.role === 'HR' ? 'bg-purple-500/15 text-purple-400' : 'bg-blue-500/15 text-blue-400'}`}>
                          {entry.name?.charAt(0) || 'U'}
                        </div>
                        <div className="font-semibold text-[var(--text-primary)]">{entry.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-muted)]">{entry.email}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleStyles[entry.role] || 'bg-slate-700/60 text-slate-200'}`}>
                        {entry.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[entry.status] || 'bg-slate-700/60 text-slate-200'}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedUser(entry)} className="rounded-lg border border-slate-700/70 bg-[var(--bg-input)] p-2 text-[var(--text-muted)] transition hover:text-blue-400" title="Edit user">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => handleReviewStatus(entry)} className="rounded-lg border border-slate-700/70 bg-[var(--bg-input)] p-2 text-[var(--text-muted)] transition hover:text-amber-400" title="Review status">
                          <CheckCircle2 size={15} />
                        </button>
                        <button onClick={() => handleDeleteUser(entry.id)} className="rounded-lg border border-slate-700/70 bg-[var(--bg-input)] p-2 text-[var(--text-muted)] transition hover:text-red-400" title="Remove user">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                    No users match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(showAddModal || selectedUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800/80 bg-[var(--bg-panel)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  {showAddModal ? 'Add user' : 'Edit access'}
                </p>
                <h3 className="mt-1 text-xl font-semibold">{showAddModal ? 'Create new account' : selectedUser?.name}</h3>
              </div>
              <button onClick={() => { setShowAddModal(false); setSelectedUser(null); }} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-slate-800/50">
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleCreateUser : handleSave} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">Full name</label>
                <input
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">Role</label>
                  <select
                    value={formData.role}
                    onChange={(event) => setFormData((prev) => ({ ...prev, role: event.target.value }))}
                    className="w-full rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none"
                  >
                    <option value="Admin">Admin</option>
                    <option value="HR">HR</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">Status</label>
                  <select
                    value={formData.status}
                    onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
                    className="w-full rounded-xl border border-slate-700/70 bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddModal(false); setSelectedUser(null); }} className="rounded-xl border border-slate-700/70 px-4 py-2 text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text-primary)]">
                  Cancel
                </button>
                <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">
                  {showAddModal ? 'Create user' : 'Save changes'}
                  <ChevronRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
