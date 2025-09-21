import { AuthService } from './auth';

// User interface for API responses
export interface User {
  id: number;
  username: string;
  email: string;
  display_name?: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
  is_verified: boolean;
}

// Types for API responses
export interface Product {
  product_id: string;
  name: string;
  sku: string;
  product_type: 'RAW_MATERIAL' | 'FINISHED_GOOD';
  current_stock: string;
  minimum_stock?: string;
  unit_of_measure: string;
  unit_cost?: string;
  description?: string;
  stock_status: 'In Stock' | 'Out of Stock' | 'Low Stock';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WorkCenter {
  work_center_id: string;
  name: string;
  code: string;
  cost_per_hour: string;
  capacity_hours_per_day: string;
  is_active: boolean;
  description?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BOM {
  bom_id: string;
  product: string;
  product_name: string;
  name: string;
  version: string;
  is_active: boolean;
  component_count?: number;
  operation_count?: number;
  total_bom_cost?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BOMComponent {
  component_id: string;
  component: string;
  component_name: string;
  component_sku: string;
  quantity: string;
  unit_of_measure: string;
  total_cost: string;
}

export interface BOMOperation {
  operation_id: string;
  name: string;
  sequence: number;
  work_center: string;
  work_center_name: string;
  duration_minutes: number;
  setup_time_minutes?: number;
  operation_cost: string;
  description?: string;
}

export interface ManufacturingOrder {
  mo_id: string;
  mo_number: string;
  product: string;
  product_name: string;
  product_sku?: string;
  bom: string;
  bom_name: string;
  quantity_to_produce: number;
  status: 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  scheduled_start_date: string;
  scheduled_end_date?: string;
  actual_start_date?: string;
  completion_date?: string;
  assignee?: string;
  assignee_name?: string;
  quantity_produced?: number;
  notes?: string;
  progress_percentage: number;
  work_orders?: WorkOrder[];
  component_requirements?: MOComponentRequirement[];
  component_availability_check?: boolean;
  can_start?: boolean;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface MOComponentRequirement {
  requirement_id: string;
  component: string;
  component_name: string;
  component_sku: string;
  quantity_per_unit: number;
  required_quantity: number;
  consumed_quantity: number;
  available_stock: number;
  is_satisfied: boolean;
  remaining_quantity: number;
  shortage: number;
  created_at: string;
  updated_at: string;
}

export interface WorkOrder {
  wo_id: string;
  wo_number: string;
  name: string;
  work_center: string;
  work_center_name: string;
  sequence: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  operator?: string | null;
  estimated_duration_minutes: number;
  actual_duration_minutes: number;
  actual_start_date?: string | null;
  completion_date?: string | null;
  scheduled_start_date?: string | null;
  efficiency_percentage: number;
  notes?: string;
  quality_notes?: string;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
  // Computed field for frontend compatibility
  manufacturing_order_number?: string;
}

export interface StockLedgerEntry {
  ledger_id: string;
  product: string;
  product_name: string;
  product_sku: string;
  quantity_change: string;
  stock_before: string;
  stock_after: string;
  movement_type: 'MO_CONSUMPTION' | 'MO_PRODUCTION' | 'MANUAL_ADJUSTMENT' | 'STOCK_ADJUSTMENT';
  reference_number?: string;
  manufacturing_order?: string;
  mo_number?: string;
  created_by: string;
  created_by_name: string;
  transaction_time: string;
  notes?: string;
}

export interface StockAdjustment {
  adjustment_id: string;
  product: string;
  product_name: string;
  expected_quantity: string;
  actual_quantity: string;
  difference: string;
  adjustment_type: 'COUNT' | 'CORRECTION' | 'DAMAGE' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

export interface ComponentRequirement {
  component: string;
  component_name: string;
  component_sku: string;
  required_quantity: number;
  available_stock: number;
  shortage: number;
  is_sufficient: boolean;
}

export interface ManufacturingDashboard {
  statistics: {
    total_mos: number;
    draft: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    canceled: number;
  };
  recent_orders: ManufacturingOrder[];
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface CreateProductData {
  name: string;
  sku: string;
  product_type: 'RAW_MATERIAL' | 'FINISHED_GOOD';
  current_stock: string;
  minimum_stock?: string;
  unit_of_measure: string;
  unit_cost?: string;
  description?: string;
}

export interface UpdateStockData {
  quantity_change: string;
  notes?: string;
}

export interface CreateWorkCenterData {
  name: string;
  code: string;
  cost_per_hour: string;
  capacity_hours_per_day: string;
  description?: string;
  location?: string;
  is_active?: boolean;
}

export interface CreateBOMData {
  product: string;
  name: string;
  version: string;
  is_active?: boolean;
}

export interface CreateManufacturingOrderData {
  product: string;
  bom: string;
  quantity_to_produce: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  scheduled_start_date?: string;
  assignee?: string;
  notes?: string;
}

export interface StartWorkOrderData {
  operator?: string;
  notes?: string;
}

export interface CompleteWorkOrderData {
  notes?: string;
  actual_duration?: number;
}

export interface CreateBOMOperationData {
  bom: string;
  name: string;
  sequence: number;
  work_center: string;
  duration_minutes: number;
  setup_time_minutes?: number;
  description?: string;
}

export interface CreateBOMComponentData {
  component: string;
  quantity: string;
  unit_of_measure?: string;
  notes?: string;
}

export interface CreateMOComponentData {
  component: string;
  quantity_per_unit: number;
  required_quantity: number;
}

export interface UpdateMOComponentData {
  quantity_per_unit?: number;
  required_quantity?: number;
  consumed_quantity?: number;
}

export interface CreateStockLedgerData {
  product: string;
  quantity_change: string;
  movement_type: 'MANUAL_ADJUSTMENT' | 'STOCK_ADJUSTMENT';
  reference_number?: string;
  notes?: string;
}

export interface CreateStockAdjustmentData {
  product: string;
  expected_quantity: string;
  actual_quantity: string;
  adjustment_type: 'COUNT' | 'CORRECTION' | 'DAMAGE' | 'OTHER';
  reason: string;
}

export class ApiClient {
  private baseURL = 'http://127.0.0.1:8000/api';
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('access_token');
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token refresh
    if (response.status === 401 && token) {
      const refreshed = await this.authService.refreshAccessToken();
      if (refreshed) {
        const newToken = localStorage.getItem('access_token');
        headers['Authorization'] = `Bearer ${newToken}`;
        return fetch(url, { ...options, headers });
      }
    }

    return response;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Products API
  async getProducts(params?: {
    product_type?: 'RAW_MATERIAL' | 'FINISHED_GOOD';
    is_active?: boolean;
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const query = queryParams.toString();
    const response = await this.makeRequest(`/products/${query ? `?${query}` : ''}`);
    
    // Debug logging for products API
    console.log('=== PRODUCTS API DEBUG ===');
    console.log('API URL:', `/products/${query ? `?${query}` : ''}`);
    console.log('Query params:', params);
    
    const rawData = await this.handleResponse<Product[]>(response);
    
    // Transform the direct array to paginated response format
    const result: PaginatedResponse<Product> = {
      count: rawData.length,
      results: rawData,
      next: undefined,
      previous: undefined
    };
    
    console.log('Raw products data:', rawData);
    console.log('Transformed products result:', result);
    console.log('Products count:', result.results.length);
    if (result.results && result.results.length > 0) {
      console.log('First product:', result.results[0]);
    }
    console.log('=== END PRODUCTS API DEBUG ===');
    
    return result;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.makeRequest(`/products/${id}/`);
    return this.handleResponse<Product>(response);
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    const response = await this.makeRequest('/products/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<Product>(response);
  }

  async updateProduct(id: string, data: Partial<CreateProductData>): Promise<Product> {
    const response = await this.makeRequest(`/products/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.handleResponse<Product>(response);
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await this.makeRequest(`/products/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
  }

  async updateStock(id: string, data: UpdateStockData): Promise<{ message: string }> {
    const response = await this.makeRequest(`/products/${id}/update_stock/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async getLowStockProducts(): Promise<Product[]> {
    const response = await this.makeRequest('/products/low_stock/');
    return this.handleResponse<Product[]>(response);
  }

  async getOutOfStockProducts(): Promise<Product[]> {
    const response = await this.makeRequest('/products/out_of_stock/');
    return this.handleResponse<Product[]>(response);
  }

  async getFinishedProducts(): Promise<Product[]> {
    const response = await this.makeRequest('/products/finished_products/');
    return this.handleResponse<Product[]>(response);
  }

  async getRawMaterials(): Promise<Product[]> {
    const response = await this.makeRequest('/products/raw_materials/');
    return this.handleResponse<Product[]>(response);
  }

  async getProductStockMovements(id: string): Promise<StockLedgerEntry[]> {
    const response = await this.makeRequest(`/products/${id}/stock_movements/`);
    return this.handleResponse<StockLedgerEntry[]>(response);
  }

  // Work Centers API
  async getWorkCenters(params?: {
    search?: string;
    ordering?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<WorkCenter> | WorkCenter[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await this.makeRequest(`/workcenters/?${queryParams.toString()}`);
    return this.handleResponse<PaginatedResponse<WorkCenter> | WorkCenter[]>(response);
  }

  async getWorkCenter(id: string): Promise<WorkCenter> {
    const response = await this.makeRequest(`/workcenters/${id}/`);
    return this.handleResponse<WorkCenter>(response);
  }

  async createWorkCenter(data: CreateWorkCenterData): Promise<WorkCenter> {
    const response = await this.makeRequest('/workcenters/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<WorkCenter>(response);
  }

  async updateWorkCenter(id: string, data: Partial<CreateWorkCenterData>): Promise<WorkCenter> {
    const response = await this.makeRequest(`/workcenters/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.handleResponse<WorkCenter>(response);
  }

  async deleteWorkCenter(id: string): Promise<void> {
    const response = await this.makeRequest(`/workcenters/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete work center');
    }
  }

  async getWorkCenterUtilization(id: string): Promise<any> {
    const response = await this.makeRequest(`/workcenters/${id}/utilization/`);
    return this.handleResponse<any>(response);
  }

  // BOMs API
  async getBOMs(params?: {
    search?: string;
    ordering?: string;
    is_active?: boolean;
    product?: string;
  }): Promise<PaginatedResponse<BOM> | BOM[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await this.makeRequest(`/boms/?${queryParams.toString()}`);
    const data = this.handleResponse<PaginatedResponse<BOM> | BOM[]>(response);
    
    // Return the data as-is, let the hook handle both formats
    return data;
  }

  async getActiveBOMs(): Promise<BOM[]> {
    const response = await this.makeRequest('/boms/active/');
    return this.handleResponse<BOM[]>(response);
  }

  async getBOM(id: string): Promise<BOM & { components: BOMComponent[]; operations: BOMOperation[] }> {
    const response = await this.makeRequest(`/boms/${id}/`);
    return this.handleResponse<BOM & { components: BOMComponent[]; operations: BOMOperation[] }>(response);
  }

  async createBOM(data: CreateBOMData): Promise<BOM> {
    const response = await this.makeRequest('/boms/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<BOM>(response);
  }

  async updateBOM(id: string, data: Partial<CreateBOMData>): Promise<BOM> {
    const response = await this.makeRequest(`/boms/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.handleResponse<BOM>(response);
  }

  async deleteBOM(id: string): Promise<void> {
    const response = await this.makeRequest(`/boms/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete BOM');
    }
  }

  async addBOMComponent(id: string, data: {
    component: string;
    quantity: string;
    unit_of_measure?: string;
    notes?: string;
  }): Promise<BOMComponent> {
    const response = await this.makeRequest(`/boms/${id}/add_component/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<BOMComponent>(response);
  }

  async removeBOMComponent(id: string, componentId: string): Promise<{ message: string }> {
    const response = await this.makeRequest(`/boms/${id}/remove_component/`, {
      method: 'DELETE',
      body: JSON.stringify({ component_id: componentId }),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async addBOMOperation(id: string, data: {
    name: string;
    sequence: number;
    work_center: string;
    duration_minutes: number;
    setup_time_minutes?: number;
    description?: string;
  }): Promise<BOMOperation> {
    const response = await this.makeRequest(`/boms/${id}/add_operation/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<BOMOperation>(response);
  }

  async removeBOMOperation(id: string, operationId: string): Promise<{ message: string }> {
    const response = await this.makeRequest(`/boms/${id}/remove_operation/`, {
      method: 'DELETE',
      body: JSON.stringify({ operation_id: operationId }),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async cloneBOM(id: string, data: { 
    version?: string;
    name?: string;
    deactivate_original?: boolean;
  }): Promise<BOM> {
    const response = await this.makeRequest(`/boms/${id}/clone/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<BOM>(response);
  }

  // Manufacturing Orders API
  async getManufacturingOrders(params?: {
    search?: string;
    ordering?: string;
    status?: 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assignee?: string;
    page?: number;
  }): Promise<PaginatedResponse<ManufacturingOrder>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await this.makeRequest(`/manufacturing-orders/?${queryParams.toString()}`);
    return this.handleResponse<PaginatedResponse<ManufacturingOrder>>(response);
  }

  async getManufacturingOrder(id: string): Promise<ManufacturingOrder> {
    const response = await this.makeRequest(`/manufacturing-orders/${id}/`);
    return this.handleResponse<ManufacturingOrder>(response);
  }

  async createManufacturingOrder(data: CreateManufacturingOrderData): Promise<ManufacturingOrder> {
    const response = await this.makeRequest('/manufacturing-orders/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<ManufacturingOrder>(response);
  }

  async updateManufacturingOrder(id: string, data: Partial<CreateManufacturingOrderData>): Promise<ManufacturingOrder> {
    const response = await this.makeRequest(`/manufacturing-orders/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.handleResponse<ManufacturingOrder>(response);
  }

  async deleteManufacturingOrder(id: string): Promise<void> {
    const response = await this.makeRequest(`/manufacturing-orders/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete manufacturing order');
    }
  }

  async confirmManufacturingOrder(id: string, data?: { force_confirm?: boolean }): Promise<{ message: string }> {
    const response = await this.makeRequest(`/manufacturing-orders/${id}/confirm/`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async completeManufacturingOrder(id: string, data?: { notes?: string }): Promise<{ message: string }> {
    const response = await this.makeRequest(`/manufacturing-orders/${id}/complete/`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async cancelManufacturingOrder(id: string, data: { reason: string }): Promise<{ message: string }> {
    const response = await this.makeRequest(`/manufacturing-orders/${id}/cancel/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async getComponentRequirements(id: string): Promise<MOComponentRequirement[]> {
    const response = await this.makeRequest(`/manufacturing-orders/${id}/component_requirements/`);
    return this.handleResponse<MOComponentRequirement[]>(response);
  }

  async addMOComponent(moId: string, data: CreateMOComponentData): Promise<MOComponentRequirement> {
    const response = await this.makeRequest(`/manufacturing-orders/${moId}/add_component/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<MOComponentRequirement>(response);
  }

  async updateMOComponent(moId: string, componentId: string, data: UpdateMOComponentData): Promise<MOComponentRequirement> {
    const response = await this.makeRequest(`/manufacturing-orders/${moId}/update_component/?component_id=${componentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.handleResponse<MOComponentRequirement>(response);
  }

  async removeMOComponent(moId: string, componentId: string): Promise<{ message: string }> {
    const response = await this.makeRequest(`/manufacturing-orders/${moId}/remove_component/?component_id=${componentId}`, {
      method: 'DELETE',
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async getManufacturingDashboard(): Promise<ManufacturingDashboard> {
    const response = await this.makeRequest('/manufacturing-orders/dashboard/');
    return this.handleResponse<ManufacturingDashboard>(response);
  }

  // Work Orders API
  async getWorkOrders(params?: {
    search?: string;
    ordering?: string;
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
    manufacturing_order?: string;
    work_center?: string;
    page?: number;
  }): Promise<PaginatedResponse<WorkOrder>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await this.makeRequest(`/work-orders/?${queryParams.toString()}`);
    
    // Debug logging for raw response
    console.log('=== API CLIENT DEBUG - RAW RESPONSE ===');
    console.log('API URL:', `/work-orders/?${queryParams.toString()}`);
    console.log('Raw response status:', response.status);
    
    const rawData = await this.handleResponse<WorkOrder[]>(response);
    
    // Transform the direct array to paginated response format
    // Also add missing manufacturing_order_number field
    const transformedData = rawData.map(wo => ({
      ...wo,
      manufacturing_order_number: wo.wo_number.includes('-') 
        ? wo.wo_number.split('-')[0] // Extract MO number from wo_number like "MO2025090015-01"
        : wo.wo_number // Fallback to wo_number if no dash found
    }));
    
    const result: PaginatedResponse<WorkOrder> = {
      count: transformedData.length,
      results: transformedData,
      next: undefined,
      previous: undefined
    };
    
    // Debug logging for parsed result
    console.log('=== API CLIENT DEBUG - PARSED RESULT ===');
    console.log('Raw data from API:', rawData);
    console.log('Transformed result:', result);
    console.log('Result.results length:', result.results.length);
    if (result.results && result.results.length > 0) {
      console.log('First item in results:', result.results[0]);
      console.log('First item keys:', Object.keys(result.results[0]));
    }
    console.log('=== END API CLIENT DEBUG ===');
    
    return result;
  }

  async getWorkOrder(id: string): Promise<WorkOrder> {
    const response = await this.makeRequest(`/work-orders/${id}/`);
    return this.handleResponse<WorkOrder>(response);
  }

  async startWorkOrder(id: string, data: StartWorkOrderData): Promise<{ message: string }> {
    const response = await this.makeRequest(`/work-orders/${id}/start/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async pauseWorkOrder(id: string, data?: { notes?: string }): Promise<{ message: string }> {
    const response = await this.makeRequest(`/work-orders/${id}/pause/`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async resumeWorkOrder(id: string, data?: { notes?: string }): Promise<{ message: string }> {
    const response = await this.makeRequest(`/work-orders/${id}/resume/`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async completeWorkOrder(id: string, data: CompleteWorkOrderData): Promise<{ message: string }> {
    const response = await this.makeRequest(`/work-orders/${id}/complete/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async getMyTasks(): Promise<{
    assigned_work_orders: WorkOrder[];
    total_assigned: number;
    in_progress: number;
    pending: number;
  }> {
    const response = await this.makeRequest('/work-orders/my_tasks/');
    return this.handleResponse<{
      assigned_work_orders: WorkOrder[];
      total_assigned: number;
      in_progress: number;
      pending: number;
    }>(response);
  }

  async getPendingWorkOrders(): Promise<WorkOrder[]> {
    const response = await this.makeRequest('/work-orders/pending/');
    return this.handleResponse<WorkOrder[]>(response);
  }

  async getActiveWorkOrders(): Promise<WorkOrder[]> {
    const response = await this.makeRequest('/work-orders/active/');
    return this.handleResponse<WorkOrder[]>(response);
  }

  async getOverdueWorkOrders(): Promise<WorkOrder[]> {
    const response = await this.makeRequest('/work-orders/overdue/');
    return this.handleResponse<WorkOrder[]>(response);
  }

  // Stock Ledger API
  async getStockLedger(params?: {
    search?: string;
    ordering?: string;
    product?: string;
    movement_type?: 'MO_CONSUMPTION' | 'MO_PRODUCTION' | 'MANUAL_ADJUSTMENT' | 'STOCK_ADJUSTMENT';
    manufacturing_order?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
  }): Promise<PaginatedResponse<StockLedgerEntry>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await this.makeRequest(`/stock-ledger/?${queryParams.toString()}`);
    const data = await this.handleResponse<StockLedgerEntry[] | PaginatedResponse<StockLedgerEntry>>(response);
    
    // Handle direct array response vs paginated response
    if (Array.isArray(data)) {
      console.log('Stock ledger API returned direct array, transforming to paginated format');
      return {
        count: data.length,
        next: undefined,
        previous: undefined,
        results: data
      };
    }
    
    return data as PaginatedResponse<StockLedgerEntry>;
  }

  async getStockLedgerSummary(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await this.makeRequest(`/stock-ledger/summary/?${queryParams.toString()}`);
    return this.handleResponse<any>(response);
  }

  async getProductStockLedger(productId: string): Promise<StockLedgerEntry[]> {
    const response = await this.makeRequest(`/stock-ledger/by_product/?product_id=${productId}`);
    return this.handleResponse<StockLedgerEntry[]>(response);
  }

  async createStockLedger(data: CreateStockLedgerData): Promise<StockLedgerEntry> {
    const response = await this.makeRequest('/stock-ledger/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<StockLedgerEntry>(response);
  }

  // Stock Adjustments API
  async getStockAdjustments(params?: {
    search?: string;
    ordering?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    adjustment_type?: 'COUNT' | 'CORRECTION' | 'DAMAGE' | 'OTHER';
    page?: number;
  }): Promise<PaginatedResponse<StockAdjustment>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await this.makeRequest(`/stock-adjustments/?${queryParams.toString()}`);
    return this.handleResponse<PaginatedResponse<StockAdjustment>>(response);
  }

  async createStockAdjustment(data: CreateStockAdjustmentData): Promise<StockAdjustment> {
    const response = await this.makeRequest('/stock-adjustments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<StockAdjustment>(response);
  }

  async approveStockAdjustment(id: string, data?: { notes?: string }): Promise<{ message: string }> {
    const response = await this.makeRequest(`/stock-adjustments/${id}/approve/`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async getPendingStockAdjustments(): Promise<StockAdjustment[]> {
    const response = await this.makeRequest('/stock-adjustments/pending/');
    return this.handleResponse<StockAdjustment[]>(response);
  }

  // BOM Operations API
  async getBOMOperations(params?: {
    search?: string;
    ordering?: string;
    bom?: string;
    work_center?: string;
    page?: number;
  }): Promise<PaginatedResponse<BOMOperation>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await this.makeRequest(`/bom-operations/?${queryParams.toString()}`);
    return this.handleResponse<PaginatedResponse<BOMOperation>>(response);
  }

  async createBOMOperation(data: CreateBOMOperationData): Promise<BOMOperation> {
    const response = await this.makeRequest('/bom-operations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<BOMOperation>(response);
  }

  async getBOMOperationsByBOM(bomId: string): Promise<BOMOperation[]> {
    const response = await this.makeRequest(`/bom-operations/by_bom/?bom_id=${bomId}`);
    return this.handleResponse<BOMOperation[]>(response);
  }

  async getBOMOperationsByWorkCenter(workCenterId: string): Promise<BOMOperation[]> {
    const response = await this.makeRequest(`/bom-operations/by_work_center/?work_center_id=${workCenterId}`);
    return this.handleResponse<BOMOperation[]>(response);
  }

  async duplicateBOMOperation(id: string, data: {
    target_bom_id: string;
    sequence?: number;
  }): Promise<BOMOperation> {
    const response = await this.makeRequest(`/bom-operations/${id}/duplicate/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<BOMOperation>(response);
  }

  async updateBOMOperation(id: string, data: Partial<{
    name: string;
    sequence: number;
    work_center: string;
    duration_minutes: number;
    setup_time_minutes: number;
    description: string;
  }>): Promise<BOMOperation> {
    const response = await this.makeRequest(`/bom-operations/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.handleResponse<BOMOperation>(response);
  }

  async deleteBOMOperation(id: string): Promise<void> {
    const response = await this.makeRequest(`/bom-operations/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete BOM operation');
    }
  }

  async getBOMOperation(id: string): Promise<BOMOperation> {
    const response = await this.makeRequest(`/bom-operations/${id}/`);
    return this.handleResponse<BOMOperation>(response);
  }

  // Inventory Reports API
  async getStockSummary(): Promise<{
    summary: {
      total_products: number;
      in_stock: number;
      out_of_stock: number;
      low_stock: number;
    };
    recent_movements: StockLedgerEntry[];
  }> {
    const response = await this.makeRequest('/inventory-reports/stock_summary/');
    return this.handleResponse<{
      summary: {
        total_products: number;
        in_stock: number;
        out_of_stock: number;
        low_stock: number;
      };
      recent_movements: StockLedgerEntry[];
    }>(response);
  }

  async getConsumptionAnalysis(days: number = 30): Promise<any> {
    const response = await this.makeRequest(`/inventory-reports/consumption_analysis/?days=${days}`);
    return this.handleResponse<any>(response);
  }

  async getProductionAnalysis(days: number = 30): Promise<any> {
    const response = await this.makeRequest(`/inventory-reports/production_analysis/?days=${days}`);
    return this.handleResponse<any>(response);
  }

  // Profile Management Methods
  async sendEmailChangeOTP(data: { newEmail: string }): Promise<{ message: string }> {
    const response = await this.makeRequest('/auth/send-email-change-otp/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async changeEmail(data: { newEmail: string; otp: string }): Promise<{ message: string }> {
    const response = await this.makeRequest('/auth/change-email/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async sendPasswordChangeOTP(data: { username: string; currentPassword: string }): Promise<{ message: string }> {
    const response = await this.makeRequest('/auth/send-password-change-otp/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async changePassword(data: { currentPassword: string; newPassword: string; otp: string }): Promise<{ message: string }> {
    const response = await this.makeRequest('/auth/change-password/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // User Management API
  async getOperators(): Promise<User[]> {
    const response = await this.makeRequest('/auth/operators/');
    return this.handleResponse<User[]>(response);
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();