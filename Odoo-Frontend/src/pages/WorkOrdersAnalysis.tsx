import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ProfileDropdown } from '../components/ProfileDropdown';
import { Search } from 'lucide-react';

export const WorkOrdersAnalysis: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div></div>
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-black mx-auto">Work Orders Analysis</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <ProfileDropdown />
            </div>
          </div>
        </div>

        {/* Work Orders Content */}
        <div className="flex-1 p-6 bg-white">
          {/* Header Section */}
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm">Allow user to search based on operation, work center, status</p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Allow user to search work order based on operation, work center, finished product, status"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:border-black focus:outline-none text-sm"
            />
          </div>

          {/* Work Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Work Center
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Real Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Assembly-1
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Work Center-1
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Dining Table
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      3
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      180.00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      00.00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        To Do
                      </span>
                    </td>
                  </tr>
                  {/* Additional sample rows */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Cutting-1
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Work Center-2
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Chair
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      4
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      120.00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      115.30
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Done
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Polishing-1
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Work Center-3
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Table Top
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      1
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      90.00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      45.20
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        In Progress
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <div className="flex space-x-6">
                  <span className="text-gray-600">Total Expected: <span className="font-medium text-gray-900">390.00 hrs</span></span>
                  <span className="text-gray-600">Total Real: <span className="font-medium text-gray-900">160.50 hrs</span></span>
                </div>
                <div className="text-right">
                  <span className="text-gray-600">Efficiency: <span className="font-medium text-green-600">142%</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};