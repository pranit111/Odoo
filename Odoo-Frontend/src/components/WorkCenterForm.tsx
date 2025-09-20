import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { WorkCenter, CreateWorkCenterData } from '../services/apiClient';

interface WorkCenterFormProps {
  initialData?: WorkCenter;
  onSubmit: (data: CreateWorkCenterData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const WorkCenterForm: React.FC<WorkCenterFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateWorkCenterData>({
    name: '',
    code: '',
    cost_per_hour: '',
    capacity_hours_per_day: '',
    description: '',
    location: '',
    is_active: true
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        code: initialData.code,
        cost_per_hour: initialData.cost_per_hour,
        capacity_hours_per_day: initialData.capacity_hours_per_day,
        description: initialData.description || '',
        location: initialData.location || '',
        is_active: initialData.is_active
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Work center name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Work center code is required';
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      newErrors.code = 'Code must contain only uppercase letters, numbers, and underscores';
    }

    if (!formData.cost_per_hour) {
      newErrors.cost_per_hour = 'Cost per hour is required';
    } else if (parseFloat(formData.cost_per_hour) <= 0) {
      newErrors.cost_per_hour = 'Cost per hour must be greater than 0';
    }

    if (!formData.capacity_hours_per_day) {
      newErrors.capacity_hours_per_day = 'Capacity hours per day is required';
    } else if (parseFloat(formData.capacity_hours_per_day) <= 0 || parseFloat(formData.capacity_hours_per_day) > 24) {
      newErrors.capacity_hours_per_day = 'Capacity must be between 0 and 24 hours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Failed to save work center' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onCancel}
          className="p-2 text-black border border-gray-300 hover:bg-gray-100 rounded-md transition-colors"
          title="Back to Work Centers"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Edit Work Center' : 'Create New Work Center'}
          </h1>
          <p className="text-gray-600">
            {initialData ? 'Update work center information' : 'Add a new work center to your manufacturing setup'}
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Work Center Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            {formData.name || (initialData ? initialData.name : 'New Work Center')}
          </h2>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Main Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Work Center Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Assembly Line 1"
                  />
                  {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Work Center Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black ${
                      errors.code ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., ASM1"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.code && <p className="text-red-600 text-xs mt-1">{errors.code}</p>}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="e.g., Factory Floor A"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="cost_per_hour" className="block text-sm font-medium text-gray-700 mb-2">
                    Cost per Hour ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="cost_per_hour"
                    name="cost_per_hour"
                    value={formData.cost_per_hour}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black ${
                      errors.cost_per_hour ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="45.50"
                  />
                  {errors.cost_per_hour && <p className="text-red-600 text-xs mt-1">{errors.cost_per_hour}</p>}
                </div>

                <div>
                  <label htmlFor="capacity_hours_per_day" className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity Hours per Day <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="capacity_hours_per_day"
                    name="capacity_hours_per_day"
                    value={formData.capacity_hours_per_day}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="24"
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black ${
                      errors.capacity_hours_per_day ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="8.00"
                  />
                  {errors.capacity_hours_per_day && <p className="text-red-600 text-xs mt-1">{errors.capacity_hours_per_day}</p>}
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active Work Center
                  </label>
                </div>
              </div>
            </div>

            {/* Description - Full Width */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Describe the work center, its capabilities, and equipment..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : initialData ? 'Update Work Center' : 'Create Work Center'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};