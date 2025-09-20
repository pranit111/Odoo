import React, { useState } from 'react';

interface Filter {
  name: string;
  type: string;
  options?: string[];
}

interface FiltersProps {
  filters: Filter[];
  onFilterChange?: (filters: any) => void;
}

export const Filters: React.FC<FiltersProps> = ({ filters, onFilterChange }) => {
  const [filterValues, setFilterValues] = useState<any>({});

  const handleFilterChange = (name: string, value: string) => {
    const newValues = { ...filterValues, [name]: value };
    setFilterValues(newValues);
    if (onFilterChange) {
      onFilterChange(newValues);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filters.map((filter) => (
          <div key={filter.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filter.name.charAt(0).toUpperCase() + filter.name.slice(1)}
            </label>
            
            {filter.type === 'select' ? (
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterValues[filter.name] || ''}
                onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              >
                <option value="">All</option>
                {filter.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : filter.type === 'dateRange' ? (
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => handleFilterChange(`${filter.name}From`, e.target.value)}
                />
                <span className="self-center text-gray-500">to</span>
                <input
                  type="date"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => handleFilterChange(`${filter.name}To`, e.target.value)}
                />
              </div>
            ) : (
              <input
                type={filter.type}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterValues[filter.name] || ''}
                onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};