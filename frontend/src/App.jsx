import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import HRDashboard from './pages/HRDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import DashboardLayout from './components/DashboardLayout';
import PlaceholderPage from './pages/PlaceholderPage'; 
import { AuthProvider, useAuth } from './context/AuthContext';

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
          <Route path="/hr/employees" element={<ProtectedRoute allowedRoles={['HR']}><PlaceholderPage title="Employee Directory" /></ProtectedRoute>} />
          <Route path="/hr/leaves" element={<ProtectedRoute allowedRoles={['HR']}><PlaceholderPage title="Leave Approval" /></ProtectedRoute>} />
          <Route path="/hr/recruitment" element={<ProtectedRoute allowedRoles={['HR']}><PlaceholderPage title="Recruitment" /></ProtectedRoute>} />

          {/* ================= EMPLOYEE ROUTES ================= */}
          <Route path="/employee" element={<ProtectedRoute allowedRoles={['Employee']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/employee/profile" element={<ProtectedRoute allowedRoles={['Employee']}><PlaceholderPage title="My Profile" /></ProtectedRoute>} />
          <Route path="/employee/attendance" element={<ProtectedRoute allowedRoles={['Employee']}><PlaceholderPage title="Attendance Tracker" /></ProtectedRoute>} />
          <Route path="/employee/leave" element={<ProtectedRoute allowedRoles={['Employee']}><PlaceholderPage title="Leave Application" /></ProtectedRoute>} />
          <Route path="/employee/payroll" element={<ProtectedRoute allowedRoles={['Employee']}><PlaceholderPage title="My Payroll & Slips" /></ProtectedRoute>} />
          <Route path="/employee/tasks" element={<ProtectedRoute allowedRoles={['Employee']}><PlaceholderPage title="My Tasks" /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;