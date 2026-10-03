import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ship, Save, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { VesselType } from '../types';

export const VesselCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    imoNumber: '',
    name: '',
    vesselType: 'BULK_CARRIER' as VesselType,
    flag: '',
    deadweightTonnage: '',
    lengthOverall: '',
    beam: '',
    draft: '',
    cargoCapacity: '',
    currentLocation: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        deadweightTonnage: formData.deadweightTonnage ? parseFloat(formData.deadweightTonnage) : undefined,
        lengthOverall: formData.lengthOverall ? parseFloat(formData.lengthOverall) : undefined,
        beam: formData.beam ? parseFloat(formData.beam) : undefined,
        draft: formData.draft ? parseFloat(formData.draft) : undefined,
        cargoCapacity: formData.cargoCapacity ? parseFloat(formData.cargoCapacity) : undefined,
      };

      const res = await api.post('/vessels', payload);
      if (res.data.success) {
        navigate(`/vessels/${res.data.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create vessel record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/vessels')}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Register New Commercial Vessel</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add maritime vessel specifications and IMO documentation to the registry
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                IMO Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="IMO9876543"
                value={formData.imoNumber}
                onChange={(e) => setFormData({ ...formData, imoNumber: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-portblue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Format: IMO followed by 7 digits</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vessel Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="MV Eastern Glory"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-portblue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vessel Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.vesselType}
                onChange={(e) => setFormData({ ...formData, vesselType: e.target.value as VesselType })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-portblue-500"
              >
                <option value="BULK_CARRIER">BULK CARRIER</option>
                <option value="CONTAINER">CONTAINER</option>
                <option value="TANKER">TANKER</option>
                <option value="GENERAL_CARGO">GENERAL CARGO</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Flag State
              </label>
              <input
                type="text"
                placeholder="India, Panama, Liberia..."
                value={formData.flag}
                onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-portblue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deadweight Tonnage (DWT in MT)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="75000"
                value={formData.deadweightTonnage}
                onChange={(e) => setFormData({ ...formData, deadweightTonnage: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-portblue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cargo Capacity (MT)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="70000"
                value={formData.cargoCapacity}
                onChange={(e) => setFormData({ ...formData, cargoCapacity: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-portblue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Length Overall (LOA in meters)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="225.0"
                value={formData.lengthOverall}
                onChange={(e) => setFormData({ ...formData, lengthOverall: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-portblue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Beam (Width in meters)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="32.0"
                value={formData.beam}
                onChange={(e) => setFormData({ ...formData, beam: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-portblue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Draft (Depth in meters)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="13.5"
                value={formData.draft}
                onChange={(e) => setFormData({ ...formData, draft: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-portblue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Location
              </label>
              <input
                type="text"
                placeholder="Bay of Bengal, Indian Ocean..."
                value={formData.currentLocation}
                onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-portblue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/vessels')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-portblue-500 hover:bg-portblue-600 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {loading ? 'Registering...' : 'Register Vessel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
