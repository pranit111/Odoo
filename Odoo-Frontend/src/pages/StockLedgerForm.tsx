import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { productsData } from '../data/products';

export const StockLedgerForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    product: '',
    unitCost: '',
    unit: 'Unit',
    totalValue: '',
    onHand: '',
    freeToUse: '',
    outgoing: '',
    incoming: ''
  });

  const unitOptions = [
    'Unit',
    'Pieces',
    'Meters',
    'Kg',
    'Liters',
    'Grams'
  ];

  // Calculate total value when on hand or unit cost changes
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBack = () => {
    navigate('/stock-ledger');
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving stock ledger entry:', formData);
    navigate('/stock-ledger');
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
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Save
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
                  {productsData.map((product) => (
                    <option key={product.id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
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
                <p className="text-xs text-gray-500 mt-1">
                </p>
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

          {/* Form Notes */}
          {/* <div className="mt-8 p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Form Notes:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Product field is a selection from existing products</li>
              <li>• Unit field provides predefined measurement options</li>
              <li>• Total Value is automatically calculated as: On Hand × Unit Cost</li>
              <li>• All quantity fields accept numeric values only</li>
            </ul>
          </div> */}
        </div>
      </div>
    </AppLayout>
  );
};