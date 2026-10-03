import React, { useEffect, useState } from 'react';
import { Clock, Plus, CheckCircle, AlertCircle, Save } from 'lucide-react';
import api from '../services/api';
import { ResourceAllocation, Resource, PageResponse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const ResourceAllocations: React.FC = () => {
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // New Allocation Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [operationDesc, setOperationDesc] = useState('');
  const [startTime, setStartTime] = useState('');
  const [expectedCompletion, setExpectedCompletion] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { hasRole } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aRes, rRes] = await Promise.all([
        api.get('/resource-allocations?page=0&size=50'),
        api.get('/resources?page=0&size=50'),
      ]);
      if (aRes.data.success) setAllocations(aRes.data.data.content);
      if (rRes.data.success) {
        setResources(rRes.data.data.content);
        if (rRes.data.data.content.length > 0) {
          setSelectedResourceId(String(rRes.data.data.content[0].id));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      const res = await api.patch(`/resource-allocations/${id}/complete`);
      if (res.data.success) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await api.post('/resource-allocations', {
        resourceId: parseInt(selectedResourceId, 10),
        operationDescription: operationDesc,
        startTime,
        expectedCompletion: expectedCompletion || undefined,
      });
      if (res.data.success) {
        setModalOpen(false);
        setOperationDesc('');
        fetchData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to allocate resource');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Resource Allocations & Assignments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational deployment of cranes, forklifts, and staging areas with conflict prevention
          </p>
        </div>
        {hasRole(['ADMIN', 'PORT_AUTHORITY']) && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-portblue-500 hover:bg-portblue-600 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Allocation
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Retrieving resource allocations..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Operation Description</th>
                  <th className="py-3 px-4">Start Time</th>
                  <th className="py-3 px-4">Expected Completion</th>
                  <th className="py-3 px-4">Assigned Operator</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No active resource allocations
                    </td>
                  </tr>
                ) : (
                  allocations.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{a.resourceName}</td>
                      <td className="py-3 px-4 text-slate-700">{a.operationDescription || 'Cargo Handling'}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {new Date(a.startTime).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {a.expectedCompletion
                          ? new Date(a.expectedCompletion).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{a.operatorName || 'Duty Operator'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {a.status !== 'COMPLETED' &&
                          hasRole(['ADMIN', 'PORT_AUTHORITY', 'LOGISTICS_OPERATOR']) && (
                            <button
                              onClick={() => handleComplete(a.id)}
                              className="inline-flex items-center px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Complete
                            </button>
                          )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Deploy Resource to Operation"
        maxWidth="md"
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAllocateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Available Equipment <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            >
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.resourceType}) — Status: {r.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Operation Task Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unloading MV Eastern Glory - Coal Hold 2"
              value={operationDesc}
              onChange={(e) => setOperationDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Expected Completion
              </label>
              <input
                type="datetime-local"
                value={expectedCompletion}
                onChange={(e) => setExpectedCompletion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500 font-mono"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            *Rule 4: The system will automatically reject allocations that conflict with an existing active assignment for this equipment.
          </p>

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
              className="px-4 py-1.5 rounded-lg bg-portblue-500 hover:bg-portblue-600 text-white font-semibold shadow-xs disabled:opacity-50"
            >
              {saving ? 'Validating...' : 'Allocate Equipment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
