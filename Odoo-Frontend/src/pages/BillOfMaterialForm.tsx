import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { useProducts, useWorkCenters } from '../hooks/useApiHooks';
import { apiClient } from '../services/apiClient';

interface Component {
  id: number;
  name: string;
  toConsume: number;
  units: string;
}

interface Operation {
  id: number;
  operationName: string;
  workCenter: string;
  expectedDuration: number;
}

export const BillOfMaterialForm: React.FC = () => {
  const navigate = useNavigate();
  const { data: finishedProducts, loading: finishedProductsLoading, error: finishedProductsError } = useProducts({ 
    product_type: 'FINISHED_GOOD', 
    is_active: true 
  });
  const { data: rawMaterials, loading: rawMaterialsLoading, error: rawMaterialsError } = useProducts({ 
    product_type: 'RAW_MATERIAL', 
    is_active: true 
  });  
  const { data: workCenters, loading: workCentersLoading, error: workCentersError } = useWorkCenters({ 
    is_active: true 
  });

  // Debug logging - more focused
  console.log('BOM Form - Data Status:', {
    finishedProductsCount: finishedProducts?.length || 0,
    rawMaterialsCount: rawMaterials?.length || 0,
    workCentersCount: workCenters?.length || 0,
    loading: { 
      finished: finishedProductsLoading, 
      raw: rawMaterialsLoading, 
      centers: workCentersLoading 
    }
  });

  if (finishedProductsError || rawMaterialsError || workCentersError) {
    console.error('BOM Form Errors:', {
      finishedProductsError,
      rawMaterialsError,
      workCentersError
    });
  }
  const [activeTab, setActiveTab] = useState<'components' | 'workOrders'>('components');
  const [formData, setFormData] = useState({
    bomNumber: 'BOM-000001',
    finishedProduct: '',
    quantity: '',
    units: 'Units',
    reference: ''
  });

  const [components, setComponents] = useState<Component[]>([
    { id: 1, name: '', toConsume: 0, units: 'Units' }
  ]);

  const [operations, setOperations] = useState<Operation[]>([
    { id: 1, operationName: '', workCenter: '', expectedDuration: 0 }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleComponentChange = (index: number, field: string, value: string | number) => {
    const updatedComponents = [...components];
    updatedComponents[index] = { ...updatedComponents[index], [field]: value };
    setComponents(updatedComponents);
  };

  const addComponent = () => {
    const newId = Math.max(...components.map(c => c.id)) + 1;
    setComponents([...components, { id: newId, name: '', toConsume: 0, units: 'Units' }]);
  };

  const removeComponent = (index: number) => {
    if (components.length > 1) {
      setComponents(components.filter((_, i) => i !== index));
    }
  };

  const handleOperationChange = (index: number, field: string, value: string | number) => {
    const updatedOperations = [...operations];
    updatedOperations[index] = { ...updatedOperations[index], [field]: value };
    setOperations(updatedOperations);
  };

  const addOperation = () => {
    const newId = Math.max(...operations.map(o => o.id)) + 1;
    setOperations([...operations, { id: newId, operationName: '', workCenter: '', expectedDuration: 0 }]);
  };

  const removeOperation = (index: number) => {
    if (operations.length > 1) {
      setOperations(operations.filter((_, i) => i !== index));
    }
  };

  const handleBack = () => {
    navigate('/bills-of-materials');
  };

  const handleSave = async () => {
    // Validation
    if (!formData.finishedProduct) {
      alert('Please select a finished product');
      return;
    }

    const validComponents = components.filter(c => c.name && c.toConsume > 0);
    if (validComponents.length === 0) {
      alert('Please add at least one component with quantity greater than 0');
      return;
    }

    const validOperations = operations.filter(o => o.operationName && o.workCenter && o.expectedDuration > 0);
    if (validOperations.length === 0) {
      alert('Please add at least one operation with all required fields');
      return;
    }

    try {
      // Find the selected finished product to get its name
      const selectedProduct = finishedProducts?.find(p => p.product_id === formData.finishedProduct);
      
      // Create the BOM first
      const bomData = {
        product: formData.finishedProduct,
        name: `BOM for ${selectedProduct?.name || formData.finishedProduct}`,
        version: '1.0',
        is_active: true
      };
      
      console.log('Creating BOM with data:', bomData);
      const newBOM = await apiClient.createBOM(bomData);
      console.log('BOM created successfully:', newBOM);
      
      // Add components to the BOM
      for (const component of validComponents) {
        const componentData = {
          component: component.name,
          quantity: component.toConsume.toString(),
          unit_of_measure: component.units
        };
        console.log('Adding component:', componentData);
        await apiClient.addBOMComponent(newBOM.bom_id, componentData);
      }
      
      // Add operations to the BOM
      for (const [index, operation] of validOperations.entries()) {
        const operationData = {
          name: operation.operationName,
          sequence: index + 1,
          work_center: operation.workCenter,
          duration_minutes: operation.expectedDuration * 60, // Convert hours to minutes
          description: `Operation ${index + 1}: ${operation.operationName}`
        };
        console.log('Adding operation:', operationData);
        await apiClient.addBOMOperation(newBOM.bom_id, operationData);
      }
      
      console.log('BOM saved successfully!');
      alert('Bill of Materials created successfully!');
      navigate('/bills-of-materials');
    } catch (error) {
      console.error('Error saving BOM:', error);
      alert(`Error saving BOM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <AppLayout title="Bill of Materials">
      <div className="max-w-6xl mx-auto">
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
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Loading Status Display */}
          {(finishedProductsLoading || rawMaterialsLoading || workCentersLoading) && (
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <div className="text-blue-800 text-sm">
                <strong>Loading:</strong>
                {finishedProductsLoading && <span className="ml-2">Finished Products...</span>}
                {rawMaterialsLoading && <span className="ml-2">Raw Materials...</span>}
                {workCentersLoading && <span className="ml-2">Work Centers...</span>}
              </div>
            </div>
          )}

          {/* Error Display */}
          {(finishedProductsError || rawMaterialsError || workCentersError) && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="text-red-800 text-sm">
                <strong>Loading Errors:</strong>
                {finishedProductsError && <div>• Finished Products: {finishedProductsError}</div>}
                {rawMaterialsError && <div>• Raw Materials: {rawMaterialsError}</div>}
                {workCentersError && <div>• Work Centers: {workCentersError}</div>}
              </div>
            </div>
          )}

          {/* BOM Number Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">{formData.bomNumber}</h2>
          </div>

          {/* Main Form Fields */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Finished Product <span className="text-red-500">*</span>
                    {finishedProducts && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({finishedProducts.length} available)
                      </span>
                    )}
                  </label>
                  <select
                    name="finishedProduct"
                    value={formData.finishedProduct}
                    onChange={handleInputChange}
                    disabled={finishedProductsLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {finishedProductsLoading ? 'Loading finished products...' : 'Select a finished product...'}
                    </option>
                    {finishedProducts?.map((product) => (
                      <option key={product.product_id} value={product.product_id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
                    <select
                      name="units"
                      value={formData.units}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    >
                      <option value="Units">Units</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Meters">Meters</option>
                      <option value="Kg">Kg</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    maxLength={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Tabbed Interface for Components and Work Orders */}
            <div>
              {/* Tab Headers */}
              <div className="flex border-b border-gray-300 mb-4">
                <button
                  onClick={() => setActiveTab('components')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'components'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Components
                </button>
                <button
                  onClick={() => setActiveTab('workOrders')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'workOrders'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Work Orders
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'components' && (
                <div className="border border-gray-300 rounded overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">
                          Components
                          {rawMaterials && (
                            <span className="text-xs text-gray-500 ml-2 font-normal">
                              ({rawMaterials.length} raw materials available)
                            </span>
                          )}
                        </th>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">To Consume</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Units</th>
                        <th className="w-12 p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.map((component, index) => (
                        <tr key={component.id} className="border-t border-gray-200">
                          <td className="p-3">
                            <select
                              value={component.name}
                              onChange={(e) => handleComponentChange(index, 'name', e.target.value)}
                              disabled={rawMaterialsLoading}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="">
                                {rawMaterialsLoading ? 'Loading raw materials...' : 'Add a raw material...'}
                              </option>
                              {rawMaterials?.map((material) => (
                                <option key={material.product_id} value={material.product_id}>
                                  {material.name} ({material.sku})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={component.toConsume}
                              onChange={(e) => handleComponentChange(index, 'toConsume', parseFloat(e.target.value) || 0)}
                              step="0.01"
                              min="0"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={component.units}
                              onChange={(e) => handleComponentChange(index, 'units', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
                            >
                              <option value="Units">Units</option>
                              <option value="Pieces">Pieces</option>
                              <option value="Meters">Meters</option>
                              <option value="Kg">Kg</option>
                            </select>
                          </td>
                          <td className="p-3">
                            {components.length > 1 && (
                              <button
                                onClick={() => removeComponent(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={addComponent}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Plus size={16} />
                      <span>Add a raw material</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'workOrders' && (
                <div className="border border-gray-300 rounded overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Operations</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">
                          Work Center
                          {workCenters && (
                            <span className="text-xs text-gray-500 ml-2 font-normal">
                              ({workCenters.length} available)
                            </span>
                          )}
                        </th>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Expected Duration (hours)</th>
                        <th className="w-12 p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {operations.map((operation, index) => (
                        <tr key={operation.id} className="border-t border-gray-200">
                          <td className="p-3">
                            <input
                              type="text"
                              value={operation.operationName}
                              onChange={(e) => handleOperationChange(index, 'operationName', e.target.value)}
                              placeholder="Enter operation name"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={operation.workCenter}
                              onChange={(e) => handleOperationChange(index, 'workCenter', e.target.value)}
                              disabled={workCentersLoading}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="">
                                {workCentersLoading ? 'Loading work centers...' : 'Select work center'}
                              </option>
                              {workCenters?.map((workCenter) => (
                                <option key={workCenter.work_center_id} value={workCenter.work_center_id}>
                                  {workCenter.name} ({workCenter.code})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={operation.expectedDuration}
                              onChange={(e) => handleOperationChange(index, 'expectedDuration', parseFloat(e.target.value) || 0)}
                              step="0.1"
                              min="0"
                              placeholder="Duration in hours"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
                            />
                          </td>
                          <td className="p-3">
                            {operations.length > 1 && (
                              <button
                                onClick={() => removeOperation(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={addOperation}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Plus size={16} />
                      <span>Add a line</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};