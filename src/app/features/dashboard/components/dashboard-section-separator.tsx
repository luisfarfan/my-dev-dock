import { ArrowRight } from 'lucide-react';
import React from 'react';

export const DashboardSectionSeparator: React.FC = () => {
  return (
    <div className="relative flex items-center py-4">
      <div className="flex-1 border-t border-border" />
      <div className="mx-6 p-2 rounded-full border border-border bg-card">
        <ArrowRight className="w-4 h-4 text-muted-foreground/40 rotate-90" />
      </div>
      <div className="flex-1 border-t border-border" />
    </div>
  );
};
