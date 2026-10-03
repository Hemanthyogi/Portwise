import React, { useEffect, useState } from 'react';
import { ShieldAlert, Search, Filter, Clock, User } from 'lucide-react';
import api from '../services/api';
import { AuditLog, PageResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [entityFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let url = '/audit-logs?page=0&size=50';
      if (entityFilter) url += `&entityType=${entityFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setLogs(res.data.data.content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Administrative Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable system logs, security events, berthing authorizations, and cargo status updates
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-portblue-500 shadow-xs"
          >
            <option value="">All Entities</option>
            <option value="User">User</option>
            <option value="VesselSchedule">Vessel Schedule</option>
            <option value="Vessel">Vessel</option>
            <option value="Cargo">Cargo</option>
            <option value="Berth">Berth</option>
            <option value="ResourceAllocation">Resource Allocation</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading audit trail records..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Initiating Principal</th>
                  <th className="py-3 px-4">Operation Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No audit records found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors font-mono">
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-portblue-600 bg-portblue-50 px-2 py-0.5 rounded border border-portblue-100 text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-sans">
                        {log.entityType} {log.entityId ? `(#${log.entityId})` : ''}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-sans">
                        {log.userEmail || 'System Process'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-sans truncate max-w-md">
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
