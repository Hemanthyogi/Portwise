import React from 'react';
import { UserCircle, Shield, Mail, Phone, Calendar, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Operator Profile & Credentials</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Authenticated identity, role authorizations, and terminal clearance tokens
        </p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-portblue-500/10 border-2 border-portblue-500/30 text-portblue-600 flex items-center justify-center text-xl font-bold uppercase">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.fullName || 'Active Operator'}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {user?.roles?.map((r) => (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-portblue-50 border border-portblue-200 text-portblue-700 font-mono"
                >
                  ROLE: {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start space-x-3">
            <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Email Identity</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{user?.email}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start space-x-3">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact Phone</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{user?.phone || 'Not registered'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start space-x-3">
            <Shield className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Access Permissions</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {user?.roles?.includes('ADMIN') ? 'Full System Master Privileges' : 'Role Scoped Access'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start space-x-3">
            <Key className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Security Token</span>
              <span className="font-mono text-slate-800 text-xs mt-0.5 block">
                Stateless Bearer JWT (HMAC-SHA256)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
