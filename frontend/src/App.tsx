import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Vessels } from './pages/Vessels';
import { VesselDetail } from './pages/VesselDetail';
import { VesselCreate } from './pages/VesselCreate';
import { Schedules } from './pages/Schedules';
import { ScheduleCreate } from './pages/ScheduleCreate';
import { CargoPage } from './pages/Cargo';
import { CargoDetail } from './pages/CargoDetail';
import { CargoCreate } from './pages/CargoCreate';
import { Ports } from './pages/Ports';
import { Berths } from './pages/Berths';
import { Resources } from './pages/Resources';
import { ResourceAllocations } from './pages/ResourceAllocations';
import { Alerts } from './pages/Alerts';
import { NotificationsPage } from './pages/Notifications';
import { Reports } from './pages/Reports';
import { UsersPage } from './pages/Users';
import { AuditLogs } from './pages/AuditLogs';
import { Profile } from './pages/Profile';
import { Role } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: Role[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner message="Verifying session clearance..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/vessels" element={<Vessels />} />
            <Route path="/vessels/:id" element={<VesselDetail />} />
            <Route path="/vessels/create" element={<VesselCreate />} />

            <Route path="/schedules" element={<Schedules />} />
            <Route path="/schedules/create" element={<ScheduleCreate />} />

            <Route path="/cargo" element={<CargoPage />} />
            <Route path="/cargo/:id" element={<CargoDetail />} />
            <Route path="/cargo/create" element={<CargoCreate />} />

            <Route path="/ports" element={<Ports />} />
            <Route path="/berths" element={<Berths />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resource-allocations" element={<ResourceAllocations />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PORT_AUTHORITY']}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />

            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
