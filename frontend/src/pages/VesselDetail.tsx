import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ship, ArrowLeft, Anchor, Compass, Scale, Ruler, MapPin, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Vessel, VesselStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

export const VesselDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vessel, setVessel] = useState<Vessel | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');

  const { hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVessel();
  }, [id]);

  const fetchVessel = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vessels/${id}`);
      if (res.data.success) {
        setVessel(res.data.data);
        setNewStatus(res.data.data.status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!vessel || !newStatus || newStatus === vessel.status) return;
    try {
      setUpdating(true);
      const res = await api.patch(`/vessels/${vessel.id}/status?status=${newStatus}`);
      if (res.data.success) {
        setVessel(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !vessel) {
    return <LoadingSpinner message="Retrieving vessel specifications..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/vessels')}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>{vessel.name}</span>
            <StatusBadge status={vessel.status} />
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">IMO: {vessel.imoNumber}</p>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details (2 cols) */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Naval Architecture & Vessel Specifications
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                Vessel Type
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {vessel.vesselType.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                Flag Registry
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {vessel.flag || 'International'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                Deadweight Tonnage (DWT)
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block font-mono">
                {vessel.deadweightTonnage ? `${vessel.deadweightTonnage.toLocaleString()} MT` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                Cargo Capacity
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block font-mono">
                {vessel.cargoCapacity ? `${vessel.cargoCapacity.toLocaleString()} MT` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                Length Overall (LOA)
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block font-mono">
                {vessel.lengthOverall ? `${vessel.lengthOverall} meters` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                Beam (Width)
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block font-mono">
                {vessel.beam ? `${vessel.beam} meters` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                Draft (Depth)
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block font-mono text-portblue-600">
                {vessel.draft ? `${vessel.draft} meters` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                Current Location
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block truncate">
                {vessel.currentLocation || 'At Sea'}
              </span>
            </div>
          </div>
        </div>

        {/* Operational Status Update Panel (1 col) */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Operational Status
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Current Operational State
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={!hasRole(['ADMIN', 'PORT_AUTHORITY', 'SHIPPING_AGENT'])}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
              >
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="ARRIVING">ARRIVING</option>
                <option value="AT_ANCHORAGE">AT ANCHORAGE</option>
                <option value="AT_BERTH">AT BERTH</option>
                <option value="LOADING">LOADING</option>
                <option value="UNLOADING">UNLOADING</option>
                <option value="DEPARTED">DEPARTED</option>
                <option value="DELAYED">DELAYED</option>
              </select>
            </div>

            {hasRole(['ADMIN', 'PORT_AUTHORITY', 'SHIPPING_AGENT']) && (
              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === vessel.status}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-portblue-500 hover:bg-portblue-600 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                {updating ? 'Updating status...' : 'Update Status'}
              </button>
            )}

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Registered At:</span>
                <span className="font-mono text-slate-700">
                  {new Date(vessel.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-mono text-slate-700">
                  {new Date(vessel.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
