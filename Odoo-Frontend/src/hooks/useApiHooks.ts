import { useState, useEffect, useCallback } from 'react';
import { 
  apiClient,
  Product,
  User,
  WorkCenter,
  BOM,
  ManufacturingOrder,
  WorkOrder,
  StockLedgerEntry,
  StockAdjustment,
  PaginatedResponse,
  CreateProductData,
  UpdateStockData,
  CreateWorkCenterData,
  CreateBOMData,
  CreateManufacturingOrderData,
  StartWorkOrderData,
  CompleteWorkOrderData,
  ComponentRequirement,
  ManufacturingDashboard,
  CreateStockAdjustmentData,
  CreateBOMOperationData,
  BOMOperation
} from '../services/apiClient';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiListState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination?: {
    count: number;
    next?: string;
    previous?: string;
  };
}

// Generic hook for API operations
function useApiState<T>(initialState: T | null = null): [
  UseApiState<T>,
  {
    setData: (data: T | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
  }
] {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialState,
    loading: false,
    error: null,
  });

  const setData = useCallback((data: T | null) => {
    // When data arrives, ensure loading is turned off and errors are cleared
    setState(prev => ({ ...prev, data, error: null, loading: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  return [state, { setData, setLoading, setError }];
}

// Products Hooks
export function useProducts(params?: {
  product_type?: 'RAW_MATERIAL' | 'FINISHED_GOOD';
  is_active?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  autoFetch?: boolean;
}) {
  const [state, setState] = useState<UseApiListState<Product>>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchProducts = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.getProducts(params);
      setState(prev => ({
        ...prev,
        data: response.results,
        pagination: {
          count: response.count,
          next: response.next,
          previous: response.previous,
        },
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
        loading: false,
      }));
    }
  }, [params?.product_type, params?.is_active, params?.search, params?.ordering, params?.page]);

  const createProduct = useCallback(async (data: CreateProductData): Promise<Product> => {
    const product = await apiClient.createProduct(data);
    setState(prev => ({
      ...prev,
      data: [product, ...prev.data],
    }));
    return product;
  }, []);

  const updateProduct = useCallback(async (id: string, data: Partial<CreateProductData>): Promise<Product> => {
    const updatedProduct = await apiClient.updateProduct(id, data);
    setState(prev => ({
      ...prev,
      data: prev.data.map(p => p.product_id === id ? updatedProduct : p),
    }));
    return updatedProduct;
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    await apiClient.deleteProduct(id);
    setState(prev => ({
      ...prev,
      data: prev.data.filter(p => p.product_id !== id),
    }));
  }, []);

  const updateStock = useCallback(async (id: string, data: UpdateStockData): Promise<{ message: string }> => {
    const result = await apiClient.updateStock(id, data);
    await fetchProducts(); // Refresh the list to get updated stock
    return result;
  }, [fetchProducts]);

  useEffect(() => {
    if (params?.autoFetch !== false) {
      fetchProducts();
    }
  }, [fetchProducts, params?.autoFetch]);

  return {
    ...state,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
  };
}

export function useProduct(id: string | null, autoFetch: boolean = true) {
  const [state, { setData, setLoading, setError }] = useApiState<Product>();

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const product = await apiClient.getProduct(id);
      setData(product);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch product');
    }
  }, [id, setData, setLoading, setError]);

  useEffect(() => {
    if (autoFetch && id) {
      fetchProduct();
    }
  }, [autoFetch, fetchProduct, id]);

  return {
    ...state,
    refetch: fetchProduct,
  };
}

export function useLowStockProducts(autoFetch: boolean = true) {
  const [state, setState] = useState<UseApiListState<Product>>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchLowStockProducts = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const products = await apiClient.getLowStockProducts();
      setState(prev => ({ ...prev, data: products, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch low stock products',
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchLowStockProducts();
    }
  }, [autoFetch, fetchLowStockProducts]);

  return {
    ...state,
    refetch: fetchLowStockProducts,
  };
}

export function useFinishedProducts(autoFetch: boolean = true) {
  const [state, setState] = useState<UseApiListState<Product>>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchFinishedProducts = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const products = await apiClient.getFinishedProducts();
      setState(prev => ({ ...prev, data: products, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch finished products',
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchFinishedProducts();
    }
  }, [autoFetch, fetchFinishedProducts]);

  return {
    ...state,
    refetch: fetchFinishedProducts,
  };
}

