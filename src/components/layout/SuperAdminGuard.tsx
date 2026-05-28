import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSuperAdminStore } from '../../store/superAdminStore';

export const SuperAdminGuard = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: ('super_admin' | 'support' | 'finance_viewer')[] }) => {
  const { superAdmin, loadProfile } = useSuperAdminStore();

  useEffect(() => {
    if (!superAdmin) {
      loadProfile();
    }
  }, [superAdmin, loadProfile]);

  // Cek session: sessionStorage (persistent login SA) atau state
  const session = sessionStorage.getItem('super_admin_session');
  
  // Jika tidak ada session SA, tolak
  if (!session && !superAdmin) {
    return <Navigate to="/superadmin/login" replace />;
  }

  // Cek role jika ada pembatasan
  if (allowedRoles && superAdmin && !allowedRoles.includes(superAdmin.role)) {
    return <Navigate to="/superadmin" replace />;
  }

  // Render children (berisi SuperAdminLayout + Outlet)
  return <>{children}</>;
};

