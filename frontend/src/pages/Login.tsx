import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, ...userData } = res.data.data;
        login(token, userData);
        navigate('/dashboard');
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@12345');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-radial from-slate-800 to-slate-950 opacity-90 -z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-portblue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-tealbrand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-portblue-500/20 border border-portblue-500/40 text-portblue-400 mb-4 shadow-lg shadow-portblue-500/10">
          <Anchor className="w-8 h-8 text-portblue-400" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-mono">PORTWISE</h2>
        <p className="mt-2 text-xs uppercase tracking-widest text-portblue-400 font-semibold">
          Integrated Port Logistics Management System
        </p>
        <p className="mt-1 text-xs text-slate-400">Connecting Ports. Powering Progress.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@portwise.demo"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-portblue-400 focus:border-portblue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-portblue-400 focus:border-portblue-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-portblue-500 hover:bg-portblue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-portblue-500 shadow-lg shadow-portblue-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  Sign in to Terminal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Demo account quick buttons */}
          <div className="mt-6 pt-5 border-t border-slate-700/80">
            <div className="flex items-center space-x-1.5 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-tealbrand-400" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Demo Role Account (Password: Demo@12345)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount('admin@portwise.demo')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-600/50 text-left transition-colors"
              >
                <div className="font-semibold text-portblue-400">ADMIN</div>
                <div className="text-[10px] text-slate-400 truncate">admin@portwise.demo</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('portauthority@portwise.demo')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-600/50 text-left transition-colors"
              >
                <div className="font-semibold text-tealbrand-400">PORT AUTHORITY</div>
                <div className="text-[10px] text-slate-400 truncate">portauthority@...</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('agent@portwise.demo')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-600/50 text-left transition-colors"
              >
                <div className="font-semibold text-sky-400">SHIPPING AGENT</div>
                <div className="text-[10px] text-slate-400 truncate">agent@portwise.demo</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('cargo@portwise.demo')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-600/50 text-left transition-colors"
              >
                <div className="font-semibold text-emerald-400">CARGO OWNER</div>
                <div className="text-[10px] text-slate-400 truncate">cargo@portwise.demo</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('operator@portwise.demo')}
                className="col-span-2 px-2.5 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-600/50 text-left transition-colors"
              >
                <div className="font-semibold text-amber-400">LOGISTICS OPERATOR</div>
                <div className="text-[10px] text-slate-400">operator@portwise.demo</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
