import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Layers, Menu, BarChart2, Users, DollarSign, FileText, Shield, Activity,
  Home, User, Clock, Calendar, CheckSquare, TrendingUp, MessageSquare,
  Bell, GraduationCap, Settings, LogOut, ChevronRight, Briefcase, Search
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const [theme, setTheme] = useState('dark');

  // Apply the "light" class to <html> whenever theme changes, so CSS
  // variables defined in index.css (.light { ... }) take effect app-wide.
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const getSidebarConfig = () => {
    if (user?.role === 'Admin') {
      return {
        label: 'ADMIN PORTAL',
        items: [
          { name: 'Analytics', path: '/admin', icon: <BarChart2 size={18} /> },
          { name: 'User Management', path: '/admin/users', icon: <Users size={18} /> },
          { name: 'Payroll', path: '/admin/payroll', icon: <DollarSign size={18} /> },
          { name: 'Reports', path: '/admin/reports', icon: <FileText size={18} /> },
          { name: 'System Settings', path: '/admin/settings', icon: <Shield size={18} /> },
          { name: 'Audit Logs', path: '/admin/logs', icon: <Activity size={18} /> }
        ]
      };
    }
    if (user?.role === 'HR') {
      return {
        label: 'HR PORTAL',
        items: [
          { name: 'Overview', path: '/hr', icon: <BarChart2 size={18} /> },
          { name: 'Employees', path: '/hr/employees', icon: <Users size={18} /> },
          { name: 'Leave Approval', path: '/hr/leaves', icon: <Calendar size={18} /> },
          { name: 'Recruitment', path: '/hr/recruitment', icon: <Briefcase size={18} /> },
          { name: 'Departments', path: '/hr/departments', icon: <Layers size={18} /> },
          { name: 'Performance', path: '/hr/performance', icon: <TrendingUp size={18} /> }
        ]
      };
    }
    return {
      label: 'EMPLOYEE PORTAL',
      items: [
        { name: 'Dashboard', path: '/employee', icon: <Home size={18} /> },
        { name: 'Profile', path: '/employee/profile', icon: <User size={18} /> },
        { name: 'Attendance', path: '/employee/attendance', icon: <Clock size={18} /> },
        { name: 'Leave', path: '/employee/leave', icon: <Calendar size={18} /> },
        { name: 'Payroll', path: '/employee/payroll', icon: <DollarSign size={18} /> },
        { name: 'Tasks', path: '/employee/tasks', icon: <CheckSquare size={18} /> },
        { name: 'Performance', path: '/employee/performance', icon: <TrendingUp size={18} /> },
        { name: 'Chat', path: '/employee/chat', icon: <MessageSquare size={18} /> },
        { name: 'Notifications', path: '/employee/notifications', icon: <Bell size={18} /> },
        { name: 'Training', path: '/employee/training', icon: <GraduationCap size={18} /> },
        { name: 'Documents', path: '/employee/documents', icon: <FileText size={18} /> },
        { name: 'Settings', path: '/employee/settings', icon: <Settings size={18} /> }
      ]
    };
  };

  const config = getSidebarConfig();

  const getInitials = (name) => {
    if (!name) return 'U';
    const split = name.split(' ');
    return split.length > 1 ? split[0][0] + split[1][0] : split[0][0];
  };

  const filteredResults = searchQuery.trim()
    ? config.items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  // Close search dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (path) => {
    navigate(path);
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className="h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)] flex font-sans overflow-hidden transition-colors duration-200">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-[260px] h-full flex flex-col border-r border-slate-800/80 bg-[var(--bg-panel)] flex-shrink-0 transition-colors duration-200">
        <div className="h-[72px] px-6 flex items-center justify-between border-b border-slate-800/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#3b82f6] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-wide">
              Nexus {user?.role === 'Employee' ? 'Portal' : user?.role}
            </span>
          </div>
          <button className="text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>
        </div>

        <div className="px-6 py-5 text-[11px] font-bold text-slate-500 tracking-wider flex-shrink-0">
          {config.label}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4 custom-scrollbar">
          {config.items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-[#1a233a] text-blue-100 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-blue-400' : 'text-slate-400'}`}>{item.icon}</span>
                  {item.name}
                </div>
                {isActive && <ChevronRight size={16} className="text-blue-400/70" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between flex-shrink-0 bg-[var(--bg-panel)]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${user?.role === 'Admin' ? 'bg-[#f59e0b] text-amber-950' : 'bg-[#3b82f6] text-white'
              }`}>
              {getInitials(user?.name)}
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-slate-200 truncate">{user?.name || 'User Name'}</div>
              <div className="text-[11px] text-slate-500 truncate">
                {user?.role === 'Admin' ? 'System Admin' : user?.role === 'HR' ? 'HR Manager' : 'Senior Engineer'}
              </div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0 ml-2" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* ================= MAIN DASHBOARD CONTENT ================= */}
      <main className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden transition-colors duration-200">
        <header className="h-[72px] px-8 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="relative w-96" ref={searchRef}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="w-full bg-[var(--bg-input)] border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-all placeholder:text-[var(--text-muted)]"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" size={16} />

            {showResults && searchQuery.trim() && (
              <div className="absolute top-full mt-2 w-full bg-[var(--bg-input)] border border-slate-700/50 rounded-lg shadow-lg overflow-hidden z-50">
                {filteredResults.length > 0 ? (
                  filteredResults.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleResultClick(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60 transition-colors text-left"
                    >
                      <span className="text-slate-400">{item.icon}</span>
                      {item.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-500">No matches found</div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 bg-[var(--bg-input)] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {theme === 'dark' ? '☼' : '🌙'}
            </button>
            <button
              onClick={() => navigate("/employee/notifications")}
              title="Notifications"
              className="w-9 h-9 bg-[var(--bg-input)] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <Bell size={18} />
            </button>

            <button
              onClick={() => navigate("/employee/profile")}
              title="Profile"
              className="flex items-center gap-3 pl-4 border-l border-slate-700 cursor-pointer"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${user?.role === "Admin"
                    ? "bg-[#f59e0b] text-amber-950"
                    : "bg-[#3b82f6] text-white"
                  }`}
              >
                {getInitials(user?.name)}
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;