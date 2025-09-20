import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, List, LayoutGrid, RefreshCw } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { useStockLedger } from '../hooks/useApiHooks';
import { StockLedgerEntry } from '../services/apiClient';

export const StockLedger: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<'MO_CONSUMPTION' | 'MO_PRODUCTION' | 'MANUAL_ADJUSTMENT' | 'STOCK_ADJUSTMENT' | ''>('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Memoize the hook parameters to prevent infinite re-renders
  const hookParams = useMemo(() => ({
    search: searchTerm || undefined,
    movement_type: movementTypeFilter || undefined,
    autoFetch: true
  }), [searchTerm, movementTypeFilter]);

  // Use the real API hook
  const { 
    data: stockLedgerData = [], 
    loading, 
    error, 
    refetch 
  } = useStockLedger(hookParams);

  // Compute filtered items directly without state to avoid infinite re-renders
  const filteredItems = useMemo(() => {
    if (searchTerm.trim() === '') {
      return stockLedgerData;
    } else {
      return stockLedgerData.filter((item: StockLedgerEntry) => 
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }, [stockLedgerData, searchTerm]);

  const handleSearch = () => {
    // Search functionality is handled by useEffect on searchTerm change
    console.log('Search triggered for:', searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementTypeDisplay = (type: string) => {
    const types = {
      'MO_CONSUMPTION': 'Material Consumption',
      'MO_PRODUCTION': 'Production',
      'MANUAL_ADJUSTMENT': 'Manual Adjustment',
      'STOCK_ADJUSTMENT': 'Stock Adjustment'
    };
    return types[type as keyof typeof types] || type;
  };

  const getQuantityChangeColor = (quantity: string) => {
    const num = parseFloat(quantity);
    if (num > 0) return 'text-green-600';
    if (num < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleNewStock = () => {
    console.log('Navigating to stock ledger form...');
    navigate('/stock-ledger/new');
  };

  return (
    <AppLayout title="Stock Ledger">
      <div className="max-w-7xl mx-auto">
        {/* Header with New Button and Search */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleNewStock}
            className="flex items-center gap-2 px-3 py-1 border border-black text-black rounded hover:bg-black hover:text-white transition-colors"
          >
            <span className="text-sm font-medium">New</span>
          </button>
          
          {/* Search Section */}
          <div className="flex items-center gap-2">
            {/* Movement Type Filter */}
            <select
              value={movementTypeFilter}
              onChange={(e) => setMovementTypeFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm"
            >
              <option value="">All Types</option>
              <option value="MO_CONSUMPTION">Material Consumption</option>
              <option value="MO_PRODUCTION">Production</option>
              <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
              <option value="STOCK_ADJUSTMENT">Stock Adjustment</option>
            </select>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black w-64"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="p-2 text-black border border-gray-300 hover:bg-gray-100 rounded-md transition-colors"
              title="Search"
            >
              <Search size={20} />
            </button>
            
            <button 
              onClick={refetch}
              className="p-2 text-black border border-gray-300 hover:bg-gray-100 rounded-md transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
            
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden ml-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="List View"
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Kanban View"
              >
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Table/Kanban View */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Product</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Movement Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Quantity Change</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Stock Before</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Stock After</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Reference</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        Loading stock movements...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-red-500">
                        Error loading data: {error}
                      </td>
                    </tr>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <tr 
                        key={item.ledger_id} 
                        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="p-4 text-sm text-gray-900 font-medium">
                          <div>
                            <div className="font-medium">{item.product_name}</div>
                            <div className="text-xs text-gray-500">{item.product_sku}</div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            {getMovementTypeDisplay(item.movement_type)}
                          </span>
                        </td>
                        <td className={`p-4 text-sm font-medium ${getQuantityChangeColor(item.quantity_change)}`}>
                          {parseFloat(item.quantity_change) > 0 ? '+' : ''}{item.quantity_change}
                        </td>
                        <td className="p-4 text-sm text-gray-900">{item.stock_before}</td>
                        <td className="p-4 text-sm text-gray-900 font-medium">{item.stock_after}</td>
                        <td className="p-4 text-sm text-gray-900">
                          {item.reference_number || '-'}
                          {item.mo_number && (
                            <div className="text-xs text-blue-600">{item.mo_number}</div>
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-900">{formatDate(item.transaction_time)}</td>
                        <td className="p-4 text-sm text-gray-900">{item.created_by_name}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        {searchTerm ? 'No stock movements found matching your search.' : 'No stock movements available.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <p>Loading stock movements...</p>
              </div>
            ) : error ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-red-500">
                <p>Error loading data: {error}</p>
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div 
                  key={item.ledger_id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md cursor-pointer transition-all hover:border-gray-300"
                >
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                      <p className="text-sm text-gray-500">{item.product_sku}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Movement:</span>
                        <p className="font-medium text-xs">
                          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                            {getMovementTypeDisplay(item.movement_type)}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Change:</span>
                        <p className={`font-medium ${getQuantityChangeColor(item.quantity_change)}`}>
                          {parseFloat(item.quantity_change) > 0 ? '+' : ''}{item.quantity_change}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Before:</span>
                        <p className="font-medium">{item.stock_before}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">After:</span>
                        <p className="font-medium">{item.stock_after}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Date:</span>
                        <p className="font-medium text-xs">{formatDate(item.transaction_time)}</p>
                      </div>
                      {item.reference_number && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Reference:</span>
                          <p className="font-medium text-xs">{item.reference_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <LayoutGrid size={48} className="mb-4 text-gray-300" />
                <p>{searchTerm ? 'No stock movements found matching your search.' : 'No stock movements available.'}</p>
              </div>
            )}
          </div>
        )}

        {/* Results Summary */}
        {searchTerm && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredItems.length} stock movements
          </div>
        )}
      </div>
    </AppLayout>
  );
};