import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import HRDashboard from './pages/HRDashboard';
import DashboardLayout from './components/DashboardLayout';
import PlaceholderPage from './pages/PlaceholderPage'; 
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Employee Pages
import DashboardHome from './pages/employee/DashboardHome';
import Profile from './pages/employee/Profile';
import Attendance from './pages/employee/Attendance';
import Leave from './pages/employee/Leave';
import Payroll from './pages/employee/Payroll';
import Tasks from './pages/employee/Tasks';
import Performance from './pages/employee/Performance';
import Chat from './pages/employee/Chat';
import Notifications from './pages/employee/Notifications';
import Training from './pages/employee/Training';
import Documents from './pages/employee/Documents';
import Settings from './pages/employee/Settings';

// Import HR Pages
import Overview from './pages/HR/Overview';
import Employees from './pages/HR/Employees';
import LeaveApproval from './pages/HR/LeaveApproval';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return <DashboardLayout>{children}</DashboardLayout>; 
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          {/* ================= ADMIN ROUTES ================= */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['Admin']}><PlaceholderPage title="User Management" /></ProtectedRoute>} />
          <Route path="/admin/payroll" element={<ProtectedRoute allowedRoles={['Admin']}><PlaceholderPage title="Admin Payroll" /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['Admin']}><PlaceholderPage title="System Reports" /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['Admin']}><PlaceholderPage title="System Settings" /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['Admin']}><PlaceholderPage title="Audit Logs" /></ProtectedRoute>} />

          {/* ================= HR ROUTES ================= */}
          <Route path="/hr" element={<ProtectedRoute allowedRoles={['HR']}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/overview" element={<ProtectedRoute allowedRoles={['HR']}><Overview /></ProtectedRoute>} />
          <Route path="/hr/employees" element={<ProtectedRoute allowedRoles={['HR']}><Employees /></ProtectedRoute>} />
          <Route path="/hr/leaves" element={<ProtectedRoute allowedRoles={['HR']}><LeaveApproval /></ProtectedRoute>} />
          <Route path="/hr/recruitment" element={<ProtectedRoute allowedRoles={['HR']}><PlaceholderPage title="Recruitment" /></ProtectedRoute>} />
          {/* ================= EMPLOYEE ROUTES ================= */}
          <Route path="/employee" element={<ProtectedRoute allowedRoles={['Employee']}><DashboardHome /></ProtectedRoute>} />
          <Route path="/employee/profile" element={<ProtectedRoute allowedRoles={['Employee']}><Profile /></ProtectedRoute>} />
          <Route path="/employee/attendance" element={<ProtectedRoute allowedRoles={['Employee']}><Attendance /></ProtectedRoute>} />
          <Route path="/employee/leave" element={<ProtectedRoute allowedRoles={['Employee']}><Leave /></ProtectedRoute>} />
          <Route path="/employee/payroll" element={<ProtectedRoute allowedRoles={['Employee']}><Payroll /></ProtectedRoute>} />
          <Route path="/employee/tasks" element={<ProtectedRoute allowedRoles={['Employee']}><Tasks /></ProtectedRoute>} />
          <Route path="/employee/performance" element={<ProtectedRoute allowedRoles={['Employee']}><Performance /></ProtectedRoute>} />
          <Route path="/employee/chat" element={<ProtectedRoute allowedRoles={['Employee']}><Chat /></ProtectedRoute>} />
          <Route path="/employee/notifications" element={<ProtectedRoute allowedRoles={['Employee']}><Notifications /></ProtectedRoute>} />
          <Route path="/employee/training" element={<ProtectedRoute allowedRoles={['Employee']}><Training /></ProtectedRoute>} />
          <Route path="/employee/documents" element={<ProtectedRoute allowedRoles={['Employee']}><Documents /></ProtectedRoute>} />
          <Route path="/employee/settings" element={<ProtectedRoute allowedRoles={['Employee']}><Settings /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;