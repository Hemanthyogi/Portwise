import React, { useEffect, useState } from 'react';
import { Columns, Plus, Filter, AlertCircle, Save } from 'lucide-react';
import api from '../services/api';
import { Berth, BerthStatus, CargoType, Port, PageResponse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const Berths: React.FC = () => {
  const [berths, setBerths] = useState<Berth[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Berth Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formPortId, setFormPortId] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Bulk');
  const [formDraft, setFormDraft] = useState('14.0');
  const [formLOA, setFormLOA] = useState('220.0');
  const [formCargo, setFormCargo] = useState<CargoType>('COAL');
  const [formStatus, setFormStatus] = useState<BerthStatus>('AVAILABLE');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { hasRole } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, pRes] = await Promise.all([
        api.get('/berths?page=0&size=50'),
        api.get('/ports/all'),
      ]);
      if (bRes.data.success) setBerths(bRes.data.data.content);
      if (pRes.data.success) {
        setPorts(pRes.data.data);
        if (pRes.data.data.length > 0) setFormPortId(String(pRes.data.data[0].id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (berth: Berth, newStatus: BerthStatus) => {
    try {
      const res = await api.patch(`/berths/${berth.id}/status?status=${newStatus}`);
      if (res.data.success) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    setFormError(null);
    try {
      const res = await api.post('/berths', {
        portId: parseInt(formPortId, 10),
        berthName: formName,
        berthType: formType,
        maxDraft: parseFloat(formDraft),
        maxLOA: parseFloat(formLOA),
        cargoType: formCargo,
        status: formStatus,
      });
      if (res.data.success) {
        setCreateModalOpen(false);
        setFormName('');
        fetchData();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create berth');
    } finally {
      setFormSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Berth Occupancy & Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical limits (Max Draft, Max LOA), cargo docking slots, and real-time berth allocation
          </p>
        </div>
        {hasRole(['ADMIN', 'PORT_AUTHORITY']) && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-portblue-500 hover:bg-portblue-600 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Berth
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading berths..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Berth Name</th>
                  <th className="py-3 px-4">Port</th>
                  <th className="py-3 px-4">Berth Type</th>
                  <th className="py-3 px-4">Max Draft</th>
                  <th className="py-3 px-4">Max LOA</th>
                  <th className="py-3 px-4">Cargo Compatibility</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {berths.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{b.berthName}</td>
                    <td className="py-3 px-4 text-slate-700">{b.portName || `Port #${b.portId}`}</td>
                    <td className="py-3 px-4 text-slate-600">{b.berthType || 'General'}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-portblue-600">
                      {b.maxDraft ? `${b.maxDraft} m` : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {b.maxLOA ? `${b.maxLOA} m` : '—'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {b.cargoType ? b.cargoType.replace(/_/g, ' ') : 'ALL'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {hasRole(['ADMIN', 'PORT_AUTHORITY']) && (
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusToggle(b, e.target.value as BerthStatus)}
                          className="text-[11px] bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none"
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="OCCUPIED">OCCUPIED</option>
                          <option value="RESERVED">RESERVED</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Berth Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Berth Entry"
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Port <span className="text-rose-500">*</span>
            </label>
            <select
              value={formPortId}
              onChange={(e) => setFormPortId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            >
              {ports.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Berth Name / Identifier <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. INPRD-B4"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Max Allowed Draft (m) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formDraft}
                onChange={(e) => setFormDraft(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Max Allowed LOA (m) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formLOA}
                onChange={(e) => setFormLOA(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Berth Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
              >
                <option value="Bulk">Bulk Cargo</option>
                <option value="Container">Container Terminal</option>
                <option value="Tanker">Liquid Tanker</option>
                <option value="General">General Multi-purpose</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cargo Type</label>
              <select
                value={formCargo}
                onChange={(e) => setFormCargo(e.target.value as CargoType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
              >
                <option value="COAL">COAL</option>
                <option value="IRON_ORE">IRON ORE</option>
                <option value="CONTAINERIZED">CONTAINERIZED</option>
                <option value="FERTILIZER">FERTILIZER</option>
                <option value="GRAIN">GRAIN</option>
                <option value="GENERAL_CARGO">GENERAL CARGO</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSaving}
              className="px-4 py-1.5 rounded-lg bg-portblue-500 hover:bg-portblue-600 text-white font-semibold shadow-xs disabled:opacity-50"
            >
              {formSaving ? 'Creating...' : 'Create Berth'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
