import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useManufacturingOrders, useManufacturingDashboard } from '../hooks/useApiHooks';
import { Sidebar } from '../components/Sidebar';
import { ProfileDropdown } from '../components/ProfileDropdown';

type StatusTab = 'All' | 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StatusTab>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: orders = [], loading: ordersLoading, error: ordersError } = useManufacturingOrders();
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useManufacturingDashboard();

  useEffect(() => {
    // Debug the loading states vs data presence
    // Remove if noisy after verification
    console.debug('[Dashboard] ordersLoading:', ordersLoading, 'orders.length:', orders?.length || 0);
    console.debug('[Dashboard] dashboardLoading:', dashboardLoading, 'hasDashboardData:', !!dashboardData);
  }, [ordersLoading, orders?.length, dashboardLoading, dashboardData]);

  const statusTabs: { key: StatusTab; label: string }[] = [
    { key: 'All', label: 'All' },
    { key: 'DRAFT', label: 'Draft' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELED', label: 'Canceled' }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.mo_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'All') return matchesSearch;
    return matchesSearch && order.status === activeTab;
  });

  const getStatusCount = (status: StatusTab) => {
    if (!dashboardData) return 0;
    
    switch (status) {
      case 'All': return dashboardData.statistics?.total_mos || 0;
      case 'DRAFT': return dashboardData.statistics?.draft || 0;
      case 'CONFIRMED': return dashboardData.statistics?.confirmed || 0;
      case 'IN_PROGRESS': return dashboardData.statistics?.in_progress || 0;
      case 'COMPLETED': return dashboardData.statistics?.completed || 0;
      case 'CANCELED': return dashboardData.statistics?.canceled || 0;
      default: return 0;
    }
  };

  const handleNewMO = () => {
    navigate('/manufacturing-orders/new');
  };

  const handleRowClick = (id: string) => {
    navigate(`/manufacturing-orders/${id}`);
  };

  // Avoid getting stuck in loading if one dataset is already available
  const loading = (ordersLoading && orders.length === 0) || (dashboardLoading && !dashboardData);
  const error = ordersError || dashboardError;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-black mx-auto">Manufacturing Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <ProfileDropdown />
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 bg-white">
          {/* New Manufacturing Order Button */}
          <div className="flex items-center gap-2 mb-4">
            <button 
              className="flex items-center gap-2 px-3 py-1 border border-black rounded text-black hover:bg-black hover:text-white transition-colors"
              onClick={handleNewMO}
            >
              <Plus size={16} />
              <span className="text-sm">New</span>
              <span className="text-xs">Manufacturing Order</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded text-black placeholder-gray-400 focus:border-black focus:outline-none text-sm"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1 rounded text-sm border transition-colors ${
                  activeTab === tab.key
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-500 hover:text-gray-900'
                }`}
              >
                {getStatusCount(tab.key)} {tab.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded border border-gray-300 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-3 text-sm text-gray-700 font-medium">MO Number</th>
                  <th className="text-left p-3 text-sm text-gray-700 font-medium">Product</th>
                  <th className="text-left p-3 text-sm text-gray-700 font-medium">Scheduled Date</th>
                  <th className="text-left p-3 text-sm text-gray-700 font-medium">Quantity</th>
                  <th className="text-left p-3 text-sm text-gray-700 font-medium">Priority</th>
                  <th className="text-left p-3 text-sm text-gray-700 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.mo_id}
                    onClick={() => handleRowClick(order.mo_id)}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 text-sm text-gray-900">{order.mo_number}</td>
                    <td className="p-3 text-sm text-gray-900">{order.product_name}</td>
                    <td className="p-3 text-sm text-gray-900">
                      {order.scheduled_start_date ? new Date(order.scheduled_start_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-3 text-sm text-gray-900">{order.quantity_to_produce}</td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.priority === 'HIGH' ? 'bg-red-100 text-red-800 border border-red-200' :
                        order.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        order.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        order.status === 'DRAFT' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border border-green-200' :
                        order.status === 'CANCELED' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No manufacturing orders found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};