import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Play, Square, Pause, Check } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';

export const ManufacturingOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'components' | 'workOrders'>('components');
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
    { name: '', availability: '', toConsume: '', units: '' }
  ]);

  const [workOrders, setWorkOrders] = useState([
    { 
      operation: 'Assembly-1', 
      workCenter: 'Work Center -1', 
      duration: '60:00', 
      realDuration: '00:00', 
      status: 'To Do',
      isPlaying: false,
      isPaused: false
    }
  ]);

  const handlePlayPause = (index: number) => {
    setWorkOrders(prev => prev.map((order, i) => 
      i === index 
        ? { ...order, isPlaying: !order.isPlaying, isPaused: false, status: order.isPlaying ? 'To Do' : 'Doing' }
        : order
    ));
  };

  const handlePause = (index: number) => {
    setWorkOrders(prev => prev.map((order, i) => 
      i === index 
        ? { ...order, isPlaying: false, isPaused: true }
        : order
    ));
  };

  const handleDone = (index: number) => {
    setWorkOrders(prev => prev.map((order, i) => 
      i === index 
        ? { ...order, isPlaying: false, isPaused: false, status: 'Done' }
        : order
    ));
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleComponentChange = (index: number, field: string, value: string) => {
    const updatedComponents = [...components];
    updatedComponents[index] = { ...updatedComponents[index], [field]: value };
    setComponents(updatedComponents);
  };

  const addComponent = () => {
    setComponents([...components, { name: '', availability: '', toConsume: '', units: '' }]);
  };

  const populateFromBOM = () => {
    // Simulate populating from Bill of Materials
    setComponents([
      { name: 'Wood Panel', availability: '50', toConsume: '2', units: 'Pieces' },
      { name: 'Screws', availability: '100', toConsume: '8', units: 'Units' },
      { name: 'Hinges', availability: '20', toConsume: '2', units: 'Units' }
    ]);
  };

  const handleStateChange = (newState: string) => {
    setFormData(prev => ({ ...prev, state: newState }));
  };

  const handleConfirm = () => {
    setFormData(prev => ({ ...prev, state: 'Confirmed' }));
  };

  const handleBack = () => {
    navigate('/');
  };

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
                <div className="flex gap-2">
                  <button 
                    onClick={handleConfirm}
                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={handleBack}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                </div>
              ) : (
                <div></div>
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
                  <input
                    type="text"
                    name="finishedProduct"
                    value={formData.finishedProduct}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                    placeholder="Select finished product..."
                  />
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
                  <input
                    type="text"
                    name="billOfMaterials"
                    value={formData.billOfMaterials}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                  />
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
                  <input
                    type="text"
                    name="assignee"
                    value={formData.assignee}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                  />
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
                              <input
                                type="text"
                                value={component.name}
                                onChange={(e) => handleComponentChange(index, 'name', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Add a product"
                              />
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
                    <div className="border border-gray-300 rounded p-4 bg-gray-50">
                      <p className="text-gray-600 text-sm">Work orders will be generated based on the selected Bill of Materials</p>
                    </div>
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
    </AppLayout>
  );
};