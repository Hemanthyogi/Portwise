import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  accentColor?: 'blue' | 'teal' | 'emerald' | 'amber' | 'rose' | 'navy';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  subtext,
  accentColor = 'blue',
}) => {
  const colorMap = {
    blue: 'bg-portblue-50 text-portblue-500 border-portblue-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    navy: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg border ${colorMap[accentColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
        {change && (
          <span
            className={`text-xs font-semibold ${
              changeType === 'positive'
                ? 'text-emerald-600'
                : changeType === 'negative'
                ? 'text-rose-600'
                : 'text-slate-500'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
  );
};
