import React, { useState, useEffect } from 'react';
import { ChevronRight, Play, Pause, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Column {
  key: string;
  label: string;
  render?: string;
}

interface TableProps {
  columns: Column[];
  dataEndpoint?: string;  // Deprecated - use data prop instead
  rowClick?: string;
  data?: any[];
  loading?: boolean;
  onRefresh?: () => void;
}

export const Table: React.FC<TableProps> = ({ 
  columns, 
  dataEndpoint, 
  rowClick, 
  data: propData, 
  loading: propLoading = false,
  onRefresh 
}) => {
  const [data, setData] = useState(propData || []);
  const [loading, setLoading] = useState(propLoading);
  const navigate = useNavigate();

  useEffect(() => {
    if (propData) {
      setData(propData);
      setLoading(propLoading);
    }
  }, [propData, propLoading]);

  // Deprecated dataEndpoint functionality - warn in console
  useEffect(() => {
    if (dataEndpoint) {
      console.warn('Table: dataEndpoint prop is deprecated. Pass data directly via data prop.');
      setData([]); // Clear data since we can't fetch it
      setLoading(false);
    }
  }, [dataEndpoint]);

  const handleRowClick = (row: any) => {
    if (rowClick) {
      const path = rowClick.replace(':id', row.id);
      if (path.includes('navigate')) {
        const route = path.match(/navigate\("([^"]+)"\)/)?.[1];
        if (route) {
          navigate(route);
        }
      } else {
        navigate(path);
      }
    }
  };

  const renderCell = (column: Column, row: any) => {
    if (column.render && column.key === 'actions') {
      return (
        <div className="flex gap-2">
          {row.status === 'To Do' && (
            <button className="p-2 text-black hover:bg-gray-100 rounded-md" title="Start">
              <Play size={16} />
            </button>
          )}
          {row.status === 'In-Progress' && (
            <button className="p-2 text-black hover:bg-gray-100 rounded-md" title="Pause">
              <Pause size={16} />
            </button>
          )}
          {row.status !== 'Done' && (
            <button className="p-2 text-black hover:bg-gray-100 rounded-md" title="Complete">
              <CheckCircle size={16} />
            </button>
          )}
        </div>
      );
    }
    
    const value = row[column.key];
    
    if (column.key === 'status') {
      const statusColors = {
        'Done': 'bg-green-100 text-green-800',
        'In-Progress': 'bg-blue-100 text-blue-800',
        'To Do': 'bg-gray-100 text-gray-800',
        'To Close': 'bg-orange-100 text-orange-800',
        'Draft': 'bg-gray-100 text-gray-800',
        'Confirmed': 'bg-purple-100 text-purple-800',
        'Cancelled': 'bg-red-100 text-red-800'
      };
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
          {value}
        </span>
      );
    }
    
    if (column.key === 'expectedDuration' || column.key === 'realDuration') {
      return value ? `${value} min` : '-';
    }
    
    if (column.key === 'dueDate' || column.key === 'scheduleDate') {
      return new Date(value).toLocaleDateString();
    }
    
    return value;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">Loading data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.label}
                </th>
              ))}
              {rowClick && <th className="px-6 py-3"></th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50 transition-colors ${rowClick ? 'cursor-pointer' : ''}`}
                onClick={() => handleRowClick(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderCell(column, row)}
                  </td>
                ))}
                {rowClick && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <ChevronRight size={16} className="text-gray-400" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No data available</p>
        </div>
      )}
    </div>
  );
};