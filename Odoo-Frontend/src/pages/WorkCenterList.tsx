import React, { useState } from 'react';
import { Search, List, LayoutGrid, Plus } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { WorkCenterForm } from '../components/WorkCenterForm';
import { useWorkCenters } from '../hooks/useApiHooks';
import { WorkCenter, CreateWorkCenterData } from '../services/apiClient';

export const WorkCenterList: React.FC = () => {
  const { 
    data: workCenters = [], 
    loading, 
    error, 
    refetch,
    createWorkCenter,
    updateWorkCenter,
    deleteWorkCenter
  } = useWorkCenters();

  const [showForm, setShowForm] = useState(false);
  const [editingWorkCenter, setEditingWorkCenter] = useState<WorkCenter | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Filter work centers based on search term
  const filteredWorkCenters = workCenters.filter(wc =>
    wc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (wc.location && wc.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Debug logging
  console.log('WorkCenterList Debug:', { workCenters, loading, error });

  const handleCreateNew = () => {
    setEditingWorkCenter(null);
    setShowForm(true);
  };

  const handleEdit = (workCenter: WorkCenter) => {
    setEditingWorkCenter(workCenter);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: CreateWorkCenterData) => {
    setFormLoading(true);
    try {
      if (editingWorkCenter) {
        await updateWorkCenter(editingWorkCenter.work_center_id, data);
      } else {
        await createWorkCenter(data);
      }
      setShowForm(false);
      setEditingWorkCenter(null);
    } catch (error) {
      console.error('Error saving work center:', error);
      throw error; // Let the form handle the error
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingWorkCenter(null);
  };

  const handleDelete = async (workCenter: WorkCenter) => {
    if (!window.confirm(`Are you sure you want to delete "${workCenter.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(workCenter.work_center_id);
    try {
      await deleteWorkCenter(workCenter.work_center_id);
    } catch (error) {
      console.error('Error deleting work center:', error);
      alert('Failed to delete work center. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSearch = () => {
    // Search functionality is handled by state
    console.log('Search triggered for:', searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <AppLayout title="Work Centers">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-pulse">Loading work centers...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Work Centers">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800">Error loading work centers: {error}</div>
            <button 
              onClick={refetch}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (showForm) {
    return (
      <AppLayout title={editingWorkCenter ? "Edit Work Center" : "Create Work Center"}>
        <div className="max-w-4xl mx-auto">
          <WorkCenterForm
            initialData={editingWorkCenter || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={formLoading}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Work Centers">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Work Centers</h1>
            <p className="text-gray-600">Monitor work center capacity and current load</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
            Create Work Center
          </button>
        </div>

        {/* Search and View Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search work centers..."
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
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Work Center</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Code</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Location</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Capacity (hrs/day)</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Cost ($/hr)</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkCenters.length > 0 ? (
                  filteredWorkCenters.map((workCenter) => (
                    <tr key={workCenter.work_center_id} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {workCenter.name}
                          </div>
                          {workCenter.description && (
                            <div className="text-sm text-gray-500">
                              {workCenter.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        {workCenter.code}
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        {workCenter.location || 'N/A'}
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        {workCenter.capacity_hours_per_day}
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        ${parseFloat(workCenter.cost_per_hour).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          workCenter.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {workCenter.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(workCenter)}
                            className="px-3 py-1 text-black border border-gray-300 hover:bg-gray-100 rounded transition-colors text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(workCenter)}
                            disabled={deleteLoading === workCenter.work_center_id}
                            className="px-3 py-1 text-red-600 border border-red-300 hover:bg-red-50 rounded transition-colors text-sm disabled:opacity-50"
                          >
                            {deleteLoading === workCenter.work_center_id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      {searchTerm ? 'No work centers found matching your search.' : 'No work centers available.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredWorkCenters.length > 0 ? (
              filteredWorkCenters.map((workCenter) => (
                <div key={workCenter.work_center_id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{workCenter.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      workCenter.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {workCenter.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Code: {workCenter.code}</p>
                  {workCenter.location && (
                    <p className="text-xs text-gray-500 mb-2">Location: {workCenter.location}</p>
                  )}
                  <p className="text-xs text-gray-500 mb-2">Capacity: {workCenter.capacity_hours_per_day} hrs/day</p>
                  <p className="text-xs text-gray-500 mb-4">Cost: ${parseFloat(workCenter.cost_per_hour).toFixed(2)}/hr</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(workCenter)}
                      className="flex-1 px-2 py-1 text-black border border-gray-300 hover:bg-gray-100 rounded transition-colors text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(workCenter)}
                      disabled={deleteLoading === workCenter.work_center_id}
                      className="flex-1 px-2 py-1 text-red-600 border border-red-300 hover:bg-red-50 rounded transition-colors text-xs disabled:opacity-50"
                    >
                      {deleteLoading === workCenter.work_center_id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 mb-4">
                  {searchTerm ? 'No work centers found matching your search.' : 'No work centers available.'}
                </div>
                {!searchTerm && (
                  <button
                    onClick={handleCreateNew}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Create your first work center
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};