export function useRawMaterials(autoFetch: boolean = true) {
  const [state, setState] = useState<UseApiListState<Product>>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchRawMaterials = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const products = await apiClient.getRawMaterials();
      setState(prev => ({ ...prev, data: products, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch raw materials',
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchRawMaterials();
    }
  }, [autoFetch, fetchRawMaterials]);

  return {
    ...state,
    refetch: fetchRawMaterials,
  };
}

export function useOperators(autoFetch: boolean = true) {
  const [state, setState] = useState<UseApiListState<User>>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchOperators = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const operators = await apiClient.getOperators();
      setState(prev => ({ ...prev, data: operators, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch operators',
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchOperators();
    }
  }, [autoFetch, fetchOperators]);

  return {
    ...state,
    refetch: fetchOperators,
  };
}

// Work Centers Hooks
export function useWorkCenters(params?: {
  search?: string;
  ordering?: string;
  is_active?: boolean;
  autoFetch?: boolean;
}) {
  const [state, setState] = useState<UseApiListState<WorkCenter>>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchWorkCenters = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.getWorkCenters(params);
      
      // Handle both array and paginated response formats
      if (Array.isArray(response)) {
        // Direct array response
        setState(prev => ({
          ...prev,
          data: response,
          pagination: {
            count: response.length,
            next: undefined,
            previous: undefined,
          },
          loading: false,
        }));
      } else {
        // Paginated response
        setState(prev => ({
          ...prev,
          data: response.results,
          pagination: {
            count: response.count,
            next: response.next,
            previous: response.previous,
          },
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch work centers',
        loading: false,
      }));
    }
  }, [params?.search, params?.ordering, params?.is_active]);

  const createWorkCenter = useCallback(async (data: CreateWorkCenterData): Promise<WorkCenter> => {
    const workCenter = await apiClient.createWorkCenter(data);
    setState(prev => ({
      ...prev,
      data: [workCenter, ...prev.data],
    }));
    return workCenter;
  }, []);

  const updateWorkCenter = useCallback(async (id: string, data: Partial<CreateWorkCenterData>): Promise<WorkCenter> => {
    const updatedWorkCenter = await apiClient.updateWorkCenter(id, data);
    setState(prev => ({
      ...prev,
      data: prev.data.map(wc => wc.work_center_id === id ? updatedWorkCenter : wc),
    }));
    return updatedWorkCenter;
  }, []);

  const deleteWorkCenter = useCallback(async (id: string): Promise<void> => {
    await apiClient.deleteWorkCenter(id);
    setState(prev => ({
      ...prev,
      data: prev.data.filter(wc => wc.work_center_id !== id),
    }));
  }, []);

  useEffect(() => {
    if (params?.autoFetch !== false) {
      fetchWorkCenters();
    }
  }, [fetchWorkCenters, params?.autoFetch]);

  return {
    ...state,
    refetch: fetchWorkCenters,
    createWorkCenter,
    updateWorkCenter,
    deleteWorkCenter,
  };
}

export function useWorkCenter(id: string | null, autoFetch: boolean = true) {
  const [state, { setData, setLoading, setError }] = useApiState<WorkCenter>();

  const fetchWorkCenter = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const workCenter = await apiClient.getWorkCenter(id);
      setData(workCenter);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch work center');
    }
  }, [id, setData, setLoading, setError]);

  useEffect(() => {
    if (autoFetch && id) {
      fetchWorkCenter();
    }
  }, [autoFetch, fetchWorkCenter, id]);

  return {
    ...state,
    refetch: fetchWorkCenter,
  };
}

