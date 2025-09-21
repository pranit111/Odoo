import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { apiClient, MOComponentRequirement, WorkOrder } from '../services/apiClient';
import { Table } from '../components/Table';
import { AppLayout } from '../components/AppLayout';
import { ArrowLeft, Play, Square, Pause, CheckCircle, Clock } from 'lucide-react';

export const ManufacturingOrderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mo, setMo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [componentRequirements, setComponentRequirements] = useState<MOComponentRequirement[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadMO();
  }, [id]);

  // Timer for live updates of in-progress work orders
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadMO = async () => {
    console.log('Loading MO with ID:', id);
    if (!id) {
      setError('No manufacturing order ID provided');
      setLoading(false);
      return;
    }

    try {
      console.log('Calling API to get manufacturing order...');
      const mo = await apiClient.getManufacturingOrder(id);
      console.log('Received MO data:', mo);
      setMo(mo);
      setError(null);
      
      // Set work orders from the MO response
      if (mo.work_orders) {
        console.log('Setting work orders:', mo.work_orders);
        setWorkOrders(mo.work_orders);
      }
      
      // Set component requirements from the MO response
      if (mo.component_requirements) {
        console.log('Setting component requirements:', mo.component_requirements);
        setComponentRequirements(mo.component_requirements);
      }
    } catch (error) {
      console.error('Error loading MO:', error);
      setError(error instanceof Error ? error.message : 'Failed to load manufacturing order');
      setMo(null);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleWorkOrderAction = async (workOrderId: string, action: 'start' | 'pause' | 'complete', notes?: string) => {
    setActionLoading(workOrderId);
    
    try {
      let result;
      switch (action) {
        case 'start':
          result = await apiClient.startWorkOrder(workOrderId, { notes: notes || 'Started from detail view' });
          break;
        case 'pause':
          result = await apiClient.pauseWorkOrder(workOrderId, { notes: notes || 'Paused from detail view' });
          break;
        case 'complete':
          result = await apiClient.completeWorkOrder(workOrderId, { notes: notes || 'Completed from detail view' });
          break;
      }
      
      console.log(`Work order ${action} result:`, result);
      
      // Reload the MO to get updated work orders
      await loadMO();
      
    } catch (error) {
      console.error(`Error ${action}ing work order:`, error);
      alert(`Failed to ${action} work order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  };

  // Format duration with live seconds for in-progress work orders
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
    
    // For non-active work orders, just show minutes with :00 seconds
    return formatDuration(workOrder.actual_duration_minutes || 0);
  };

  const getWorkOrderStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PAUSED': return 'bg-orange-100 text-orange-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const bomColumns = [
    { key: "component_name", label: "Component" },
    { key: "component_sku", label: "SKU" },
    { key: "quantity_per_unit", label: "Qty per Unit" },
    { key: "required_quantity", label: "Total Required" },
    { key: "available_stock", label: "Available Stock" },
    { key: "consumed_quantity", label: "Consumed" },
    { key: "shortage", label: "Shortage" },
    { key: "is_satisfied", label: "Status" }
  ];

  if (loading) {
    return (
      <AppLayout title="Manufacturing Order Details">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">Loading...</span>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Manufacturing Order Details">
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="text-red-600 text-lg font-medium">Error loading manufacturing order</div>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/manufacturing-orders/new')}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Create Manufacturing Order
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!mo) {
    return (
      <AppLayout title="Manufacturing Order Details">
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="text-gray-600 text-lg font-medium">Manufacturing Order not found</div>
            <p className="text-gray-500 mt-2">The manufacturing order you're looking for doesn't exist or may have been deleted.</p>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/manufacturing-orders/new')}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Create Manufacturing Order
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Manufacturing Order Details">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            className="flex items-center gap-2 px-4 py-2 text-black hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-black">{mo.mo_number}</h1>
          </div>
          
          <div className="flex gap-3">
            <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Play size={16} />
              Start
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Square size={16} />
              Cancel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Finished Product</label>
              <span className="text-gray-900">{mo.product_name}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Quantity</label>
              <span className="text-gray-900">{mo.quantity_to_produce}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Schedule Date</label>
              <span className="text-gray-900">{new Date(mo.scheduled_start_date).toLocaleDateString()}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                mo.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                mo.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                mo.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {mo.status}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-black mb-4">Work Orders</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Center</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workOrders.map((workOrder) => (
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
                          <div className="flex flex-col">
                            <span>Est: {formatDuration(workOrder.estimated_duration_minutes)}</span>
                            <span className="text-gray-500">
                              Act: {formatDurationWithLiveTime(workOrder)}
                              {workOrder.status === 'IN_PROGRESS' && !workOrder.pause_start_time && (
                                <Clock className="inline ml-1 h-3 w-3 text-blue-500" />
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getWorkOrderStatusColor(workOrder.status)}`}>
                            {workOrder.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {workOrder.operator_name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {renderWorkOrderActions(workOrder)}
                        </td>
                      </tr>
                    ))}
                    {workOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No work orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-4">Component Requirements</h2>
            <Table
              columns={bomColumns}
              data={componentRequirements}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};