import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { useProducts } from '../hooks/useApiHooks';
import { apiClient } from '../services/apiClient';


export const StockLedgerForm: React.FC = () => {
  console.log('StockLedgerForm component loaded');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch products for the dropdown
  const { data: products = [], loading: productsLoading } = useProducts({ is_active: true });
  
  const [formData, setFormData] = useState({
    product: '',
    unitCost: '',
    unit: 'Units',
    totalValue: '',
    onHand: '',
    freeToUse: '',
    outgoing: '',
    incoming: '',
    movementType: 'MANUAL_ADJUSTMENT' as 'MANUAL_ADJUSTMENT' | 'STOCK_ADJUSTMENT',
    referenceNumber: '',
    notes: ''
  });

  const unitOptions = [
    'Units',
    'Pieces', 
    'Meters',
    'Kg',
    'Liters',
    'Grams'
  ];

  const selectedProduct = products.find(p => p.product_id === formData.product);

  // Auto-calculate total value when unit cost or on hand changes
  useEffect(() => {
    const onHand = parseFloat(formData.onHand) || 0;
    const unitCost = parseFloat(formData.unitCost) || 0;
    const calculatedTotal = onHand * unitCost;
    
    if (calculatedTotal !== parseFloat(formData.totalValue)) {
      setFormData(prev => ({
        ...prev,
        totalValue: calculatedTotal.toString()
      }));
    }
  }, [formData.onHand, formData.unitCost]);

  // Auto-populate fields when product is selected
  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        unitCost: selectedProduct.unit_cost || '0',
        unit: selectedProduct.unit_of_measure || 'Units',
        onHand: selectedProduct.current_stock || '0'
      }));
    }
  }, [selectedProduct]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBack = () => {
    navigate('/stock-ledger');
  };

  const handleSave = async () => {
    if (!formData.product || !formData.onHand) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate quantity change based on current stock vs new onHand value
      const currentStock = parseFloat(selectedProduct?.current_stock || '0');
      const newOnHand = parseFloat(formData.onHand);
      const quantityChange = newOnHand - currentStock;

      // Create stock ledger entry for the stock adjustment
      await apiClient.createStockLedger({
        product: formData.product,
        quantity_change: quantityChange.toString(),
        movement_type: formData.movementType,
        reference_number: formData.referenceNumber || undefined,
        notes: formData.notes || undefined
      });
      
      console.log('Stock ledger entry created successfully');
      navigate('/stock-ledger');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save stock movement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Stock Ledger">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back and Save buttons */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  required
                >
                  <option value="">Select a product...</option>
                  {productsLoading ? (
                    <option disabled>Loading products...</option>
                  ) : (
                    products.map((product) => (
                      <option key={product.product_id} value={product.product_id}>
                        {product.name} ({product.sku})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Cost <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="unitCost"
                  value={formData.unitCost}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter unit cost"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                >
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Selection field</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Value
                </label>
                <input
                  type="number"
                  name="totalValue"
                  value={formData.totalValue}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Auto-calculated"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Readonly: On Hand × Unit Cost</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  On Hand <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="onHand"
                  value={formData.onHand}
                  onChange={handleInputChange}
                  step="1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter quantity on hand"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Free to Use
                </label>
                <input
                  type="number"
                  name="freeToUse"
                  value={formData.freeToUse}
                  onChange={handleInputChange}
                  step="1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter free to use quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outgoing
                </label>
                <input
                  type="number"
                  name="outgoing"
                  value={formData.outgoing}
                  onChange={handleInputChange}
                  step="1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter outgoing quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incoming
                </label>
                <input
                  type="number"
                  name="incoming"
                  value={formData.incoming}
                  onChange={handleInputChange}
                  step="1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter incoming quantity"
                />
              </div>
            </div>
          </div>

          {/* Additional Fields */}
          <div className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Enter reference number (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Enter any additional notes"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
};