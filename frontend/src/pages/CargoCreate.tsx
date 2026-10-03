import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Save, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { CargoType } from '../types';

export const CargoCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cargoType: 'COAL' as CargoType,
    description: '',
    quantity: '',
    unit: 'MT',
    origin: '',
    destination: '',
    consignee: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        quantity: parseFloat(formData.quantity),
      };

      const res = await api.post('/cargo', payload);
      if (res.data.success) {
        navigate(`/cargo/${res.data.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register cargo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/cargo')}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Register Cargo Consignment</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create an entry in the port logistics custody chain
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Commodity / Cargo Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.cargoType}
              onChange={(e) => setFormData({ ...formData, cargoType: e.target.value as CargoType })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            >
              <option value="COAL">COAL</option>
              <option value="IRON_ORE">IRON ORE</option>
              <option value="FERTILIZER">FERTILIZER</option>
              <option value="GRAIN">GRAIN</option>
              <option value="CONTAINERIZED">CONTAINERIZED</option>
              <option value="GENERAL_CARGO">GENERAL CARGO</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description & Specification <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Thermal Coal Grade A, Container TEU 40ft..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="50000"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unit of Measure <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="MT, TEU, Barrels, Units"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Origin Location / Port</label>
              <input
                type="text"
                placeholder="Paradip, Haldia, Singapore..."
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destination Location / Port</label>
              <input
                type="text"
                placeholder="Visakhapatnam, Chennai..."
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Consignee / Receiver</label>
            <input
              type="text"
              placeholder="e.g. Eastern Steel Works Pvt Ltd"
              value={formData.consignee}
              onChange={(e) => setFormData({ ...formData, consignee: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/cargo')}
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
              {loading ? 'Registering...' : 'Register Consignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
