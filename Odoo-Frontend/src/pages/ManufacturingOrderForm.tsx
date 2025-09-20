import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Play, Square, Pause, Check } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { useFinishedProducts, useRawMaterials, useBOMs, useManufacturingOrders, useOperators } from '../hooks/useApiHooks';

export const ManufacturingOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { id: moId } = useParams();
  const { data: finishedProducts, loading: finishedProductsLoading } = useFinishedProducts();
  const { data: rawMaterials, loading: rawMaterialsLoading, refetch: refetchRawMaterials } = useRawMaterials();
  const { data: boms, loading: bomsLoading } = useBOMs({ is_active: true });
  const { data: operators, loading: operatorsLoading } = useOperators();
  const { createManufacturingOrder, updateManufacturingOrder } = useManufacturingOrders({ autoFetch: false });
  const [activeTab, setActiveTab] = useState<'components' | 'workOrders'>('components');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!moId);
  const [newProductData, setNewProductData] = useState({
    name: '',
    sku: '',
    unit_of_measure: 'units',
    unit_cost: '',
    current_stock: '',
    minimum_stock: ''
  });
  const [formData, setFormData] = useState({
    moNumber: 'MO-000001',
    finishedProduct: '',
    quantity: '',
    units: 'Units',
    billOfMaterials: '',
    scheduleDate: '',
    assignee: '',
    state: 'Draft'
  });

  const [components, setComponents] = useState([
    { productId: '', name: '', availability: '', toConsume: '', units: '' }
  ]);

  const [workOrders, setWorkOrders] = useState([
    { 
      wo_id: '',
      operation: 'Assembly-1', 
      workCenter: 'Work Center -1', 
      duration: '60:00', 
      realDuration: '00:00', 
      status: 'To Do',
      isPlaying: false,
      isPaused: false,
      operator: null as string | null,
      operator_name: null as string | null,
      actual_duration_minutes: 0
    }
  ]);

  const loadWorkOrders = async () => {
    if (!moId) return;
    
    try {
      const { apiClient } = await import('../services/apiClient');
      const mo = await apiClient.getManufacturingOrder(moId);
      if (mo.work_orders && mo.work_orders.length > 0) {
        const formattedWorkOrders = mo.work_orders.map(wo => ({
          wo_id: wo.wo_id,
          operation: wo.name,
          workCenter: wo.work_center_name,
          duration: `${wo.estimated_duration_minutes}:00`,
          realDuration: formatDuration(wo.actual_duration_minutes),
          status: wo.status === 'PENDING' ? 'To Do' : 
                  wo.status === 'IN_PROGRESS' ? 'Doing' : 
                  wo.status === 'COMPLETED' ? 'Done' : wo.status,
          isPlaying: wo.status === 'IN_PROGRESS',
          isPaused: wo.status === 'IN_PROGRESS' && wo.actual_start_date !== null, // Consider paused if started but not completed
          operator: wo.operator || null,
          operator_name: wo.operator_name || null,
          actual_duration_minutes: wo.actual_duration_minutes || 0
        }));
        setWorkOrders(formattedWorkOrders);
      }
    } catch (error) {
      console.error('Error loading work orders:', error);
    }
  };
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async (index: number) => {
    const workOrder = workOrders[index];
    if (!workOrder.wo_id) return;
    
    try {
      const { apiClient } = await import('../services/apiClient');
      
      if (workOrder.isPlaying) {
        // Pause the work order
        await apiClient.pauseWorkOrder(workOrder.wo_id, { notes: 'Paused from form' });
      } else {
        // Start the work order
        await apiClient.startWorkOrder(workOrder.wo_id, { 
          operator: formData.assignee || undefined,
          notes: 'Started from form' 
        });
      }
      
      // Reload work orders to get updated status
      await loadWorkOrders();
      
    } catch (error) {
      console.error('Error updating work order:', error);
      alert('Failed to update work order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handlePause = async (index: number) => {
    const workOrder = workOrders[index];
    if (!workOrder.wo_id) return;
    
    try {
      const { apiClient } = await import('../services/apiClient');
      await apiClient.pauseWorkOrder(workOrder.wo_id, { notes: 'Paused from form' });
      await loadWorkOrders();
    } catch (error) {
      console.error('Error pausing work order:', error);
      alert('Failed to pause work order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDone = async (index: number) => {
    const workOrder = workOrders[index];
    if (!workOrder.wo_id) return;
    
    try {
      const { apiClient } = await import('../services/apiClient');
      await apiClient.completeWorkOrder(workOrder.wo_id, { 
        notes: 'Completed from form',
        actual_duration: workOrder.actual_duration_minutes || undefined
      });
      await loadWorkOrders();
      
      // Check if all work orders are completed to auto-transition MO
      const updatedMO = await apiClient.getManufacturingOrder(moId!);
      const allCompleted = updatedMO.work_orders?.every(wo => wo.status === 'COMPLETED');
      
      if (allCompleted) {
        if (updatedMO.status === 'CONFIRMED') {
          // First completion - transition to IN_PROGRESS
          setFormData(prev => ({ ...prev, state: 'In-Progress' }));
        } else if (updatedMO.status === 'IN_PROGRESS') {
          // All work orders complete - complete the MO with inventory processing
          await apiClient.completeManufacturingOrder(moId!, { 
            notes: 'All work orders completed - auto-completion with inventory processing' 
          });
          setFormData(prev => ({ ...prev, state: 'Completed' }));
          alert('Manufacturing Order completed successfully! Components consumed and finished goods produced.');
        }
      }
      
    } catch (error) {
      console.error('Error completing work order:', error);
      alert('Failed to complete work order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleCompleteMO = async () => {
    if (!moId || formData.state !== 'In-Progress') {
      alert('Only in-progress manufacturing orders can be completed');
      return;
    }

    try {
      setSaving(true);
      const { apiClient } = await import('../services/apiClient');
      
      // Check if all work orders are completed
      const mo = await apiClient.getManufacturingOrder(moId);
      const pendingWorkOrders = mo.work_orders?.filter(wo => 
        wo.status !== 'COMPLETED' && wo.status !== 'CANCELED'
      );
      
      if (pendingWorkOrders && pendingWorkOrders.length > 0) {
        alert('All work orders must be completed before closing the Manufacturing Order');
        setSaving(false);
        return;
      }

      // Complete the MO with inventory processing
      await apiClient.completeManufacturingOrder(moId, { 
        notes: 'Manually completed with inventory processing' 
      });
      
      setFormData(prev => ({ ...prev, state: 'Completed' }));
      alert('Manufacturing Order completed successfully! Components consumed and finished goods produced.');
      
    } catch (error) {
      console.error('Error completing MO:', error);
      alert('Failed to complete Manufacturing Order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };


  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-populate BOM data when BOM is selected
    if (name === 'billOfMaterials' && value && formData.state === 'Draft') {
      // Small delay to ensure formData is updated
      setTimeout(() => {
        populateFromBOMWithValue(value);
      }, 100);
    }
  };

  const populateFromBOMWithValue = async (bomId: string) => {
    if (!bomId) return;

    try {
      const { apiClient } = await import('../services/apiClient');
      const bomDetails = await apiClient.getBOM(bomId);
      
      // Convert BOM components to our components format
      const bomComponents = bomDetails.components.map(comp => ({
        productId: comp.component,
        name: comp.component_name,
        availability: '0',
        toConsume: comp.quantity,
        units: comp.unit_of_measure || 'units'
      }));

      setComponents(bomComponents);
      
      // Convert BOM operations to work orders preview
      if (bomDetails.operations) {
        const quantity = parseInt(formData.quantity || '1');
        const previewWorkOrders = bomDetails.operations.map(operation => ({
          wo_id: '',
          operation: `${operation.sequence}. ${operation.name}`,
          workCenter: operation.work_center_name,
          duration: formatDuration(operation.duration_minutes * quantity),
          realDuration: '00:00',
          status: 'Preview',
          isPlaying: false,
          isPaused: false,
          operator: null as string | null,
          operator_name: null as string | null,
          actual_duration_minutes: 0
        }));
        setWorkOrders(previewWorkOrders);
      }
      
      // Update availability from raw materials
      bomComponents.forEach((component, index) => {
        const rawMaterial = rawMaterials.find(rm => rm.product_id === component.productId);
        if (rawMaterial) {
          setComponents(prev => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              availability: rawMaterial.current_stock.toString(),
              units: rawMaterial.unit_of_measure
            };
            return updated;
          });
        }
      });

    } catch (error) {
      console.error('Error auto-populating BOM:', error);
    }
  };

  const handleComponentChange = (index: number, field: string, value: string) => {
    const updatedComponents = [...components];
    updatedComponents[index] = { ...updatedComponents[index], [field]: value };
    setComponents(updatedComponents);
  };

  const handleProductSelect = (index: number, productId: string) => {
    if (productId === 'new') {
      setShowAddProductModal(true);
      return;
    }
    
    const selectedProduct = rawMaterials.find(p => p.product_id === productId);
    if (selectedProduct) {
      const updatedComponents = [...components];
      updatedComponents[index] = {
        ...updatedComponents[index],
        productId: productId,
        name: selectedProduct.name,
        availability: selectedProduct.current_stock.toString(),
        units: selectedProduct.unit_of_measure
      };
      setComponents(updatedComponents);
    }
  };

  const handleNewProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = async () => {
    try {
      // Import apiClient and create the product
      const { apiClient } = await import('../services/apiClient');
      const productData = {
        name: newProductData.name,
        sku: newProductData.sku,
        product_type: 'RAW_MATERIAL' as const,
        unit_of_measure: newProductData.unit_of_measure,
        unit_cost: newProductData.unit_cost,
        current_stock: newProductData.current_stock,
        minimum_stock: newProductData.minimum_stock,
        is_active: true
      };
      
      await apiClient.createProduct(productData);
      
      // Reset form and close modal
      setNewProductData({
        name: '',
        sku: '',
        unit_of_measure: 'units',
        unit_cost: '',
        current_stock: '',
        minimum_stock: ''
      });
      setShowAddProductModal(false);
      
      // Refresh raw materials list
      refetchRawMaterials();
      
      alert('Product created successfully!');
    } catch (error) {
      alert('Failed to create product: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const addComponent = () => {
    setComponents([...components, { productId: '', name: '', availability: '', toConsume: '', units: '' }]);
  };

  const populateFromBOM = async () => {
    if (!formData.billOfMaterials) {
      alert('Please select a Bill of Material first.');
      return;
    }

    try {
      // Import apiClient and fetch BOM details
      const { apiClient } = await import('../services/apiClient');
      const bomDetails = await apiClient.getBOM(formData.billOfMaterials);
      
      // Convert BOM components to our components format
      const bomComponents = bomDetails.components.map(comp => ({
        productId: comp.component,
        name: comp.component_name,
        availability: '0', // We'll need to lookup actual stock
        toConsume: comp.quantity,
        units: comp.unit_of_measure || 'units'
      }));

      // Update the components state
      setComponents(bomComponents);
      
      // Optionally update availability by looking up raw materials
      bomComponents.forEach((component, index) => {
        const rawMaterial = rawMaterials.find(rm => rm.product_id === component.productId);
        if (rawMaterial) {
          setComponents(prev => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              availability: rawMaterial.current_stock.toString(),
              units: rawMaterial.unit_of_measure
            };
            return updated;
          });
        }
      });

      console.log('BOM components populated:', bomComponents);
    } catch (error) {
      console.error('Error fetching BOM details:', error);
      alert('Failed to populate components from BOM: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleStateChange = (newState: string) => {
    setFormData(prev => ({ ...prev, state: newState }));
  };

  const handleConfirm = async () => {
    if (!moId) {
      // First save the MO, then confirm it
      await handleSave();
      return;
    }
    
    setSaving(true);
    try {
      const { apiClient } = await import('../services/apiClient');
      await apiClient.confirmManufacturingOrder(moId);
      setFormData(prev => ({ ...prev, state: 'Confirmed' }));
      
      // Load work orders after confirmation
      await loadWorkOrders();
      
      alert('Manufacturing Order confirmed successfully!');
    } catch (error) {
      console.error('Error confirming MO:', error);
      alert('Failed to confirm Manufacturing Order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const hasUnsavedChanges = formData.finishedProduct || formData.quantity || formData.scheduleDate || components.some(c => c.productId);
    
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmLeave) return;
    }
    
    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.finishedProduct) {
      alert('Please select a finished product');
      return;
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    if (!formData.scheduleDate) {
      alert('Please select a schedule date');
      return;
    }

    setSaving(true);
    try {
      // Map form data to API format
      const manufacturingOrderData = {
        product: formData.finishedProduct,
        quantity_to_produce: parseFloat(formData.quantity),
        priority: 'MEDIUM' as const, // Default priority
        scheduled_start_date: formData.scheduleDate,
        notes: `${isEditMode ? 'Updated' : 'Created'} via form. Components: ${components.length} items`
      } as any; // Type assertion to handle optional fields
      
      // Add optional fields if they exist
      if (formData.billOfMaterials) {
        manufacturingOrderData.bom = formData.billOfMaterials;
      }
      
      if (formData.assignee) {
        manufacturingOrderData.assignee = formData.assignee;
      }

      console.log(`${isEditMode ? 'Updating' : 'Creating'} MO with data:`, manufacturingOrderData);
      
      let result;
      if (isEditMode && moId) {
        result = await updateManufacturingOrder(moId, manufacturingOrderData);
        console.log('MO updated successfully:', result);
        alert('Manufacturing Order updated successfully!');
      } else {
        result = await createManufacturingOrder(manufacturingOrderData);
        console.log('MO created successfully:', result);
        
        // Auto-confirm the MO after creation
        if (result?.mo_id) {
          const { apiClient } = await import('../services/apiClient');
          await apiClient.confirmManufacturingOrder(result.mo_id);
          setFormData(prev => ({ ...prev, state: 'Confirmed' }));
          alert('Manufacturing Order created and confirmed successfully!');
          setIsEditMode(true);
          // Stay on the form to show work orders
          return;
        } else {
          alert('Manufacturing Order created successfully!');
          setIsEditMode(true);
        }
      }
      
      navigate('/');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} MO:`, error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} Manufacturing Order: ` + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // Load existing MO data when in edit mode
  useEffect(() => {
    const loadExistingMO = async () => {
      if (!moId) return;
      
      setLoading(true);
      try {
        const { apiClient } = await import('../services/apiClient');
        const mo = await apiClient.getManufacturingOrder(moId);
        
        // Populate form data from existing MO
        setFormData(prev => ({
          ...prev,
          moNumber: mo.mo_number,
          finishedProduct: mo.product,
          quantity: mo.quantity_to_produce.toString(),
          billOfMaterials: mo.bom || '',
          scheduleDate: mo.scheduled_start_date.split('T')[0], // Convert to date format
          assignee: mo.assignee || '',
          state: mo.status === 'DRAFT' ? 'Draft' : 'Confirmed'
        }));
        
        // Load component requirements if available
        if (mo.component_requirements && mo.component_requirements.length > 0) {
          const loadedComponents = mo.component_requirements.map(comp => ({
            productId: comp.component,
            name: comp.component_name,
            availability: comp.available_stock.toString(),
            toConsume: comp.required_quantity.toString(),
            units: 'units' // Default unit, would need to be fetched from product
          }));
          setComponents(loadedComponents);
        }
        
        // Load work orders if MO is confirmed or later
        if (mo.status !== 'DRAFT') {
          await loadWorkOrders();
        }
        
      } catch (error) {
        console.error('Error loading MO:', error);
        alert('Failed to load Manufacturing Order data');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadExistingMO();
  }, [moId, navigate]);

  return (
    <AppLayout title="Manufacturing Order">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button and Action Buttons */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            
            {/* Action Buttons for different states */}
            {formData.state === 'Confirmed' && (
              <div className="flex gap-2">
                <button 
                  onClick={handleBack}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Form Header with State Buttons */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              {/* Action Buttons based on state - moved to left */}
              {formData.state === 'Draft' ? (
                <div className="flex gap-3">
                  <button 
                    onClick={handleConfirm}
                    disabled={saving}
                    className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving & Confirming...' : 'Save & Confirm'}
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="border border-red-300 text-red-600 px-6 py-2 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  {formData.state === 'In-Progress' && (
                    <button 
                      onClick={handleCompleteMO}
                      disabled={saving}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Completing...' : 'Complete MO & Process Inventory'}
                    </button>
                  )}
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Updating...' : 'Update'}
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel Changes
                  </button>
                </div>
              )}
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleStateChange('Draft')}
                  className={`px-3 py-1 rounded text-sm border transition-colors ${
                    formData.state === 'Draft' ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700 hover:border-black'
                  }`}
                >
                  Draft
                </button>
                <button 
                  onClick={() => handleStateChange('Confirmed')}
                  className={`px-3 py-1 rounded text-sm border transition-colors ${
                    formData.state === 'Confirmed' ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700 hover:border-black'
                  }`}
                >
                  Confirmed
                </button>
                <button 
                  onClick={() => handleStateChange('In-Progress')}
                  className={`px-3 py-1 rounded text-sm border transition-colors ${
                    formData.state === 'In-Progress' ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700 hover:border-black'
                  }`}
                >
                  In-Progress
                </button>
                <button 
                  onClick={() => handleStateChange('To Close')}
                  className={`px-3 py-1 rounded text-sm border transition-colors ${
                    formData.state === 'To Close' ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700 hover:border-black'
                  }`}
                >
                  To Close
                </button>
                <button 
                  onClick={() => handleStateChange('Done')}
                  className={`px-3 py-1 rounded text-sm border transition-colors ${
                    formData.state === 'Done' ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700 hover:border-black'
                  }`}
                >
                  Done
                </button>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-bold">Manufacturing Order</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm</label>
                  <input
                    type="text"
                    value={formData.moNumber}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Finished product *</label>
                  <select
                    name="finishedProduct"
                    value={formData.finishedProduct}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                    disabled={finishedProductsLoading}
                  >
                    <option value="">Select finished product...</option>
                    {finishedProducts.map((product) => (
                      <option key={product.product_id} value={product.product_id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                  {finishedProductsLoading && (
                    <p className="text-xs text-gray-500 mt-1">Loading products...</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity*</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                    <select
                      name="units"
                      value={formData.units}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                    >
                      <option value="Units">Units</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Meters">Meters</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill of Material</label>
                  <select
                    name="billOfMaterials"
                    value={formData.billOfMaterials}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                    disabled={bomsLoading}
                  >
                    <option value="">Select Bill of Material...</option>
                    {boms.map((bom) => (
                      <option key={bom.bom_id} value={bom.bom_id}>
                        {bom.name} (v{bom.version}) - {bom.product_name}
                      </option>
                    ))}
                  </select>
                  {bomsLoading && (
                    <p className="text-xs text-gray-500 mt-1">Loading BOMs...</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Date*</label>
                  <input
                    type="date"
                    name="scheduleDate"
                    value={formData.scheduleDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  {operatorsLoading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
                      Loading operators...
                    </div>
                  ) : (
                    <select
                      name="assignee"
                      value={formData.assignee}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                    >
                      <option value="">Select an operator</option>
                      {operators && Array.isArray(operators) && operators.map((operator) => (
                        <option key={operator.id} value={operator.id}>
                          {operator.display_name || operator.username} ({operator.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Section for Components and Work Orders */}
          <div className="border border-gray-300 rounded mx-6 mb-6">
            {/* Tab Headers */}
            <div className="border-b border-gray-300">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('components')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'components'
                      ? 'border-black text-black bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 bg-gray-50'
                  }`}
                >
                  Components
                </button>
                <button
                  onClick={() => setActiveTab('workOrders')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'workOrders'
                      ? 'border-black text-black bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 bg-gray-50'
                  }`}
                >
                  Work Orders
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'components' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Components</h3>
                    {formData.billOfMaterials && (
                      <button
                        onClick={populateFromBOM}
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        Populate from Bill of Material
                      </button>
                    )}
                  </div>
                  <div className="border border-gray-300 rounded overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Components</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Availability</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">To Consume</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Units</th>
                        </tr>
                      </thead>
                      <tbody>
                        {components.map((component, index) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="p-3">
                              <select
                                value={component.productId}
                                onChange={(e) => handleProductSelect(index, e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                disabled={rawMaterialsLoading}
                              >
                                <option value="">Select raw material...</option>
                                {rawMaterials.map((material) => (
                                  <option key={material.product_id} value={material.product_id}>
                                    {material.name} ({material.sku}) - Stock: {material.current_stock}
                                  </option>
                                ))}
                                <option value="new" className="font-semibold text-blue-600">
                                  ➕ Add New Product
                                </option>
                              </select>
                              {rawMaterialsLoading && (
                                <p className="text-xs text-gray-500 mt-1">Loading materials...</p>
                              )}
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={component.availability}
                                onChange={(e) => handleComponentChange(index, 'availability', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={component.toConsume}
                                onChange={(e) => handleComponentChange(index, 'toConsume', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={component.units}
                                onChange={(e) => handleComponentChange(index, 'units', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-3 border-t border-gray-200">
                      <button
                        onClick={addComponent}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <Plus size={16} />
                        <span className="text-sm">Add a product</span>
                      </button>
                      {formData.state !== 'Draft' && (
                        <p className="text-xs text-gray-500 mt-2">
                          If no Bill Material is entered, allow user to add a line
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'workOrders' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Work Orders</h3>
                  {formData.state === 'Draft' ? (
                    workOrders.length > 0 && workOrders[0].status === 'Preview' ? (
                      <div>
                        <p className="text-sm text-blue-600 mb-3">Preview: Work orders will be created when MO is confirmed</p>
                        <div className="border border-gray-300 rounded overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left p-3 text-sm font-medium text-gray-700">Operations</th>
                                <th className="text-left p-3 text-sm font-medium text-gray-700">Work Center</th>
                                <th className="text-left p-3 text-sm font-medium text-gray-700">Est. Duration</th>
                                <th className="text-left p-3 text-sm font-medium text-gray-700">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {workOrders.map((workOrder, index) => (
                                <tr key={index} className="border-t border-gray-200">
                                  <td className="p-3 text-sm">{workOrder.operation}</td>
                                  <td className="p-3 text-sm">{workOrder.workCenter}</td>
                                  <td className="p-3 text-sm">{workOrder.duration}</td>
                                  <td className="p-3 text-sm">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                      Preview
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded p-4 bg-gray-50">
                        <p className="text-gray-600 text-sm">Work orders will be generated based on the selected Bill of Materials</p>
                        {formData.billOfMaterials && (
                          <p className="text-sm text-blue-600 mt-2">Select a BOM to see work order preview</p>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="border border-gray-300 rounded overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-3 text-sm font-medium text-gray-700">Operations</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700">Work Center</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700">Duration</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700">Real Duration</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workOrders.map((workOrder, index) => (
                            <tr key={index} className="border-t border-gray-200">
                              <td className="p-3 text-sm">{workOrder.operation}</td>
                              <td className="p-3 text-sm">{workOrder.workCenter}</td>
                              <td className="p-3 text-sm">{workOrder.duration}</td>
                              <td className="p-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <span>{workOrder.realDuration}</span>
                                  {/* Action buttons next to Real Duration */}
                                  {!workOrder.isPlaying && !workOrder.isPaused && workOrder.status !== 'Done' && (
                                    <button
                                      onClick={() => handlePlayPause(index)}
                                      className="p-1 bg-green-100 hover:bg-green-200 rounded"
                                      title="Start"
                                    >
                                      <Play size={14} className="text-green-600" />
                                    </button>
                                  )}
                                  {workOrder.isPlaying && (
                                    <>
                                      <button
                                        onClick={() => handlePlayPause(index)}
                                        className="p-1 bg-red-100 hover:bg-red-200 rounded"
                                        title="Stop"
                                      >
                                        <Square size={14} className="text-red-600" />
                                      </button>
                                      <button
                                        onClick={() => handlePause(index)}
                                        className="p-1 bg-yellow-100 hover:bg-yellow-200 rounded"
                                        title="Pause"
                                      >
                                        <Pause size={14} className="text-yellow-600" />
                                      </button>
                                      <button
                                        onClick={() => handleDone(index)}
                                        className="p-1 bg-blue-100 hover:bg-blue-200 rounded"
                                        title="Done"
                                      >
                                        <Check size={14} className="text-blue-600" />
                                      </button>
                                    </>
                                  )}
                                  {workOrder.isPaused && (
                                    <>
                                      <button
                                        onClick={() => handlePlayPause(index)}
                                        className="p-1 bg-green-100 hover:bg-green-200 rounded"
                                        title="Resume"
                                      >
                                        <Play size={14} className="text-green-600" />
                                      </button>
                                      <button
                                        onClick={() => handleDone(index)}
                                        className="p-1 bg-blue-100 hover:bg-blue-200 rounded"
                                        title="Done"
                                      >
                                        <Check size={14} className="text-blue-600" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  workOrder.status === 'Done' ? 'bg-green-100 text-green-800' :
                                  workOrder.status === 'Doing' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {workOrder.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {formData.state === 'Confirmed' && (
                        <div className="p-3 border-t border-gray-200 text-sm text-gray-600">
                          <p>Calculate to compute total duration spent on manufacturing order</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Add New Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Raw Material</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newProductData.name}
                  onChange={handleNewProductChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input
                  type="text"
                  name="sku"
                  value={newProductData.sku}
                  onChange={handleNewProductChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                  placeholder="Enter SKU"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    name="unit_cost"
                    value={newProductData.unit_cost}
                    onChange={handleNewProductChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
                  <select
                    name="unit_of_measure"
                    value={newProductData.unit_of_measure}
                    onChange={handleNewProductChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                  >
                    <option value="units">Units</option>
                    <option value="kg">Kilograms</option>
                    <option value="meters">Meters</option>
                    <option value="liters">Liters</option>
                    <option value="pieces">Pieces</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                  <input
                    type="number"
                    step="0.01"
                    name="current_stock"
                    value={newProductData.current_stock}
                    onChange={handleNewProductChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock</label>
                  <input
                    type="number"
                    step="0.01"
                    name="minimum_stock"
                    value={newProductData.minimum_stock}
                    onChange={handleNewProductChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddProductModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProduct}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                disabled={!newProductData.name || !newProductData.sku}
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};