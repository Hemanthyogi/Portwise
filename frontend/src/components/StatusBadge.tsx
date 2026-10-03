import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = (val: string) => {
    switch (val?.toUpperCase()) {
      case 'AVAILABLE':
      case 'APPROVED':
      case 'COMPLETED':
      case 'OPERATIONAL':
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
      case 'SCHEDULED':
      case 'REGISTERED':
      case 'ACKNOWLEDGED':
      case 'PARTIAL':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'IN_TRANSIT':
      case 'ARRIVING':
      case 'LOADING':
      case 'UNLOADING':
      case 'AT_BERTH':
      case 'ALLOCATED':
      case 'ACTIVE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'AT_ANCHORAGE':
      case 'RESERVED':
      case 'WARNING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REJECTED':
      case 'CANCELLED':
      case 'DELAYED':
      case 'CRITICAL':
      case 'OUT_OF_SERVICE':
      case 'CLOSED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MAINTENANCE':
      case 'INFO':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatText = (val: string) => {
    if (!val) return '';
    return val.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getBadgeStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {formatText(status)}
    </span>
  );
};