// BOMs Hooks
export function useBOMs(params?: {
  search?: string;
  ordering?: string;
  is_active?: boolean;
  product?: string;
  autoFetch?: boolean;
}) {
  const [state, setState] = useState<UseApiListState<BOM>>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchBOMs = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.getBOMs(params);
      console.log('Raw API response:', response);
      
      // Handle both paginated and direct array responses
      let bomsData: BOM[];
      if (Array.isArray(response)) {
        // Direct array response
        console.log('Handling as direct array response');
        bomsData = response;
        setState(prev => ({
          ...prev,
          data: bomsData,
          loading: false,
        }));
      } else {
        // Paginated response
        console.log('Handling as paginated response');
        bomsData = (response as PaginatedResponse<BOM>).results;
        setState(prev => ({
          ...prev,
          data: bomsData,
          pagination: {
            count: (response as PaginatedResponse<BOM>).count,
            next: (response as PaginatedResponse<BOM>).next,
            previous: (response as PaginatedResponse<BOM>).previous,
          },
          loading: false,
        }));
      }
      console.log('Setting BOMs data:', bomsData);
    } catch (error) {
      console.error('Error fetching BOMs:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch BOMs',
        loading: false,
      }));
    }
  }, [params?.search, params?.ordering, params?.is_active, params?.product]);

  const createBOM = useCallback(async (data: CreateBOMData): Promise<BOM> => {
    const bom = await apiClient.createBOM(data);
    setState(prev => ({
      ...prev,
      data: [bom, ...prev.data],
    }));
    return bom;
  }, []);

  const updateBOM = useCallback(async (id: string, data: Partial<CreateBOMData>): Promise<BOM> => {
    const updatedBOM = await apiClient.updateBOM(id, data);
    setState(prev => ({
      ...prev,
      data: prev.data.map(bom => bom.bom_id === id ? updatedBOM : bom),
    }));
    return updatedBOM;
  }, []);

  const deleteBOM = useCallback(async (id: string): Promise<void> => {
    await apiClient.deleteBOM(id);
    setState(prev => ({
      ...prev,
      data: prev.data.filter(bom => bom.bom_id !== id),
    }));
  }, []);

  useEffect(() => {
    if (params?.autoFetch !== false) {
      fetchBOMs();
    }
  }, [fetchBOMs, params?.autoFetch]);

  return {
    ...state,
    refetch: fetchBOMs,
    createBOM,
    updateBOM,
    deleteBOM,
  };
}

export function useBOM(id: string | null, autoFetch: boolean = true) {
  const [state, { setData, setLoading, setError }] = useApiState<BOM & { 
    components: any[];
    operations: BOMOperation[];
  }>();

  const fetchBOM = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const bom = await apiClient.getBOM(id);
      setData(bom);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch BOM');
    }
  }, [id, setData, setLoading, setError]);

  const addComponent = useCallback(async (data: { component: string; quantity: string }) => {
    if (!id) return;
    await apiClient.addBOMComponent(id, data);
    await fetchBOM(); // Refresh BOM data
  }, [id, fetchBOM]);

  const removeComponent = useCallback(async (componentId: string) => {
    if (!id) return;
    await apiClient.removeBOMComponent(id, componentId);
    await fetchBOM(); // Refresh BOM data
  }, [id, fetchBOM]);

  const addOperation = useCallback(async (data: CreateBOMOperationData) => {
    if (!id) return;
    await apiClient.addBOMOperation(id, data);
    await fetchBOM(); // Refresh BOM data
  }, [id, fetchBOM]);

  const removeOperation = useCallback(async (operationId: string) => {
    if (!id) return;
    await apiClient.removeBOMOperation(id, operationId);
    await fetchBOM(); // Refresh BOM data
  }, [id, fetchBOM]);

  useEffect(() => {
    if (autoFetch && id) {
      fetchBOM();
    }
  }, [autoFetch, fetchBOM, id]);

  return {
    ...state,
    refetch: fetchBOM,
    addComponent,
    removeComponent,
    addOperation,
    removeOperation,
  };
}

// Manufacturing Orders Hooks
export function useManufacturingOrders(params?: {
  search?: string;
  ordering?: string;
  status?: 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignee?: string;
  page?: number;
  autoFetch?: boolean;
}) {
  const [state, setState] = useState<UseApiListState<ManufacturingOrder>>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchManufacturingOrders = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.getManufacturingOrders(params);
      if (Array.isArray(response)) {
        // Non-paginated array response
        setState(prev => ({
          ...prev,
          data: response,
          pagination: {
            count: response.length,
            next: undefined,
            previous: undefined,
          },
          loading: false,
        }));
      } else {
        // Paginated response
        setState(prev => ({
          ...prev,
          data: response.results,
          pagination: {
            count: response.count,
            next: response.next,
            previous: response.previous,
          },
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch manufacturing orders',
        loading: false,
      }));
    }
  }, [params?.search, params?.ordering, params?.status, params?.priority, params?.assignee, params?.page]);

  const createManufacturingOrder = useCallback(async (data: CreateManufacturingOrderData): Promise<ManufacturingOrder> => {
    const mo = await apiClient.createManufacturingOrder(data);
    setState(prev => ({
      ...prev,
      data: [mo, ...prev.data],
    }));
    return mo;
  }, []);

  const updateManufacturingOrder = useCallback(async (id: string, data: Partial<CreateManufacturingOrderData>): Promise<ManufacturingOrder> => {
    const updatedMO = await apiClient.updateManufacturingOrder(id, data);
    setState(prev => ({
      ...prev,
      data: prev.data.map(mo => mo.mo_id === id ? updatedMO : mo),
    }));
    return updatedMO;
  }, []);

  const deleteManufacturingOrder = useCallback(async (id: string): Promise<void> => {
    await apiClient.deleteManufacturingOrder(id);
    setState(prev => ({
      ...prev,
      data: prev.data.filter(mo => mo.mo_id !== id),
    }));
  }, []);

  const confirmManufacturingOrder = useCallback(async (id: string, forceConfirm?: boolean): Promise<{ message: string }> => {
    const result = await apiClient.confirmManufacturingOrder(id, { force_confirm: forceConfirm });
    await fetchManufacturingOrders(); // Refresh to get updated status
    return result;
  }, [fetchManufacturingOrders]);

  const completeManufacturingOrder = useCallback(async (id: string, notes?: string): Promise<{ message: string }> => {
    const result = await apiClient.completeManufacturingOrder(id, { notes });
    await fetchManufacturingOrders(); // Refresh to get updated status
    return result;
  }, [fetchManufacturingOrders]);

  const cancelManufacturingOrder = useCallback(async (id: string, reason: string): Promise<{ message: string }> => {
    const result = await apiClient.cancelManufacturingOrder(id, { reason });
    await fetchManufacturingOrders(); // Refresh to get updated status
    return result;
  }, [fetchManufacturingOrders]);

  useEffect(() => {
    if (params?.autoFetch !== false) {
      fetchManufacturingOrders();
    }
  }, [fetchManufacturingOrders, params?.autoFetch]);

  return {
    ...state,
    refetch: fetchManufacturingOrders,
    createManufacturingOrder,
    updateManufacturingOrder,
    deleteManufacturingOrder,
    confirmManufacturingOrder,
    completeManufacturingOrder,
    cancelManufacturingOrder,
  };
}

