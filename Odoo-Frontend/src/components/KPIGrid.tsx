import React, { useState, useEffect } from 'react';
import { useManufacturingDashboard } from '../hooks/useApiHooks';

interface KPIItem {
  label: string;
  valueKey: string;
}

interface KPIGridProps {
  items: KPIItem[];
}

export const KPIGrid: React.FC<KPIGridProps> = ({ items }) => {
  const { data: dashboardData, loading, error } = useManufacturingDashboard();
  const [kpiData, setKpiData] = useState<any>({});

  useEffect(() => {
    if (dashboardData) {
      // Map dashboard statistics to KPI data
      setKpiData({
        total_mos: dashboardData.statistics?.total_mos || 0,
        draft: dashboardData.statistics?.draft || 0,
        confirmed: dashboardData.statistics?.confirmed || 0,
        in_progress: dashboardData.statistics?.in_progress || 0,
        completed: dashboardData.statistics?.completed || 0,
        canceled: dashboardData.statistics?.canceled || 0,
      });
    }
  }, [dashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading KPIs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Error loading KPIs: {error}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {items.map((item, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-black mb-2">
            {kpiData[item.valueKey] || 0}
          </div>
          <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};