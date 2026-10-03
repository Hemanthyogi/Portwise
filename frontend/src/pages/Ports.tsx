import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Search, Navigation, Columns, AlertCircle, Save } from 'lucide-react';
import api from '../services/api';
import { Port, PortStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const Ports: React.FC = () => {
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Port Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formState, setFormState] = useState('');
  const [formCountry, setFormCountry] = useState('India');
  const [formBerths, setFormBerths] = useState('10');
  const [formStatus, setFormStatus] = useState<PortStatus>('OPERATIONAL');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { hasRole } = useAuth();

  useEffect(() => {
    fetchPorts();
  }, []);

  const fetchPorts = async () => {
    try {
      setLoading(true);
      let url = '/ports?page=0&size=50';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setPorts(res.data.data.content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    setFormError(null);
    try {
      const res = await api.post('/ports', {
        name: formName,
        code: formCode.toUpperCase(),
        location: formLocation,
        state: formState,
        country: formCountry,
        numberOfBerths: parseInt(formBerths, 10),
        operationalStatus: formStatus,
      });
      if (res.data.success) {
        setCreateModalOpen(false);
        setFormName('');
        setFormCode('');
        setFormLocation('');
        setFormState('');
        fetchPorts();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create port');
    } finally {
      setFormSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Major Port Facilities</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographical hubs, operational readiness, berth quotas, and vessel clearance nodes
          </p>
        </div>
        {hasRole(['ADMIN']) && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-portblue-500 hover:bg-portblue-600 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Port Terminal
          </button>
        )}
      </div>

      {/* Grid of Port Cards */}
      {loading ? (
        <LoadingSpinner message="Loading port facilities..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ports.map((port) => (
            <div
              key={port.id}
              className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{port.name}</h3>
                  <span className="text-xs font-mono font-semibold text-portblue-600 bg-portblue-50 px-2 py-0.5 rounded border border-portblue-100 inline-block mt-1">
                    {port.code}
                  </span>
                </div>
                <StatusBadge status={port.operationalStatus} />
              </div>

              <div className="space-y-2 text-xs text-slate-600 my-4 border-y border-slate-100 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-medium text-slate-800 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {port.location || `${port.state}, ${port.country}`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Berths:</span>
                  <span className="font-semibold text-slate-800 flex items-center">
                    <Columns className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {port.numberOfBerths || 'N/A'} Berths
                  </span>
                </div>

                {port.latitude && port.longitude && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Coordinates:</span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {port.latitude.toFixed(2)}° N, {port.longitude.toFixed(2)}° E
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Status: {port.operationalStatus}</span>
                <span className="text-[11px] font-mono">ID #{port.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Port Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Port Facility"
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
              Port Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tuticorin Port"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Port Code (UN/LOCODE) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="INTUT"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Berths Count</label>
              <input
                type="number"
                min="1"
                value={formBerths}
                onChange={(e) => setFormBerths(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Location Details</label>
            <input
              type="text"
              placeholder="Tuticorin, Tamil Nadu"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
              <input
                type="text"
                placeholder="Tamil Nadu"
                value={formState}
                onChange={(e) => setFormState(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operational State</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as PortStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
              >
                <option value="OPERATIONAL">OPERATIONAL</option>
                <option value="PARTIAL">PARTIAL</option>
                <option value="CLOSED">CLOSED</option>
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
              {formSaving ? 'Creating...' : 'Create Port'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