export function useManufacturingOrder(id: string | null, autoFetch: boolean = true) {
  const [state, { setData, setLoading, setError }] = useApiState<ManufacturingOrder & {
    work_orders: WorkOrder[];
    component_requirements: ComponentRequirement[];
  }>();

  const fetchManufacturingOrder = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const mo = await apiClient.getManufacturingOrder(id);
      setData(mo);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch manufacturing order');
    }
  }, [id, setData, setLoading, setError]);

  useEffect(() => {
    if (autoFetch && id) {
      fetchManufacturingOrder();
    }
  }, [autoFetch, fetchManufacturingOrder, id]);

  return {
    ...state,
    refetch: fetchManufacturingOrder,
  };
}

export function useManufacturingDashboard(autoFetch: boolean = true) {
  const [state, { setData, setLoading, setError }] = useApiState<ManufacturingDashboard>();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const dashboard = await apiClient.getManufacturingDashboard();
      setData(dashboard);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard');
    }
  }, [setData, setLoading, setError]);

  useEffect(() => {
    if (autoFetch) {
      fetchDashboard();
    }
  }, [autoFetch, fetchDashboard]);

  return {
    ...state,
    refetch: fetchDashboard,
  };
}

// Work Orders Hooks
export function useWorkOrders(params?: {
  search?: string;
  ordering?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  manufacturing_order?: string;
  work_center?: string;
  page?: number;
  autoFetch?: boolean;
}) {
  const [state, setState] = useState<UseApiListState<WorkOrder>>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchWorkOrders = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.getWorkOrders(params);
      setState(prev => ({
        ...prev,
        data: response.results,
        pagination: {
          count: response.count,
          next: response.next,
          previous: response.previous,
        },
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch work orders',
        loading: false,
      }));
    }
  }, [params?.search, params?.ordering, params?.status, params?.manufacturing_order, params?.work_center, params?.page]);

  const startWorkOrder = useCallback(async (id: string, data: StartWorkOrderData): Promise<{ message: string }> => {
    const result = await apiClient.startWorkOrder(id, data);
    await fetchWorkOrders(); // Refresh to get updated status
    return result;
  }, [fetchWorkOrders]);

  const pauseWorkOrder = useCallback(async (id: string, notes?: string): Promise<{ message: string }> => {
    const result = await apiClient.pauseWorkOrder(id, { notes });
    await fetchWorkOrders(); // Refresh to get updated status
    return result;
  }, [fetchWorkOrders]);

  const resumeWorkOrder = useCallback(async (id: string, notes?: string): Promise<{ message: string }> => {
    const result = await apiClient.resumeWorkOrder(id, { notes });
    await fetchWorkOrders(); // Refresh to get updated status
    return result;
  }, [fetchWorkOrders]);

  const completeWorkOrder = useCallback(async (id: string, data: CompleteWorkOrderData): Promise<{ message: string }> => {
    const result = await apiClient.completeWorkOrder(id, data);
    await fetchWorkOrders(); // Refresh to get updated status
    return result;
  }, [fetchWorkOrders]);

  useEffect(() => {
    if (params?.autoFetch !== false) {
      fetchWorkOrders();
    }
  }, [fetchWorkOrders, params?.autoFetch]);

  return {
    ...state,
    refetch: fetchWorkOrders,
    startWorkOrder,
    pauseWorkOrder,
    resumeWorkOrder,
    completeWorkOrder,
  };
}

