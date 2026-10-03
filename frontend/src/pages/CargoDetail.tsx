import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Clock,
  MapPin,
  User,
  Plus,
  AlertCircle,
  CheckCircle2,
  Ship,
  Building,
} from 'lucide-react';
import api from '../services/api';
import { Cargo, CargoMovement, CargoStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const CargoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cargo, setCargo] = useState<Cargo | null>(null);
  const [movements, setMovements] = useState<CargoMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<CargoStatus>('REGISTERED');
  const [statusError, setStatusError] = useState<string | null>(null);

  // New Movement Modal
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [movementStatus, setMovementStatus] = useState('INSPECTION');
  const [movementLocation, setMovementLocation] = useState('');
  const [movementRemarks, setMovementRemarks] = useState('');
  const [movementSaving, setMovementSaving] = useState(false);

  const { hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCargoDetails();
  }, [id]);

  const fetchCargoDetails = async () => {
    try {
      setLoading(true);
      const [cargoRes, movRes] = await Promise.all([
        api.get(`/cargo/${id}`),
        api.get(`/cargo/${id}/movements`),
      ]);
      if (cargoRes.data.success) {
        setCargo(cargoRes.data.data);
        setNewStatus(cargoRes.data.data.status);
      }
      if (movRes.data.success) {
        setMovements(movRes.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!cargo || newStatus === cargo.status) return;
    setStatusError(null);
    setStatusUpdating(true);
    try {
      const res = await api.patch(`/cargo/${cargo.id}/status?status=${newStatus}`);
      if (res.data.success) {
        setCargo(res.data.data);
        // Refresh timeline
        const movRes = await api.get(`/cargo/${id}/movements`);
        if (movRes.data.success) setMovements(movRes.data.data);
      }
    } catch (err: any) {
      setStatusError(err.response?.data?.message || 'Failed to update cargo status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargo) return;
    setMovementSaving(true);
    try {
      const res = await api.post('/cargo/movements', {
        cargoId: cargo.id,
        status: movementStatus,
        location: movementLocation,
        remarks: movementRemarks,
        timestamp: new Date().toISOString(),
      });
      if (res.data.success) {
        setMovementModalOpen(false);
        setMovementLocation('');
        setMovementRemarks('');
        // Refresh timeline
        const movRes = await api.get(`/cargo/${id}/movements`);
        if (movRes.data.success) setMovements(movRes.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMovementSaving(false);
    }
  };

  if (loading || !cargo) {
    return <LoadingSpinner message="Retrieving consignment tracking telemetry..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/cargo')}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>{cargo.description || 'Cargo Consignment'}</span>
              <StatusBadge status={cargo.status} />
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Consignee: {cargo.consignee || '—'} | Shipment: {cargo.shipmentNumber || 'Direct'}
            </p>
          </div>
        </div>

        {hasRole(['ADMIN', 'PORT_AUTHORITY', 'LOGISTICS_OPERATOR']) && (
          <button
            onClick={() => setMovementModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-portblue-500 hover:bg-portblue-600 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Tracking Event
          </button>
        )}
      </div>

      {statusError && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{statusError}</span>
        </div>
      )}

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Consignment Specs (2 cols) */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Consignment Specification
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Commodity Type
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {cargo.cargoType.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Quantity & Unit
              </span>
              <span className="font-mono font-semibold text-slate-800 text-sm mt-0.5 block text-portblue-600">
                {cargo.quantity.toLocaleString()} {cargo.unit}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Origin
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {cargo.origin || '—'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Destination Port
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {cargo.destination || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Transition Control (1 col) */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Pipeline Transition
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Update Cargo Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as CargoStatus)}
                disabled={!hasRole(['ADMIN', 'PORT_AUTHORITY', 'LOGISTICS_OPERATOR'])}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
              >
                <option value="REGISTERED">REGISTERED</option>
                <option value="IN_TRANSIT">IN TRANSIT</option>
                <option value="AT_PORT">AT PORT</option>
                <option value="LOADING">LOADING</option>
                <option value="UNLOADING">UNLOADING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="DELAYED">DELAYED</option>
              </select>
            </div>

            {hasRole(['ADMIN', 'PORT_AUTHORITY', 'LOGISTICS_OPERATOR']) && (
              <button
                onClick={handleStatusChange}
                disabled={statusUpdating || newStatus === cargo.status}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-portblue-500 hover:bg-portblue-600 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                {statusUpdating ? 'Processing...' : 'Apply Transition'}
              </button>
            )}

            <p className="text-[11px] text-slate-400 italic leading-relaxed pt-2 border-t border-slate-100">
              *Rule 7: Completed cargo cannot be reverted back to REGISTERED without administrative correction.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Cargo Movement Timeline */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 pb-4 border-b border-slate-100 mb-6 flex items-center">
          <Clock className="w-4 h-4 mr-2 text-portblue-500" />
          Cargo Movement & Chain of Custody Timeline
        </h3>

        {movements.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No movement events logged yet.</p>
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {movements.map((m, idx) => (
              <div key={m.id || idx} className="relative group">
                {/* Dot */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-portblue-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-portblue-500" />
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 transition-all hover:bg-white hover:shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                        {m.status.replace(/_/g, ' ')}
                      </span>
                      {m.location && (
                        <span className="inline-flex items-center text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                          {m.location}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(m.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {m.remarks && (
                    <p className="text-xs text-slate-600 leading-relaxed">{m.remarks}</p>
                  )}

                  {m.operatorName && (
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      Handled by: <span className="font-semibold text-slate-600 ml-1">{m.operatorName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Movement Modal */}
      <Modal
        isOpen={movementModalOpen}
        onClose={() => setMovementModalOpen(false)}
        title="Record Cargo Movement Event"
        maxWidth="md"
      >
        <form onSubmit={handleAddMovement} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Event Status / Stage <span className="text-rose-500">*</span>
            </label>
            <select
              value={movementStatus}
              onChange={(e) => setMovementStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            >
              <option value="REGISTERED">Registered</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="ARRIVED_AT_PORT">Arrived at Port</option>
              <option value="INSPECTION">Inspection / Customs</option>
              <option value="LOADING">Loading on Vessel</option>
              <option value="UNLOADING">Unloading from Vessel</option>
              <option value="PROCESSED">Processed / Stored</option>
              <option value="DEPARTED">Departed Terminal</option>
              <option value="DELIVERED">Delivered to Consignee</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Location / Terminal <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Paradip Berth-1, Yard 4B, Bay of Bengal"
              value={movementLocation}
              onChange={(e) => setMovementLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Remarks & Details</label>
            <textarea
              rows={3}
              placeholder="Customs seal intact, crane handling details..."
              value={movementRemarks}
              onChange={(e) => setMovementRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setMovementModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={movementSaving}
              className="px-4 py-1.5 rounded-lg bg-portblue-500 hover:bg-portblue-600 text-white font-semibold shadow-xs disabled:opacity-50"
            >
              {movementSaving ? 'Saving...' : 'Add Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
