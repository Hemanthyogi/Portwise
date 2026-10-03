import React, { useEffect, useState } from 'react';
import { Wrench, Plus, Filter, AlertCircle, Save } from 'lucide-react';
import api from '../services/api';
import { Resource, ResourceType, ResourceStatus, Port } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<ResourceType>('CRANE');
  const [formPortId, setFormPortId] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { hasRole } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, pRes] = await Promise.all([
        api.get('/resources?page=0&size=50'),
        api.get('/ports/all'),
      ]);
      if (rRes.data.success) setResources(rRes.data.data.content);
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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    setFormError(null);
    try {
      const res = await api.post('/resources', {
        name: formName,
        resourceType: formType,
        portId: parseInt(formPortId, 10),
        description: formDesc,
      });
      if (res.data.success) {
        setCreateModalOpen(false);
        setFormName('');
        setFormDesc('');
        fetchData();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create resource');
    } finally {
      setFormSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Port Handling Equipment & Resources</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Heavy cranes, forklifts, flatbeds, and storage facilities across active port terminals
          </p>
        </div>
        {hasRole(['ADMIN', 'PORT_AUTHORITY']) && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-portblue-500 hover:bg-portblue-600 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Equipment
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading equipment inventory..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Equipment Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Port Facility</th>
                  <th className="py-3 px-4">Specification & Description</th>
                  <th className="py-3 px-4">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.name}</td>
                    <td className="py-3 px-4 text-slate-700">{r.resourceType.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-slate-700">{r.portName || `Port #${r.portId}`}</td>
                    <td className="py-3 px-4 text-slate-600">{r.description || '—'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Equipment or Resource"
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
              Resource Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Crane-VTZ-2"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Resource Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as ResourceType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
              >
                <option value="CRANE">CRANE</option>
                <option value="FORKLIFT">FORKLIFT</option>
                <option value="TRUCK">TRUCK</option>
                <option value="STORAGE_AREA">STORAGE AREA</option>
                <option value="HANDLING_EQUIPMENT">HANDLING EQUIPMENT</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Port Location</label>
              <select
                value={formPortId}
                onChange={(e) => setFormPortId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
              >
                {ports.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Specifications</label>
            <textarea
              rows={2}
              placeholder="Capacity rating, motor rating, storage square meters..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            />
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
              {formSaving ? 'Creating...' : 'Create Resource'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
