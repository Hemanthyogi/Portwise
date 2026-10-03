import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Anchor,
  LayoutDashboard,
  Ship,
  CalendarDays,
  Package,
  MapPin,
  Columns,
  Wrench,
  Clock,
  BellRing,
  BarChart3,
  Users,
  ShieldAlert,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  roles?: Role[];
}

export const Sidebar: React.FC = () => {
  const { hasRole, user } = useAuth();

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vessels', path: '/vessels', icon: Ship },
    { name: 'Schedules', path: '/schedules', icon: CalendarDays },
    { name: 'Cargo Movements', path: '/cargo', icon: Package },
    { name: 'Ports', path: '/ports', icon: MapPin },
    { name: 'Berths', path: '/berths', icon: Columns },
    { name: 'Equipment & Resources', path: '/resources', icon: Wrench },
    { name: 'Resource Allocations', path: '/resource-allocations', icon: Clock },
    { name: 'Alerts & Incidents', path: '/alerts', icon: BellRing },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3, roles: ['ADMIN', 'PORT_AUTHORITY'] },
    { name: 'User Management', path: '/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert, roles: ['ADMIN'] },
    { name: 'My Profile', path: '/profile', icon: UserCircle },
  ];

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return hasRole(item.roles);
  });

  return (
    <aside className="w-64 bg-navy-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-screen">
      {/* Brand header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 bg-navy-900/50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-portblue-500/20 border border-portblue-500/40 flex items-center justify-center text-portblue-400">
            <Anchor className="w-5 h-5 text-portblue-400" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wider text-base font-mono">PORTWISE</h1>
            <p className="text-[10px] text-portblue-400/80 uppercase tracking-widest font-semibold">Port Logistics OS</p>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Operational Core
        </div>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-portblue-500/20 text-portblue-400 border border-portblue-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 mr-3 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User summary at bottom */}
      <div className="p-4 border-t border-slate-800 bg-navy-900/80">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-portblue-500/20 border border-portblue-500/40 text-portblue-300 flex items-center justify-center text-xs font-bold uppercase">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'Active User'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.roles?.[0] || 'GUEST'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
