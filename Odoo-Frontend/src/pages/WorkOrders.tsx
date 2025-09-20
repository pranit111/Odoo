import React, { useState, useEffect } from 'react';
import { Table } from '../components/Table';
import { Filters } from '../components/Filters';
import { Sidebar } from '../components/Sidebar';
import { Search, User } from 'lucide-react';
import { useWorkOrders } from '../hooks/useApiHooks';

export const WorkOrders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});
  const { data: workOrders, loading, error } = useWorkOrders();

  useEffect(() => {
    applyFilters();
  }, [workOrders, searchTerm, filters]);

  const applyFilters = () => {
    let filtered = [...workOrders];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(wo => 
        wo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.work_center_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.manufacturing_order_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(wo => wo.status === filters.status);
    }

    // Apply work center filter
    if (filters.workCenter) {
      filtered = filtered.filter(wo => wo.work_center_name === filters.workCenter);
    }

    setFilteredData(filtered);
  };

  const columns = [
    { key: "wo_number", label: "Work Order" },
    { key: "name", label: "Operation" },
    { key: "work_center_name", label: "Work Center" },
    { key: "manufacturing_order_number", label: "Manufacturing Order" },
    { key: "estimated_duration_minutes", label: "Expected Duration (min)" },
    { key: "actual_duration_minutes", label: "Real Duration (min)" },
    { key: "status", label: "Status" }
  ];

  const filterOptions = [
    {
      name: "status",
      type: "select",
      options: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED"]
    },
    {
      name: "workCenter",
      type: "select",
      options: ["Cutting", "Assembly", "Painting", "Quality Control"]
    },
    {
      name: "dateRange",
      type: "dateRange"
    }
  ];

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

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
              <User size={20} className="text-gray-600" />
            </div>
          </div>
        </div>

        {/* Work Orders Content */}
        <div className="flex-1 p-6 bg-white">
          {/* Header Section */}
          

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Allow user to search based on operation work centers etc"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:border-black focus:outline-none text-sm"
            />
          </div>

          {/* Filters */}
          <Filters 
            filters={filterOptions}
            onFilterChange={handleFilterChange}
          />

          {/* Work Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Work Orders</h2>
            </div>
            
            <Table
              columns={columns}
              data={filteredData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};