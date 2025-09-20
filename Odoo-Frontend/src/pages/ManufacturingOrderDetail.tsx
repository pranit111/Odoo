import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { Table } from '../components/Table';
import { AppLayout } from '../components/AppLayout';
import { ArrowLeft, Play, Square } from 'lucide-react';

export const ManufacturingOrderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mo, setMo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [componentRequirements, setComponentRequirements] = useState<any[]>([]);

  useEffect(() => {
    loadMO();
  }, [id]);

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

  const workOrderColumns = [
    { key: "wo_number", label: "Work Order" },
    { key: "name", label: "Operation" },
    { key: "work_center_name", label: "Work Center" },
    { key: "estimated_duration_minutes", label: "Duration (min)" },
    { key: "actual_duration_minutes", label: "Real Duration (min)" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", render: "buttons" }
  ];

  const bomColumns = [
    { key: "component_name", label: "Component" },
    { key: "required_quantity", label: "Req. Qty" },
    { key: "available_stock", label: "In-Stock" },
    { key: "shortage", label: "Shortage" },
    { key: "actions", label: "Actions", render: "buttons" }
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
            <Table
              columns={workOrderColumns}
              data={workOrders}
              loading={loading}
            />
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