import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, User, Phone, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState('SHIPPING_AGENT');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      // 1. Register new user directly into the database
      const regRes = await api.post('/auth/register', {
        fullName,
        email,
        password,
        phone,
        roles: [selectedRole]
      });

      if (regRes.data.success) {
        setSuccessMsg('Account registered and saved to database! Logging you in...');
        
        // 2. Automatically log in with the new credentials
        const loginRes = await api.post('/auth/login', { email, password });
        if (loginRes.data.success) {
          const { token, ...userData } = loginRes.data.data;
          login(token, userData);
          setTimeout(() => navigate('/dashboard'), 800);
        } else {
          setIsRegister(false);
        }
      } else {
        setError(regRes.data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Registration failed. Email might already exist in database.'
      );
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string) => {
    setIsRegister(false);
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
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-700 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                !isRegister
                  ? 'border-portblue-400 text-portblue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                isRegister
                  ? 'border-portblue-400 text-portblue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Register New User (Store in DB)
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isRegister ? (
            /* --- SIGN IN FORM --- */
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
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
                    placeholder="user@portwise.demo or your email"
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
                    Sign In to Terminal
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* --- REGISTER NEW USER FORM (Saves to DB) --- */
            <form className="space-y-3.5" onSubmit={handleRegisterSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Captain John Doe"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-portblue-400 focus:border-portblue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email ID (Stored in DB)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="myname@company.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-portblue-400 focus:border-portblue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Password (Encrypted in DB)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-portblue-400 focus:border-portblue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-portblue-400 focus:border-portblue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Assigned Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-portblue-400 focus:border-portblue-400"
                >
                  <option value="ADMIN">ADMIN (Full System Access)</option>
                  <option value="PORT_AUTHORITY">PORT_AUTHORITY (Berth & Approvals)</option>
                  <option value="SHIPPING_AGENT">SHIPPING_AGENT (Vessel Schedules)</option>
                  <option value="CARGO_OWNER">CARGO_OWNER (Cargo Declarations)</option>
                  <option value="LOGISTICS_OPERATOR">LOGISTICS_OPERATOR (Equipment & Cranes)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 flex items-center justify-center py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-tealbrand-500 hover:bg-tealbrand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tealbrand-500 shadow-lg shadow-tealbrand-500/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  'Saving to Database...'
                ) : (
                  <>
                    Save to Database & Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Demo account quick buttons (Always preserved for convenience) */}
          <div className="mt-6 pt-5 border-t border-slate-700/80">
            <div className="flex items-center space-x-1.5 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-tealbrand-400" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or Quick-Fill Pre-Seeded Demo Role:
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
