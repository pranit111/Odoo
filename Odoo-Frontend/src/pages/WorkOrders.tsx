import React, { useState, useEffect } from 'react';
import { Filters } from '../components/Filters';
import { Sidebar } from '../components/Sidebar';
import { Search, User, Play, Pause, CheckCircle, Clock } from 'lucide-react';
import { useWorkOrders } from '../hooks/useApiHooks';
import { apiClient } from '../services/apiClient';

export const WorkOrders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data: workOrders, loading, error, refetch } = useWorkOrders();

  // Timer for live updates of in-progress work orders
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [workOrders, searchTerm, filters]);

  const applyFilters = () => {
    // Check if workOrders is available and is an array
    if (!workOrders || !Array.isArray(workOrders)) {
      setFilteredData([]);
      return;
    }

    let filtered = [...workOrders];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(wo => 
        wo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.work_center_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (wo.manufacturing_order_number || '').toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleWorkOrderAction = async (workOrderId: string, action: 'start' | 'pause' | 'complete', notes?: string) => {
    setActionLoading(workOrderId);
    
    try {
      let result;
      switch (action) {
        case 'start':
          result = await apiClient.startWorkOrder(workOrderId, { notes: notes || 'Started from work orders view' });
          break;
        case 'pause':
          result = await apiClient.pauseWorkOrder(workOrderId, { notes: notes || 'Paused from work orders view' });
          break;
        case 'complete':
          result = await apiClient.completeWorkOrder(workOrderId, { notes: notes || 'Completed from work orders view' });
          break;
      }
      
      console.log(`Work order ${action} result:`, result);
      
      // Refresh the work orders list
      await refetch();
      
    } catch (error) {
      console.error(`Error ${action}ing work order:`, error);
      alert(`Failed to ${action} work order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDurationWithLiveTime = (workOrder: any): string => {
    if (workOrder.status === 'IN_PROGRESS' && workOrder.actual_start_date) {
      const startTime = new Date(workOrder.actual_start_date);
      const now = currentTime;
      const elapsedMs = now.getTime() - startTime.getTime();
      
      // Add any existing actual duration and subtract pause time
      const existingMinutes = workOrder.actual_duration_minutes || 0;
      const pauseMinutes = workOrder.total_pause_minutes || 0;
      
      // Calculate current session time (if not paused)
      let currentSessionMs = 0;
      if (!workOrder.pause_start_time) {
        currentSessionMs = elapsedMs;
      } else {
        // If paused, only count time up to pause start
        const pauseStart = new Date(workOrder.pause_start_time);
        currentSessionMs = pauseStart.getTime() - startTime.getTime();
      }
      
      const currentSessionMinutes = Math.floor(currentSessionMs / (1000 * 60));
      const currentSessionSeconds = Math.floor((currentSessionMs % (1000 * 60)) / 1000);
      
      const totalMinutes = existingMinutes + currentSessionMinutes - pauseMinutes;
      const totalSeconds = currentSessionSeconds;
      
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
    }
    
    // For non-active work orders, show minutes with :00 seconds
    const minutes = workOrder.actual_duration_minutes || 0;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  };

  const renderWorkOrderActions = (workOrder: any) => {
    const isLoading = actionLoading === workOrder.wo_id;
    
    return (
      <div className="flex items-center gap-2">
        {workOrder.status === 'PENDING' && (
          <button
            onClick={() => handleWorkOrderAction(workOrder.wo_id, 'start')}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm disabled:opacity-50"
            title="Start Work Order"
          >
            <Play size={14} />
            {isLoading ? 'Starting...' : 'Start'}
          </button>
        )}
        
        {workOrder.status === 'IN_PROGRESS' && (
          <>
            <button
              onClick={() => handleWorkOrderAction(workOrder.wo_id, 'pause')}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm disabled:opacity-50"
              title="Pause Work Order"
            >
              <Pause size={14} />
              {isLoading ? 'Pausing...' : 'Pause'}
            </button>
            <button
              onClick={() => handleWorkOrderAction(workOrder.wo_id, 'complete')}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm disabled:opacity-50"
              title="Complete Work Order"
            >
              <CheckCircle size={14} />
              {isLoading ? 'Completing...' : 'Complete'}
            </button>
          </>
        )}
        
        {workOrder.status === 'PAUSED' && (
          <>
            <button
              onClick={() => handleWorkOrderAction(workOrder.wo_id, 'start')}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm disabled:opacity-50"
              title="Resume Work Order"
            >
              <Play size={14} />
              {isLoading ? 'Resuming...' : 'Resume'}
            </button>
            <button
              onClick={() => handleWorkOrderAction(workOrder.wo_id, 'complete')}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm disabled:opacity-50"
              title="Complete Work Order"
            >
              <CheckCircle size={14} />
              {isLoading ? 'Completing...' : 'Complete'}
            </button>
          </>
        )}
        
        {workOrder.status === 'COMPLETED' && (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">
            <CheckCircle size={14} />
            Completed
          </span>
        )}
      </div>
    );
  };

  const filterOptions = [
    {
      name: "status",
      type: "select",
      options: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED"]
    },
    {
      name: "workCenter",
      type: "select", 
      options: ["Paint Job", "Wood Sanding", "Cutting", "Assembly", "Quality Control"]
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
            
            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-600">Loading work orders...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-600">Error loading work orders: {error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Center</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturing Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency %</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((workOrder) => (
                      <tr key={workOrder.wo_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {workOrder.wo_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {workOrder.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {workOrder.work_center_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {workOrder.manufacturing_order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex flex-col">
                            <span>Est: {Math.floor((workOrder.estimated_duration_minutes || 0) / 60)}:{String((workOrder.estimated_duration_minutes || 0) % 60).padStart(2, '0')}:00</span>
                            <span className="text-gray-500">
                              Act: {formatDurationWithLiveTime(workOrder)}
                              {workOrder.status === 'IN_PROGRESS' && !workOrder.pause_start_time && (
                                <Clock className="inline ml-1 h-3 w-3 text-blue-500" />
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            workOrder.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            workOrder.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            workOrder.status === 'PAUSED' ? 'bg-orange-100 text-orange-800' :
                            workOrder.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            workOrder.status === 'CANCELED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {workOrder.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {workOrder.efficiency_percentage ? `${workOrder.efficiency_percentage.toFixed(1)}%` : '0%'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {renderWorkOrderActions(workOrder)}
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                          No work orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};