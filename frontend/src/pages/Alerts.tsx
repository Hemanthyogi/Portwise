import React, { useEffect, useState } from 'react';
import { BellRing, Plus, Filter, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { Alert, AlertSeverity, AlertStatus, Port } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<AlertSeverity>('WARNING');
  const [portId, setPortId] = useState('');
  const [saving, setSaving] = useState(false);

  const { hasRole } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aRes, pRes] = await Promise.all([
        api.get('/alerts?page=0&size=50'),
        api.get('/ports/all'),
      ]);
      if (aRes.data.success) setAlerts(aRes.data.data.content);
      if (pRes.data.success) {
        setPorts(pRes.data.data);
        if (pRes.data.data.length > 0) setPortId(String(pRes.data.data[0].id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (alertId: number, newStatus: AlertStatus) => {
    try {
      const res = await api.patch(`/alerts/${alertId}/status?status=${newStatus}`);
      if (res.data.success) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/alerts', {
        title,
        description,
        severity,
        portId: portId ? parseInt(portId, 10) : undefined,
      });
      if (res.data.success) {
        setModalOpen(false);
        setTitle('');
        setDescription('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Port Alerts & Incident Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational anomalies, weather delays, berth occupancy conflicts, and urgent maintenance
          </p>
        </div>
        {hasRole(['ADMIN', 'PORT_AUTHORITY']) && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-portblue-500 hover:bg-portblue-600 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Raise Incident Alert
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Scanning operational alerts..." />
        ) : (
          <div className="divide-y divide-slate-100">
            {alerts.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400">All systems operating normally</p>
            ) : (
              alerts.map((a) => (
                <div key={a.id} className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`p-2.5 rounded-xl border mt-0.5 shrink-0 ${
                        a.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : a.severity === 'WARNING'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-purple-50 text-purple-600 border-purple-100'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-slate-900">{a.title}</h4>
                        <StatusBadge status={a.severity} />
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">{a.description}</p>
                      <div className="flex items-center space-x-4 text-[10px] text-slate-400 mt-2 font-mono">
                        {a.portName && <span>Location: {a.portName}</span>}
                        <span>Logged: {new Date(a.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                    {hasRole(['ADMIN', 'PORT_AUTHORITY']) && (
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a.id, e.target.value as AlertStatus)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="ACKNOWLEDGED">ACKNOWLEDGE</option>
                        <option value="RESOLVED">RESOLVED</option>
                      </select>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Issue Operational Alert"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alert Headline <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Gale Warning — Bay of Bengal Docking Delay"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
              >
                <option value="INFO">INFO</option>
                <option value="WARNING">WARNING</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Affected Port</label>
              <select
                value={portId}
                onChange={(e) => setPortId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
              >
                {ports.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Description <span className="text-rose-500">*</span></label>
            <textarea
              rows={3}
              required
              placeholder="Specify affected vessels, estimated impact, and required safety protocols..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs disabled:opacity-50"
            >
              {saving ? 'Publishing...' : 'Broadcast Alert'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
