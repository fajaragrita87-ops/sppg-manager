import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, CreditCard, BarChart3,
  Bell, Settings, Shield, LogOut, ChevronRight, Activity, Zap,
  Globe, MessageSquare
} from 'lucide-react';
import { useSuperAdminStore } from '../../store/superAdminStore';

export const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const { superAdmin, signOut } = useSuperAdminStore();
  const [now, setNow] = useState(new Date());
  const [notifCount] = useState(3); // TODO: connect to real data

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    signOut();
    navigate('/superadmin/login');
  };

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Overview', path: '/superadmin', end: true, roles: ['super_admin','support','finance_viewer'], badge: null },
    { icon: <Globe size={18} />, label: 'CMS Website', path: '/superadmin/cms', end: false, roles: ['super_admin'], badge: null },
    { icon: <Building2 size={18} />, label: 'Kelola SPPG', path: '/superadmin/sppg', end: false, roles: ['super_admin','support','finance_viewer'], badge: '198' },
    { icon: <CreditCard size={18} />, label: 'Paket & Billing', path: '/superadmin/paket', end: false, roles: ['super_admin','finance_viewer'], badge: null },
    { icon: <MessageSquare size={18} />, label: 'Helpdesk & Tiket', path: '/superadmin/helpdesk', end: false, roles: ['super_admin','support'], badge: '2' },
    { icon: <BarChart3 size={18} />, label: 'Analytics', path: '/superadmin/analytics', end: false, roles: ['super_admin','support','finance_viewer'], badge: null },
    { icon: <Bell size={18} />, label: 'Broadcast', path: '/superadmin/broadcast', end: false, roles: ['super_admin','support'], badge: notifCount > 0 ? String(notifCount) : null },
    { icon: <Settings size={18} />, label: 'Pengaturan Sistem', path: '/superadmin/pengaturan', end: false, roles: ['super_admin'], badge: null },
    { icon: <Shield size={18} />, label: 'Keamanan', path: '/superadmin/keamanan', end: false, roles: ['super_admin'], badge: null },
  ];

  const visibleItems = navItems.filter(item => superAdmin && item.roles.includes(superAdmin.role));

  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* ─── SIDEBAR ─── */}
      <aside className="w-[240px] flex flex-col shrink-0 z-20 transition-all"
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Zap size={16} className="text-white"/>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none tracking-wide">SPPG MANAGER</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.2em] font-semibold">Super Admin</p>
          </div>
        </div>

        {/* System Status Indicator */}
        <div className="mx-4 mt-4 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
            <span className="text-xs font-semibold text-emerald-400">Semua Sistem Normal</span>
          </div>
          <p className="text-[10px] text-emerald-400/60 mt-0.5">Uptime 99.98% — 30 hari terakhir</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-3">Menu Utama</p>
          {visibleItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group relative ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              <span className={`transition-colors ${window.location.pathname === item.path || (item.path !== '/superadmin' && window.location.pathname.startsWith(item.path)) ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/5">
          <div className="rounded-xl p-3 flex items-center gap-3 bg-white/5 border border-white/10">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-inner">
              {superAdmin?.nama?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{superAdmin?.nama || 'Super Admin'}</p>
              <p className="text-[10px] text-slate-400 capitalize truncate mt-0.5">{superAdmin?.role?.replace('_',' ') || 'super_admin'}</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 hover:bg-white/5 rounded-lg">
              <LogOut size={16}/>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN AREA ─── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2 text-slate-400">
            <LayoutDashboard size={18} className="text-blue-600"/>
            <ChevronRight size={14}/>
            <span className="text-sm font-medium text-slate-600">SaaS Command Center</span>
          </div>
          <div className="flex items-center gap-5">
            {/* Live time */}
            <div className="text-right hidden sm:block border-r border-slate-200 pr-5">
              <p className="text-sm font-bold text-slate-700 leading-none">{timeStr}</p>
              <p className="text-[11px] font-medium text-slate-400 mt-1">{dateStr}</p>
            </div>
            {/* System health */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm">
              <Activity size={14} className="text-emerald-600"/>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">System OK</span>
            </div>
            {/* Notif */}
            <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
              <Bell size={20}/>
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {notifCount}
                </span>
              )}
            </button>
            {/* Role badge */}
            <span className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-bold border border-violet-100 uppercase tracking-wider shadow-sm">
              {superAdmin?.role?.replace('_',' ') || 'Super Admin'}
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
