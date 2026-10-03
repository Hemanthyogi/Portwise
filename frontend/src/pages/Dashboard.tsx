import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ship,
  Anchor,
  Package,
  CheckCircle2,
  Columns,
  CalendarDays,
  BellRing,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import api from '../services/api';
import { DashboardData } from '../types';
import { KpiCard } from '../components/KpiCard';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';

const COLORS = ['#0284c7', '#0d9488', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <LoadingSpinner message="Aggregating live port operations..." size="lg" />;
  }

  const vesselChartData = Object.entries(data.vesselStatusDistribution || {}).map(
    ([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value,
    })
  );

  const cargoChartData = Object.entries(data.cargoStatusDistribution || {}).map(
    ([name, value]) => ({
      name: name.replace(/_/g, ' '),
      quantity: value,
    })
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Operational Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry, vessel movements, berth allocations, and active cargo operations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/schedules')}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold text-white bg-portblue-500 hover:bg-portblue-600 rounded-lg shadow-xs transition-colors"
          >
            <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
            Vessel Schedules
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Active Vessels"
          value={data.activeVessels}
          icon={Ship}
          accentColor="blue"
          subtext="Under port coordination"
        />
        <KpiCard
          title="Vessels Arriving"
          value={data.arrivingVessels}
          icon={ArrowUpRight}
          accentColor="teal"
          subtext="ETA within 48 hours"
        />
        <KpiCard
          title="At Berth"
          value={data.atBerthVessels}
          icon={Anchor}
          accentColor="navy"
          subtext="Currently docked"
        />
        <KpiCard
          title="Cargo In Transit"
          value={data.cargoInTransit}
          icon={Package}
          accentColor="amber"
          subtext="Sea & intermodal"
        />
        <KpiCard
          title="Cargo Completed"
          value={data.cargoCompleted}
          icon={CheckCircle2}
          accentColor="emerald"
          subtext="Delivered & cleared"
        />
        <KpiCard
          title="Berths Occupied"
          value={data.berthsOccupied}
          icon={Columns}
          accentColor="blue"
          subtext="Active vessel berthing"
        />
        <KpiCard
          title="Berths Available"
          value={data.berthsAvailable}
          icon={Columns}
          accentColor="emerald"
          subtext="Ready for allocation"
        />
        <KpiCard
          title="Pending Requests"
          value={data.pendingSchedules}
          icon={CalendarDays}
          accentColor="amber"
          subtext="Requires authority review"
        />
        <KpiCard
          title="Active Alerts"
          value={data.activeAlerts}
          icon={BellRing}
          accentColor="rose"
          subtext="Incidents & warnings"
        />
        <KpiCard
          title="Avg Turnaround"
          value="34.5 hrs"
          icon={Clock}
          accentColor="teal"
          subtext="Port efficiency benchmark"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vessel Distribution Chart */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <Ship className="w-4 h-4 mr-2 text-portblue-500" />
              Vessel Traffic by Operational Status
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Live PostgreSQL Data</span>
          </div>
          <div className="h-64">
            {vesselChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No active vessel data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vesselChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {vesselChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Cargo Status Distribution Chart */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <Package className="w-4 h-4 mr-2 text-tealbrand-500" />
              Cargo Logistics Movement Pipeline
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Recorded Consignments</span>
          </div>
          <div className="h-64">
            {cargoChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No cargo pipeline data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cargoChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="quantity" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Schedules and Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Vessel Schedules Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <CalendarDays className="w-4 h-4 mr-2 text-portblue-500" />
              Upcoming & Active Vessel Schedules
            </h3>
            <button
              onClick={() => navigate('/schedules')}
              className="text-xs text-portblue-600 hover:text-portblue-700 font-medium"
            >
              View all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-2.5">Vessel</th>
                  <th className="pb-2.5">Port</th>
                  <th className="pb-2.5">Berth</th>
                  <th className="pb-2.5">ETA</th>
                  <th className="pb-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!data.recentSchedules || data.recentSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      No schedule records available
                    </td>
                  </tr>
                ) : (
                  data.recentSchedules.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800">
                        {s.vesselName}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {s.vesselImo}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600">{s.portName}</td>
                      <td className="py-2.5 text-slate-600">{s.berthName || 'Unassigned'}</td>
                      <td className="py-2.5 text-slate-600 font-mono text-[11px]">
                        {new Date(s.eta).toLocaleDateString()}
                      </td>
                      <td className="py-2.5">
                        <StatusBadge status={s.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Alerts Panel (1 Col) */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <BellRing className="w-4 h-4 mr-2 text-rose-500" />
              Operational Alerts
            </h3>
            <button
              onClick={() => navigate('/alerts')}
              className="text-xs text-portblue-600 hover:text-portblue-700 font-medium"
            >
              All Alerts
            </button>
          </div>
          <div className="space-y-3">
            {!data.recentAlerts || data.recentAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active alerts</p>
            ) : (
              data.recentAlerts.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-800 truncate mr-2">
                      {a.title}
                    </span>
                    <StatusBadge status={a.severity} />
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {a.description}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(a.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
