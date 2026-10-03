import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Save, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Vessel, Port } from '../types';

export const ScheduleCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);

  const [formData, setFormData] = useState({
    vesselId: '',
    portId: '',
    eta: '',
    etd: '',
    remarks: '',
  });

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [vRes, pRes] = await Promise.all([
        api.get('/vessels?page=0&size=50'),
        api.get('/ports/all'),
      ]);
      if (vRes.data.success) setVessels(vRes.data.data.content);
      if (pRes.data.success) setPorts(pRes.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        vesselId: Number(formData.vesselId),
        portId: Number(formData.portId),
        eta: formData.eta,
        etd: formData.etd,
        remarks: formData.remarks,
      };

      const res = await api.post('/schedules', payload);
      if (res.data.success) {
        navigate('/schedules');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit arrival request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/schedules')}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Submit Vessel Arrival Request
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            File ETA/ETD windows and destination port for Port Authority berth clearance
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
              Select Vessel <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.vesselId}
              onChange={(e) => setFormData({ ...formData, vesselId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            >
              <option value="">Choose vessel...</option>
              {vessels.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.imoNumber} — {v.vesselType.replace(/_/g, ' ')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Destination Port <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.portId}
              onChange={(e) => setFormData({ ...formData, portId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            >
              <option value="">Choose port...</option>
              {ports.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code}) — {p.state}, {p.country}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Estimated Time of Arrival (ETA) <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.eta}
                onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Estimated Time of Departure (ETD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.etd}
                onChange={(e) => setFormData({ ...formData, etd: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Operation Remarks & Manifest Summary
            </label>
            <textarea
              rows={3}
              placeholder="Manifest type, discharge plan, bunker requirements..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-portblue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/schedules')}
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
              {loading ? 'Submitting...' : 'Submit Arrival Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
