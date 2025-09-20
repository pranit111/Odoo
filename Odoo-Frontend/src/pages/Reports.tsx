import React from 'react';
import { AppLayout } from '../components/AppLayout';

export const Reports: React.FC = () => {
  return (
    <AppLayout title="Reports & Analytics">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-gray-600">Manufacturing performance insights</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Production Throughput</h3>
            <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 italic">Bar Chart - Production throughput over time</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Lead Time Trends</h3>
            <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 italic">Line Chart - Average lead times</p>
            </div>
          </div>
          
          <div className="bg-black text-white rounded-xl shadow-sm p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Scrap Rate</h3>
            <div className="text-4xl font-bold mb-2">2.3%</div>
            <div className="text-gray-300">Current month</div>
          </div>
          
          <div className="bg-black text-white rounded-xl shadow-sm p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">On-Time Delivery</h3>
            <div className="text-4xl font-bold mb-2">94.7%</div>
            <div className="text-gray-300">This quarter</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};