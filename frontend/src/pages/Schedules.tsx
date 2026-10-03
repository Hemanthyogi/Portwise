import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Plus, Filter, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { VesselSchedule, ScheduleStatus, Berth, PageResponse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const Schedules: React.FC = () => {
  const [schedules, setSchedules] = useState<VesselSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Review & Approval Modal
  const [selectedSchedule, setSelectedSchedule] = useState<VesselSchedule | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ScheduleStatus>('APPROVED');
  const [availableBerths, setAvailableBerths] = useState<Berth[]>([]);
  const [selectedBerthId, setSelectedBerthId] = useState<number | undefined>(undefined);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const { hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchedules();
  }, [page, statusFilter]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      let url = `/schedules?page=${page}&size=10`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        const p: PageResponse<VesselSchedule> = res.data.data;
        setSchedules(p.content);
        setTotalPages(p.totalPages);
        setTotalElements(p.totalElements);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = async (schedule: VesselSchedule) => {
    setSelectedSchedule(schedule);
    setReviewStatus('APPROVED');
    setSelectedBerthId(schedule.berthId);
    setReviewRemarks(schedule.remarks || '');
    setReviewError(null);
    setReviewModalOpen(true);

    // Fetch berths for this port
    try {
      const res = await api.get(`/berths/port/${schedule.portId}`);
      if (res.data.success) {
        setAvailableBerths(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    setReviewError(null);
    setReviewing(true);

    try {
      const res = await api.patch(`/schedules/${selectedSchedule.id}/status`, {
        status: reviewStatus,
        berthId: selectedBerthId,
        remarks: reviewRemarks,
      });

      if (res.data.success) {
        setReviewModalOpen(false);
        fetchSchedules();
      }
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to update schedule status');
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Vessel Scheduling & Berthing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate vessel arrivals, manage berth allocations, and review pending docking clearances
          </p>
        </div>
        {hasRole(['ADMIN', 'SHIPPING_AGENT']) && (
          <button
            onClick={() => navigate('/schedules/create')}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-portblue-500 hover:bg-portblue-600 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Submit Arrival Request
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs font-medium text-slate-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-portblue-500"
          >
            <option value="">All Schedules</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="RESCHEDULED">RESCHEDULED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
        <span className="text-xs text-slate-400">
          Total Records: <strong>{totalElements}</strong>
        </span>
      </div>

      {/* Schedules Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading schedules..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Vessel</th>
                  <th className="py-3 px-4">Port Destination</th>
                  <th className="py-3 px-4">Assigned Berth</th>
                  <th className="py-3 px-4">Estimated Arrival (ETA)</th>
                  <th className="py-3 px-4">Estimated Departure (ETD)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No vessel schedules found
                    </td>
                  </tr>
                ) : (
                  schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {s.vesselName}
                        <span className="block text-[11px] font-mono text-slate-400 font-normal">
                          {s.vesselImo}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{s.portName}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {s.berthName ? (
                          <span className="text-portblue-600 bg-portblue-50 px-2 py-0.5 rounded border border-portblue-100">
                            {s.berthName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        {new Date(s.eta).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        {new Date(s.etd).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {s.submittedByName || 'Agent'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {hasRole(['ADMIN', 'PORT_AUTHORITY']) && (
                          <button
                            onClick={() => openReviewModal(s)}
                            className="inline-flex items-center px-2 py-1 text-[11px] font-semibold text-portblue-600 hover:text-portblue-700 hover:bg-portblue-50 rounded border border-portblue-200 transition-colors"
                          >
                            Review & Allocate
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

      {/* Review & Berth Allocation Modal */}
      {selectedSchedule && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Review Docking Request: ${selectedSchedule.vesselName}`}
          maxWidth="lg"
        >
          {reviewError && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{reviewError}</span>
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Port</span>
                <span className="font-semibold text-slate-800">{selectedSchedule.portName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Window</span>
                <span className="font-mono text-slate-800">
                  {new Date(selectedSchedule.eta).toLocaleDateString()} —{' '}
                  {new Date(selectedSchedule.etd).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Decision Status
              </label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as ScheduleStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
              >
                <option value="APPROVED">APPROVE REQUEST</option>
                <option value="REJECTED">REJECT REQUEST</option>
                <option value="RESCHEDULED">RESCHEDULE</option>
                <option value="COMPLETED">MARK COMPLETED</option>
                <option value="CANCELLED">CANCEL</option>
              </select>
            </div>

            {reviewStatus === 'APPROVED' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assign Berth (Conflict & Physical Limit Checked) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedBerthId || ''}
                  onChange={(e) => setSelectedBerthId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
                >
                  <option value="">Select compatible berth...</option>
                  {availableBerths.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.berthName} — {b.berthType} (Max Draft: {b.maxDraft}m, Max LOA: {b.maxLOA}m, Status: {b.status})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  The backend strictly enforces Rule 1 (Schedule Overlaps), Rule 2 (Draft), and Rule 3 (LOA limits).
                </span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Authority Operational Remarks
              </label>
              <textarea
                rows={3}
                placeholder="Berthing instructions, tugboat assistance, unloading protocols..."
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewing}
                className="px-4 py-1.5 rounded-lg bg-portblue-500 hover:bg-portblue-600 text-white font-semibold shadow-xs disabled:opacity-50"
              >
                {reviewing ? 'Saving Decision...' : 'Confirm Decision'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
