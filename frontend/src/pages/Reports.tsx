import React, { useEffect, useState } from 'react';
import { BarChart3, Download, Filter, TrendingUp, Ship, Package, Columns, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

const COLORS = ['#0284c7', '#0d9488', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export const Reports: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/operational');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Vessels', data.totalVessels],
      ['Total Cargo Operations', data.totalCargoOperations],
      ['Total Cargo Quantity (MT)', data.totalCargoQuantity],
      ['Berth Utilization (%)', data.berthUtilizationPercentage],
      ['Average Turnaround (Hours)', data.averageTurnaroundHours],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `portwise_operational_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !data) {
    return <LoadingSpinner message="Generating port operational intelligence report..." />;
  }

  const trafficChartData = Object.entries(data.trafficByType || {}).map(([type, count]) => ({
    name: type.replace(/_/g, ' '),
    vessels: count,
  }));

  const cargoChartData = Object.entries(data.cargoByType || {}).map(([type, count]) => ({
    name: type.replace(/_/g, ' '),
    operations: count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Port Intelligence</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational analytics, throughput trajectories, berth efficiency, and exportable audit summaries
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-tealbrand-600 hover:bg-tealbrand-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export Operational CSV
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
            Fleet Registered
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{data.totalVessels}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Active commercial vessels</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
            Throughput Handled
          </span>
          <span className="text-2xl font-bold text-portblue-600 font-mono mt-1 block">
            {data.totalCargoQuantity ? Number(data.totalCargoQuantity).toLocaleString() : '0'} MT
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Bulk & containerized tonnage</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
            Berth Utilization
          </span>
          <span className="text-2xl font-bold text-emerald-600 font-mono mt-1 block">
            {data.berthUtilizationPercentage}%
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Active occupancy quotient</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
            Avg Turnaround Time
          </span>
          <span className="text-2xl font-bold text-slate-800 font-mono mt-1 block">
            {data.averageTurnaroundHours} hrs
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">From pilotage to departure</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Throughput Line Chart */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-portblue-500" />
            Monthly Cargo Throughput Trajectory (MT)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyThroughput || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="throughput"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0284c7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vessel Traffic by Type Bar Chart */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
            <Ship className="w-4 h-4 mr-2 text-tealbrand-500" />
            Vessel Traffic Density by Naval Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="vessels" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
