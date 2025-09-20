import React, { useState, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { 
  useProducts,
  useWorkCenters,
  useBOMs,
  useManufacturingOrders,
  useWorkOrders,
  useStockLedger,
  useManufacturingDashboard,
  useStockSummary,
  useMyTasks,
  useLowStockProducts
} from '../hooks/useApiHooks';
import { authService } from '../services/auth';

export const ApiTest: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('auth-test');
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // Test authentication endpoint directly
  const testAuthEndpoint = async () => {
    setLoading(true);
    console.log('Testing auth endpoint directly...');
    
    try {
      // Test basic connectivity to Django server
      console.log('1. Testing basic connectivity...');
      const healthResponse = await fetch('http://localhost:8000/admin/', { method: 'GET' });
      console.log('Django server health check:', healthResponse.status);
      
      // Test auth endpoint with raw fetch
      console.log('2. Testing auth endpoint with raw fetch...');
      const authResponse = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });
      
      console.log('Auth response status:', authResponse.status);
      console.log('Auth response headers:', Object.fromEntries(authResponse.headers.entries()));
      
      const authData = await authResponse.text();
      console.log('Auth response body:', authData);
      
      // Test using auth service
      console.log('3. Testing with auth service...');
      try {
        const authResult = await authService.login({
          username: 'admin',
          password: 'admin123'
        });
        console.log('Auth service result:', authResult);
        
        setTestResults({
          success: true,
          djangoServer: healthResponse.status,
          rawFetch: {
            status: authResponse.status,
            data: authData
          },
          authService: {
            success: true,
            data: authResult
          }
        });
      } catch (authServiceError) {
        console.error('Auth service error:', authServiceError);
        setTestResults({
          success: false,
          djangoServer: healthResponse.status,
          rawFetch: {
            status: authResponse.status,
            data: authData
          },
          authService: {
            success: false,
            error: authServiceError instanceof Error ? authServiceError.message : 'Unknown error'
          }
        });
      }
      
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        details: 'Make sure Django server is running on http://localhost:8000'
      });
    }
    
    setLoading(false);
  };

  // All hooks to test API endpoints - using useMemo to stabilize params objects
  const productsParams = useMemo(() => ({ autoFetch: activeSection === 'products' }), [activeSection]);
  const workCentersParams = useMemo(() => ({ autoFetch: activeSection === 'workcenters' }), [activeSection]);
  const bomsParams = useMemo(() => ({ autoFetch: activeSection === 'boms' }), [activeSection]);
  const manufacturingOrdersParams = useMemo(() => ({ autoFetch: activeSection === 'manufacturing-orders' }), [activeSection]);
  const workOrdersParams = useMemo(() => ({ autoFetch: activeSection === 'work-orders' }), [activeSection]);
  const stockLedgerParams = useMemo(() => ({ autoFetch: activeSection === 'stock-ledger' }), [activeSection]);
  
  const productsData = useProducts(productsParams);
  const workCentersData = useWorkCenters(workCentersParams);
  const bomsData = useBOMs(bomsParams);
  const manufacturingOrdersData = useManufacturingOrders(manufacturingOrdersParams);
  const workOrdersData = useWorkOrders(workOrdersParams);
  const stockLedgerData = useStockLedger(stockLedgerParams);
  const dashboardData = useManufacturingDashboard(activeSection === 'dashboard');
  const stockSummaryData = useStockSummary(activeSection === 'stock-summary');
  const myTasksData = useMyTasks(activeSection === 'my-tasks');
  const lowStockData = useLowStockProducts(activeSection === 'low-stock');

  const sections = [
    { key: 'auth-test', label: 'Auth Test', data: null },
    { key: 'products', label: 'Products', data: productsData },
    { key: 'workcenters', label: 'Work Centers', data: workCentersData },
    { key: 'boms', label: 'BOMs', data: bomsData },
    { key: 'manufacturing-orders', label: 'Manufacturing Orders', data: manufacturingOrdersData },
    { key: 'work-orders', label: 'Work Orders', data: workOrdersData },
    { key: 'stock-ledger', label: 'Stock Ledger', data: stockLedgerData },
    { key: 'dashboard', label: 'Dashboard', data: dashboardData },
    { key: 'stock-summary', label: 'Stock Summary', data: stockSummaryData },
    { key: 'my-tasks', label: 'My Tasks', data: myTasksData },
    { key: 'low-stock', label: 'Low Stock Products', data: lowStockData },
  ];

  const currentSection = sections.find(s => s.key === activeSection);
  const currentData = currentSection?.data;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-black">API Integration Test</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Test all Django endpoints</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
                <div className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.key}
                      onClick={() => setActiveSection(section.key)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        activeSection === section.key
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Display */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{currentSection?.label}</h3>
                    <div className="flex items-center gap-2">
                      {currentData?.loading && (
                        <span className="text-sm text-blue-600">Loading...</span>
                      )}
                      {currentData?.error && (
                        <span className="text-sm text-red-600">Error</span>
                      )}
                      {!currentData?.loading && !currentData?.error && (
                        <span className="text-sm text-green-600">✓ Loaded</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {currentData?.loading && (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-gray-600">Loading {currentSection?.label}...</div>
                    </div>
                  )}

                  {currentData?.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-4">
                      <h4 className="text-red-800 font-medium mb-2">Error</h4>
                      <p className="text-red-600">{currentData.error}</p>
                    </div>
                  )}

                  {!currentData?.loading && !currentData?.error && (
                    <div className="space-y-4">
                      {/* Data Summary */}
                      <div className="bg-gray-50 rounded p-4">
                        <h4 className="font-medium mb-2">Data Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Records: </span>
                            <span className="font-medium">
                              {Array.isArray(currentData?.data) 
                                ? currentData.data.length 
                                : currentData?.data 
                                ? 1 
                                : 0
                              }
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Type: </span>
                            <span className="font-medium">
                              {Array.isArray(currentData?.data) ? 'Array' : 'Object'}
                            </span>
                          </div>
                          {currentData?.pagination && (
                            <>
                              <div>
                                <span className="text-gray-600">Total: </span>
                                <span className="font-medium">{currentData.pagination.count}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Has More: </span>
                                <span className="font-medium">
                                  {currentData.pagination.next ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Raw Data */}
                      <div>
                        <h4 className="font-medium mb-2">Raw Data</h4>
                        <pre className="bg-gray-100 rounded p-4 text-xs overflow-auto max-h-96">
                          {JSON.stringify(currentData?.data, null, 2)}
                        </pre>
                      </div>

                      {/* Sample First Item (if array) */}
                      {Array.isArray(currentData?.data) && currentData.data.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Sample Record</h4>
                          <pre className="bg-blue-50 rounded p-4 text-xs overflow-auto max-h-64">
                            {JSON.stringify(currentData.data[0], null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};