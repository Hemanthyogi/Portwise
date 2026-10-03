import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-700 flex items-center justify-between font-medium">
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        <span>
          <strong>DEMO ENVIRONMENT</strong> — Simulated maritime operations with Indian major ports (Paradip, Vizag, Chennai, Ennore, Haldia).
        </span>
      </div>
      <span className="text-[11px] text-amber-600 font-mono hidden md:inline">
        PORTWISE v1.0.0-PROD-DEMO
      </span>
    </div>
  );
};
