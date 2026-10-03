import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Search, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { Cargo, CargoStatus, PageResponse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

export const CargoPage: React.FC = () => {
  const [cargoList, setCargoList] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const { hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCargo();
  }, [page, statusFilter]);

  const fetchCargo = async () => {
    try {
      setLoading(true);
      let url = `/cargo?page=${page}&size=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        const p: PageResponse<Cargo> = res.data.data;
        setCargoList(p.content);
        setTotalPages(p.totalPages);
        setTotalElements(p.totalElements);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchCargo();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cargo & Consignment Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manifest tracking, multimodal cargo movement, inspection status, and consignee deliveries
          </p>
        </div>
        {hasRole(['ADMIN', 'CARGO_OWNER', 'SHIPPING_AGENT']) && (
          <button
            onClick={() => navigate('/cargo/create')}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-portblue-500 hover:bg-portblue-600 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Register Cargo
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description, consignee, origin..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-portblue-500 text-slate-700"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-portblue-500"
          >
            <option value="">All Statuses</option>
            <option value="REGISTERED">REGISTERED</option>
            <option value="IN_TRANSIT">IN TRANSIT</option>
            <option value="AT_PORT">AT PORT</option>
            <option value="LOADING">LOADING</option>
            <option value="UNLOADING">UNLOADING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="DELAYED">DELAYED</option>
          </select>
        </div>
      </div>

      {/* Cargo Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Retrieving cargo inventory..." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Description / Type</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Origin → Destination</th>
                    <th className="py-3 px-4">Consignee</th>
                    <th className="py-3 px-4">Shipment #</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Tracking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cargoList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No cargo records found
                      </td>
                    </tr>
                  ) : (
                    cargoList.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {c.description || 'Cargo'}
                          <span className="block text-[10px] text-portblue-600 font-semibold uppercase">
                            {c.cargoType.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                          {c.quantity.toLocaleString()} {c.unit}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {c.origin || '—'} → {c.destination || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{c.consignee || '—'}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {c.shipmentNumber || 'Direct'}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => navigate(`/cargo/${c.id}`)}
                            className="inline-flex items-center px-2 py-1 text-[11px] font-semibold text-portblue-600 hover:text-portblue-700 hover:bg-portblue-50 rounded border border-portblue-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Timeline
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <strong>{cargoList.length}</strong> of <strong>{totalElements}</strong> items
              </span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span>
                  Page {page + 1} of {Math.max(1, totalPages)}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