export function useMyTasks(autoFetch: boolean = true) {
  const [state, { setData, setLoading, setError }] = useApiState<{
    assigned_work_orders: WorkOrder[];
    total_assigned: number;
    in_progress: number;
    pending: number;
  }>();

  const fetchMyTasks = useCallback(async () => {
    setLoading(true);
    try {
      const tasks = await apiClient.getMyTasks();
      setData(tasks);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch my tasks');
    }
  }, [setData, setLoading, setError]);

  useEffect(() => {
    if (autoFetch) {
      fetchMyTasks();
    }
  }, [autoFetch, fetchMyTasks]);

  return {
    ...state,
    refetch: fetchMyTasks,
  };
}

// Stock Ledger Hooks
export function useStockLedger(params?: {
  search?: string;
  ordering?: string;
  product?: string;
  movement_type?: 'MO_CONSUMPTION' | 'MO_PRODUCTION' | 'MANUAL_ADJUSTMENT' | 'STOCK_ADJUSTMENT';
  manufacturing_order?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  autoFetch?: boolean;
}) {
  const [state, setState] = useState<UseApiListState<StockLedgerEntry>>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchStockLedger = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.getStockLedger(params);
      setState(prev => ({
        ...prev,
        data: response.results,
        pagination: {
          count: response.count,
          next: response.next,
          previous: response.previous,
        },
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch stock ledger',
        loading: false,
      }));
    }
  }, [params?.search, params?.ordering, params?.product, params?.movement_type, params?.manufacturing_order, params?.date_from, params?.date_to, params?.page]);

  useEffect(() => {
    if (params?.autoFetch !== false) {
      fetchStockLedger();
    }
  }, [fetchStockLedger, params?.autoFetch]);

  return {
    ...state,
    refetch: fetchStockLedger,
  };
}

// Stock Adjustments Hooks
export function useStockAdjustments(params?: {
  search?: string;
  ordering?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  adjustment_type?: 'COUNT' | 'CORRECTION' | 'DAMAGE' | 'OTHER';
  page?: number;
  autoFetch?: boolean;
}) {
  const [state, setState] = useState<UseApiListState<StockAdjustment>>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchStockAdjustments = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.getStockAdjustments(params);
      setState(prev => ({
        ...prev,
        data: response.results,
        pagination: {
          count: response.count,
          next: response.next,
          previous: response.previous,
        },
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch stock adjustments',
        loading: false,
      }));
    }
  }, [params]);

  const createStockAdjustment = useCallback(async (data: CreateStockAdjustmentData): Promise<StockAdjustment> => {
    const adjustment = await apiClient.createStockAdjustment(data);
    setState(prev => ({
      ...prev,
      data: [adjustment, ...prev.data],
    }));
    return adjustment;
  }, []);

  const approveStockAdjustment = useCallback(async (id: string, notes?: string): Promise<{ message: string }> => {
    const result = await apiClient.approveStockAdjustment(id, { notes });
    await fetchStockAdjustments(); // Refresh to get updated status
    return result;
  }, [fetchStockAdjustments]);

  useEffect(() => {
    if (params?.autoFetch !== false) {
      fetchStockAdjustments();
    }
  }, [fetchStockAdjustments, params?.autoFetch]);

  return {
    ...state,
    refetch: fetchStockAdjustments,
    createStockAdjustment,
    approveStockAdjustment,
  };
}

// Reports Hooks
export function useStockSummary(autoFetch: boolean = true) {
  const [state, { setData, setLoading, setError }] = useApiState<{
    summary: {
      total_products: number;
      in_stock: number;
      out_of_stock: number;
      low_stock: number;
    };
    recent_movements: StockLedgerEntry[];
  }>();

  const fetchStockSummary = useCallback(async () => {
    setLoading(true);
    try {
      const summary = await apiClient.getStockSummary();
      setData(summary);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch stock summary');
    }
  }, [setData, setLoading, setError]);

  useEffect(() => {
    if (autoFetch) {
      fetchStockSummary();
    }
  }, [autoFetch, fetchStockSummary]);

  return {
    ...state,
    refetch: fetchStockSummary,
  };
}