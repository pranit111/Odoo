import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, List, LayoutGrid, RefreshCw, Edit, Trash2, Plus } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { useProducts } from '../hooks/useApiHooks';
import { Product } from '../services/apiClient';
import { apiClient } from '../services/apiClient';

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState<'RAW_MATERIAL' | 'FINISHED_GOOD' | ''>('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Memoize the hook parameters to prevent infinite re-renders
  const hookParams = useMemo(() => ({
    search: searchTerm || undefined,
    product_type: productTypeFilter || undefined,
    autoFetch: true
  }), [searchTerm, productTypeFilter]);

  // Use the real API hook
  const { 
    data: productsData = [], 
    loading, 
    error, 
    refetch 
  } = useProducts(hookParams);

  // Compute filtered items directly without state to avoid infinite re-renders
  const filteredItems = useMemo(() => {
    if (searchTerm.trim() === '') {
      return productsData;
    } else {
      return productsData.filter((item: Product) => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }, [productsData, searchTerm]);

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

  const getProductTypeDisplay = (type: string) => {
    const types = {
      'RAW_MATERIAL': 'Raw Material',
      'FINISHED_GOOD': 'Finished Good'
    };
    return types[type as keyof typeof types] || type;
  };

  const getStockStatusColor = (status: string) => {
    if (status === 'OUT_OF_STOCK') return 'text-red-600 bg-red-100';
    if (status === 'LOW_STOCK') return 'text-yellow-600 bg-yellow-100';
    if (status === 'IN_STOCK') return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  const handleNewProduct = () => {
    navigate('/products/new');
  };

  const handleEditProduct = (product: Product) => {
    navigate(`/products/${product.product_id}/edit`);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete product "${product.name}"?`)) {
      try {
        await apiClient.deleteProduct(product.product_id);
        alert('Product deleted successfully!');
        refetch(); // Refresh the list
      } catch (error) {
        console.error('Error deleting product:', error);
        alert(`Error deleting product: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  return (
    <AppLayout title="Products">
      <div className="max-w-7xl mx-auto">
        {/* Header with New Button and Search */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleNewProduct}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">New Product</span>
          </button>
          
          {/* Search Section */}
          <div className="flex items-center gap-2">
            {/* Product Type Filter */}
            <select
              value={productTypeFilter}
              onChange={(e) => setProductTypeFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm"
            >
              <option value="">All Types</option>
              <option value="RAW_MATERIAL">Raw Materials</option>
              <option value="FINISHED_GOOD">Finished Goods</option>
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
                    <th className="text-left p-4 text-sm font-medium text-gray-700">SKU</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Current Stock</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Minimum Stock</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Unit Cost</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Created</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-500">
                        Loading products...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-red-500">
                        Error loading data: {error}
                      </td>
                    </tr>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <tr 
                        key={item.product_id} 
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600 font-mono">
                          {item.sku}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {getProductTypeDisplay(item.product_type)}
                          </span>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{item.current_stock}</span>
                            <span className="text-gray-500">{item.unit_of_measure}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span>{item.minimum_stock || 'N/A'}</span>
                            {item.minimum_stock && (
                              <span className="text-gray-500">{item.unit_of_measure}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {item.unit_cost ? formatCurrency(item.unit_cost) : 'N/A'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(item.stock_status)}`}>
                            {item.stock_status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {item.created_at ? formatDate(item.created_at) : 'N/A'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditProduct(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(item)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Kanban View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                Loading products...
              </div>
            ) : error ? (
              <div className="col-span-full text-center text-red-500 py-8">
                Error loading data: {error}
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div 
                  key={item.product_id}
                  className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 text-sm leading-tight">
                        {item.name}
                      </h3>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleEditProduct(item)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(item)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-mono mb-2">{item.sku}</p>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getProductTypeDisplay(item.product_type)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-medium">
                        {item.current_stock} {item.unit_of_measure}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min Stock:</span>
                      <span>{item.minimum_stock || 'N/A'} {item.minimum_stock ? item.unit_of_measure : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit Cost:</span>
                      <span>{item.unit_cost ? formatCurrency(item.unit_cost) : 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(item.stock_status)}`}>
                        {item.stock_status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.created_at ? formatDate(item.created_at) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                No products found
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};