import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, List, LayoutGrid } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';

interface StockLedgerItem {
  id: number;
  product: string;
  unitCost: number;
  unit: string;
  totalValue: number;
  onHand: number;
  freeToUse: number;
  incoming: number;
  outgoing: number;
}

export const StockLedger: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [stockItems, setStockItems] = useState<StockLedgerItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StockLedgerItem[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    const data = getStockLedgerData();
    setStockItems(data);
    setFilteredItems(data);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(stockItems);
    } else {
      const filtered = stockItems.filter(item => 
        item.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, stockItems]);

  const handleSearch = () => {
    // Search functionality is handled by useEffect on searchTerm change
    console.log('Search triggered for:', searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} Rs`;
  };

  const handleNewStock = () => {
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
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Unit Cost</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Unit</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Total Value</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">On Hand</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Free to Use</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Incoming</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Outgoing</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <tr 
                        key={item.id} 
                        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="p-4 text-sm text-gray-900 font-medium">{item.product}</td>
                        <td className="p-4 text-sm text-gray-900">{formatCurrency(item.unitCost)}</td>
                        <td className="p-4 text-sm text-gray-900">{item.unit}</td>
                        <td className="p-4 text-sm text-gray-900 font-medium">{item.totalValue.toLocaleString()}</td>
                        <td className="p-4 text-sm text-gray-900">{item.onHand}</td>
                        <td className="p-4 text-sm text-gray-900">{item.freeToUse}</td>
                        <td className="p-4 text-sm text-green-600">{item.incoming}</td>
                        <td className="p-4 text-sm text-red-600">{item.outgoing}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        {searchTerm ? 'No products found matching your search.' : 'No stock data available.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md cursor-pointer transition-all hover:border-gray-300"
                >
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">{item.product}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Unit Cost:</span>
                        <p className="font-medium">{formatCurrency(item.unitCost)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Unit:</span>
                        <p className="font-medium">{item.unit}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Value:</span>
                        <p className="font-medium">{item.totalValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">On Hand:</span>
                        <p className="font-medium">{item.onHand}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Free to Use:</span>
                        <p className="font-medium">{item.freeToUse}</p>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <span className="text-gray-500 text-xs">In:</span>
                          <p className="font-medium text-green-600">{item.incoming}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Out:</span>
                          <p className="font-medium text-red-600">{item.outgoing}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <LayoutGrid size={48} className="mb-4 text-gray-300" />
                <p>{searchTerm ? 'No products found matching your search.' : 'No stock data available.'}</p>
              </div>
            )}
          </div>
        )}

        {/* Results Summary */}
        {searchTerm && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredItems.length} of {stockItems.length} products
          </div>
        )}
      </div>
    </AppLayout>
  );
};