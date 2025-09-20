# React Frontend - Django API Integration - COMPLETE

## ✅ Full Implementation Complete

This React frontend now has **complete integration** with all Django API endpoints. All 50+ endpoints from your Django backend are now available in the React frontend with proper TypeScript interfaces, custom hooks, and error handling.

## 🚀 Quick Start

### 1. Start Django Backend
```bash
cd ordio
python manage.py runserver
```
The Django API will be available at `http://localhost:8000`

### 2. Start React Frontend
```bash
cd Odoo-Frontend
npm install
npm run dev
```
The React app will be available at `http://localhost:5173`

### 3. Test the Integration
1. Go to the React app
2. Login or create an account
3. Navigate to "API Test" in the sidebar
4. Test all endpoints live with real data

## � Implementation Overview

### Core Files Added/Updated

#### 1. `src/services/apiClient.ts` - Complete API Client
- **50+ Endpoints**: All Django endpoints implemented
- **TypeScript Interfaces**: Full type safety for all API calls
- **Automatic Token Refresh**: Handles JWT token renewal
- **Error Handling**: Comprehensive error management
- **Request/Response Types**: Matches Django serializers exactly

#### 2. `src/hooks/useApiHooks.ts` - React Hooks
- **Custom Hooks**: For every major endpoint group
- **State Management**: Loading, error, and data states
- **CRUD Operations**: Create, read, update, delete functionality
- **Automatic Refetching**: Smart data updates
- **Optimistic Updates**: Immediate UI updates

#### 3. `src/pages/ApiTest.tsx` - Live API Testing
- **Interactive Testing**: Test all endpoints with real data
- **Live Data Display**: See actual API responses
- **Error Monitoring**: Track API errors in real-time
- **Data Visualization**: JSON viewers and summaries

### Updated Components
- **Dashboard**: Now uses real manufacturing order data
- **WorkCenterList**: Displays actual work center information
- **All Forms**: Connected to real CREATE/UPDATE endpoints

## 🎉 Integration Complete!

Your React frontend now has **complete integration** with your Django backend:

✅ **50+ Django Endpoints** - All implemented
✅ **TypeScript Support** - Full type safety
✅ **Custom React Hooks** - Easy to use state management
✅ **CRUD Operations** - Create, read, update, delete
✅ **Real-time Updates** - Live data synchronization
✅ **Error Handling** - Comprehensive error management
✅ **Authentication** - JWT-based security
✅ **API Testing** - Built-in testing interface
✅ **Production Ready** - Scalable architecture
```

**Request Body:**
```javascript
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!"
}
```

**Response (201 Created):**
```javascript
{
  "message": "User registered successfully. Please verify your account with OTP.",
  "user_id": 123,
  "username": "john_doe"
}
```

#### **2. Send OTP**
```http
POST /api/auth/send-otp/
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "username": "john_doe"
}
```

**Response (200 OK):**
```javascript
{
  "message": "OTP sent successfully to your registered email.",
  "username": "john_doe"
}
```

#### **3. Verify OTP**
```http
POST /api/auth/verify-otp/
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "username": "john_doe",
  "otp": "123456"
}
```

**Response (200 OK):**
```javascript
{
  "message": "OTP verified successfully. Account activated.",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 123,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "OPERATOR",
    "is_verified": true
  }
}
```

#### **4. Login**
```http
POST /api/auth/login/
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```javascript
{
  "message": "Login successful.",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 123,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "OPERATOR",
    "is_verified": true
  }
}
```

#### **5. Token Refresh**
```http
POST /api/auth/token/refresh/
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### **6. User Profile**
```http
GET /api/auth/profile/
Authorization: Bearer {access_token}
```

#### **7. Update Profile**
```http
PUT /api/auth/profile/update/
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### **8. Logout**
```http
POST /api/auth/logout/
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

## 🏭 **Products API**

### Base URL: `/api/products/`

#### **Standard CRUD Operations:**
- `GET /api/products/` - List all products
- `GET /api/products/{id}/` - Retrieve product details
- `POST /api/products/` - Create new product
- `PUT /api/products/{id}/` - Update product
- `PATCH /api/products/{id}/` - Partial update
- `DELETE /api/products/{id}/` - Delete product

#### **Custom Endpoints:**

##### **Get Low Stock Products**
```http
GET /api/products/low_stock/
Authorization: Bearer {access_token}
```

##### **Get Out of Stock Products**
```http
GET /api/products/out_of_stock/
Authorization: Bearer {access_token}
```

##### **Update Product Stock**
```http
POST /api/products/{id}/update_stock/
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "quantity_change": 50.0,
  "notes": "Manual adjustment after physical count"
}
```

##### **Get Stock Movements**
```http
GET /api/products/{id}/stock_movements/
Authorization: Bearer {access_token}
```

#### **Query Parameters:**
- `?product_type=RAW_MATERIAL` - Filter by product type
- `?is_active=true` - Filter by active status
- `?search=wood` - Search in name, SKU, description
- `?ordering=name` - Order results

---

## 🏗️ **Work Centers API**

### Base URL: `/api/workcenters/`

#### **Standard CRUD Operations:**
- `GET /api/workcenters/` - List all work centers
- `GET /api/workcenters/{id}/` - Retrieve work center details
- `POST /api/workcenters/` - Create new work center
- `PUT /api/workcenters/{id}/` - Update work center
- `DELETE /api/workcenters/{id}/` - Delete work center

#### **Custom Endpoints:**

##### **Get Active Work Centers**
```http
GET /api/workcenters/active/
Authorization: Bearer {access_token}
```

##### **Get Work Center Utilization**
```http
GET /api/workcenters/{id}/utilization/
Authorization: Bearer {access_token}
```

**Response:**
```javascript
{
  "work_center": {
    "work_center_id": "uuid",
    "name": "CNC Machine 1",
    "code": "CNC001",
    "cost_per_hour": "25.00"
  },
  "period_days": 30,
  "total_work_orders": 45,
  "total_minutes_used": 2400,
  "capacity_minutes": 14400,
  "utilization_percentage": 16.67
}
```

---

## 📋 **BOM (Bill of Materials) API**

### Base URL: `/api/boms/`

#### **Standard CRUD Operations:**
- `GET /api/boms/` - List all BOMs
- `GET /api/boms/{id}/` - Retrieve BOM details
- `POST /api/boms/` - Create new BOM
- `PUT /api/boms/{id}/` - Update BOM
- `DELETE /api/boms/{id}/` - Delete BOM

#### **Custom BOM Endpoints:**

##### **Get Active BOMs**
```http
GET /api/boms/active/
Authorization: Bearer {access_token}
```

##### **Add Component to BOM**
```http
POST /api/boms/{id}/add_component/
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "component": "uuid-of-component",
  "quantity": 4.0,
  "notes": "Oak wood legs - cut to 75cm"
}
```

##### **Add Operation to BOM**
```http
POST /api/boms/{id}/add_operation/
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "bom": "uuid-of-bom",
  "name": "Cut Wood Components",
  "sequence": 1,
  "work_center": "uuid-of-work-center",
  "duration_minutes": 45,
  "setup_time_minutes": 15,
  "description": "Cut all wood pieces to required dimensions"
}
```

##### **Remove Component**
```http
DELETE /api/boms/{id}/remove_component/
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "component_id": "uuid-of-component"
}
```

##### **Remove Operation**
```http
DELETE /api/boms/{id}/remove_operation/
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "operation_id": "uuid-of-operation"
}
```

##### **Clone BOM**
```http
POST /api/boms/{id}/clone/
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "name": "Premium Wooden Table Recipe",
  "version": "2.0",
  "deactivate_original": false
}
```

---

## ⚙️ **BOM Operations API (Independent CRUD)**

### Base URL: `/api/bom-operations/`

#### **Standard CRUD Operations:**
- `GET /api/bom-operations/` - List all operations
- `GET /api/bom-operations/{id}/` - Retrieve operation details
- `POST /api/bom-operations/` - Create new operation
- `PUT /api/bom-operations/{id}/` - Update operation
- `DELETE /api/bom-operations/{id}/` - Delete operation

#### **Custom Operation Endpoints:**

##### **Get Operations by BOM**
```http
GET /api/bom-operations/by_bom/?bom_id={uuid}
Authorization: Bearer {access_token}
```

##### **Get Operations by Work Center**
```http
GET /api/bom-operations/by_work_center/?work_center_id={uuid}
Authorization: Bearer {access_token}
```

##### **Duplicate Operation**
```http
POST /api/bom-operations/{id}/duplicate/
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "target_bom_id": "uuid-of-target-bom",
  "sequence": 2
}
```

#### **Query Parameters:**
- `?bom={uuid}` - Filter operations by BOM
- `?search=cutting` - Search in operation name, BOM name, work center

---

## 🏭 **Manufacturing Orders API**

### Base URL: `/api/manufacturing-orders/`

#### **Standard CRUD Operations:**
- `GET /api/manufacturing-orders/` - List all manufacturing orders
- `GET /api/manufacturing-orders/{id}/` - Retrieve MO details
- `POST /api/manufacturing-orders/` - Create new MO
- `PUT /api/manufacturing-orders/{id}/` - Update MO
- `DELETE /api/manufacturing-orders/{id}/` - Delete MO

#### **Custom MO Endpoints:**

##### **Confirm Manufacturing Order**
```http
POST /api/manufacturing-orders/{id}/confirm/
Authorization: Bearer {access_token}
```

**Response:**
```javascript
{
  "message": "MO confirmed and work orders created",
  "mo": { /* MO data */ }
}
```

##### **Complete Manufacturing Order**
```http
POST /api/manufacturing-orders/{id}/complete/
Authorization: Bearer {access_token}
```

**Response:**
```javascript
{
  "message": "MO completed successfully",
  "consumed_components": 5,
  "produced_quantity": 10,
  "mo": { /* MO data */ }
}
```

##### **Get Component Requirements**
```http
GET /api/manufacturing-orders/{id}/component_requirements/
Authorization: Bearer {access_token}
```

##### **Manufacturing Dashboard**
```http
GET /api/manufacturing-orders/dashboard/
Authorization: Bearer {access_token}
```

**Response:**
```javascript
{
  "statistics": {
    "total_mos": 150,
    "draft": 5,
    "confirmed": 10,
    "in_progress": 8,
    "completed": 120,
    "canceled": 7
  },
  "recent_orders": [ /* Array of recent MOs */ ]
}
```

---

## ⚡ **Work Orders API**

### Base URL: `/api/work-orders/`

#### **Standard CRUD Operations:**
- `GET /api/work-orders/` - List all work orders
- `GET /api/work-orders/{id}/` - Retrieve work order details
- `PUT /api/work-orders/{id}/` - Update work order

#### **Work Order Actions:**

##### **Start Work Order**
```http
POST /api/work-orders/{id}/start/
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "operator": "uuid-of-operator",
  "notes": "Starting operation with new tooling"
}
```

##### **Pause Work Order**
```http
POST /api/work-orders/{id}/pause/
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "notes": "Pausing for lunch break"
}
```

##### **Complete Work Order**
```http
POST /api/work-orders/{id}/complete/
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "notes": "Completed successfully with quality check",
  "actual_duration": 90
}
```

##### **Get My Tasks**
```http
GET /api/work-orders/my_tasks/
Authorization: Bearer {access_token}
```

##### **Get Pending Work Orders**
```http
GET /api/work-orders/pending/
Authorization: Bearer {access_token}
```

---

## 📦 **Inventory API**

### Base URL: `/api/`

### **Stock Ledger - `/api/stock-ledger/`**

#### **Standard CRUD Operations:**
- `GET /api/stock-ledger/` - List all stock movements
- `GET /api/stock-ledger/{id}/` - Retrieve movement details
- `POST /api/stock-ledger/` - Create new movement

#### **Custom Stock Endpoints:**

##### **Stock Movement Summary**
```http
GET /api/stock-ledger/summary/?days=30
Authorization: Bearer {access_token}
```

**Response:**
```javascript
{
  "period_days": 30,
  "total_movements": 450,
  "total_in": 1250.0,
  "total_out": 980.0,
  "net_change": 270.0,
  "movement_types": {
    "MANUAL_IN": {
      "display_name": "Manual Stock In",
      "count": 25
    }
  },
  "recent_movements": [ /* Array of recent movements */ ]
}
```

##### **Get Movements by Product**
```http
GET /api/stock-ledger/by_product/?product_id={uuid}
Authorization: Bearer {access_token}
```

### **Stock Adjustments - `/api/stock-adjustments/`**

#### **Standard CRUD Operations:**
- `GET /api/stock-adjustments/` - List all adjustments
- `POST /api/stock-adjustments/` - Create new adjustment

#### **Adjustment Actions:**

##### **Approve Adjustment**
```http
POST /api/stock-adjustments/{id}/approve/
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```javascript
{
  "approved": true,
  "notes": "Approved after manager review"
}
```

##### **Get Pending Adjustments**
```http
GET /api/stock-adjustments/pending/
Authorization: Bearer {access_token}
```

### **Inventory Reports - `/api/inventory-reports/`**

##### **Stock Summary Report**
```http
GET /api/inventory-reports/stock_summary/
Authorization: Bearer {access_token}
```

**Response:**
```javascript
{
  "summary": {
    "total_products": 250,
    "in_stock": 200,
    "out_of_stock": 30,
    "low_stock": 20
  },
  "recent_movements": [ /* Recent movements */ ]
}
```

##### **Consumption Analysis**
```http
GET /api/inventory-reports/consumption_analysis/?days=30
Authorization: Bearer {access_token}
```

##### **Production Analysis**
```http
GET /api/inventory-reports/production_analysis/?days=30
Authorization: Bearer {access_token}
```

---

## 🚀 **React Integration Patterns**

### **1. Authentication Context**
```javascript
// contexts/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('access_token', action.payload.access_token);
      localStorage.setItem('refresh_token', action.payload.refresh_token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        tokens: {
          access: action.payload.access_token,
          refresh: action.payload.refresh_token
        }
      };
    case 'LOGOUT':
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        tokens: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    tokens: null,
    loading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Verify token and get user profile
      fetchUserProfile(token);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'LOGIN_SUCCESS', payload: data });
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### **2. API Client with Token Management**
```javascript
// services/apiClient.js
class ApiClient {
  constructor() {
    this.baseURL = '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('access_token');
    
    const config = {
      headers: {
        ...this.defaultHeaders,
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry request with new token
          config.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
          return await fetch(url, config);
        }
        // Redirect to login
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch('/api/auth/token/refresh/', {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    
    return false;
  }

  // Convenience methods
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
```

### **3. Custom Hooks for API Operations**
```javascript
// hooks/useProducts.js
import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(filters)]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryString = new URLSearchParams(filters).toString();
      const data = await apiClient.get(`/products/${queryString ? `?${queryString}` : ''}`);
      setProducts(data.results || data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData) => {
    try {
      const newProduct = await apiClient.post('/products/', productData);
      setProducts(prev => [...prev, newProduct]);
      return { success: true, data: newProduct };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const updatedProduct = await apiClient.put(`/products/${id}/`, productData);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return { success: true, data: updatedProduct };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      await apiClient.delete(`/products/${id}/`);
      setProducts(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateStock = async (id, quantityChange, notes) => {
    try {
      const result = await apiClient.post(`/products/${id}/update_stock/`, {
        quantity_change: quantityChange,
        notes: notes
      });
      fetchProducts(); // Refresh the list
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock
  };
};

// hooks/useManufacturing.js
export const useManufacturingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/manufacturing-orders/');
      setOrders(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (id) => {
    try {
      const result = await apiClient.post(`/manufacturing-orders/${id}/confirm/`);
      fetchOrders(); // Refresh the list
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const completeOrder = async (id) => {
    try {
      const result = await apiClient.post(`/manufacturing-orders/${id}/complete/`);
      fetchOrders(); // Refresh the list
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const getDashboard = async () => {
    try {
      return await apiClient.get('/manufacturing-orders/dashboard/');
    } catch (err) {
      throw new Error(err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    confirmOrder,
    completeOrder,
    getDashboard
  };
};
```

### **4. Component Examples**
```javascript
// components/ProductList.js
import React from 'react';
import { useProducts } from '../hooks/useProducts';

const ProductList = () => {
  const { products, loading, error, updateStock } = useProducts({
    is_active: true
  });

  const handleStockUpdate = async (productId, quantity) => {
    const result = await updateStock(productId, quantity, 'Manual adjustment');
    if (result.success) {
      alert('Stock updated successfully!');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="product-list">
      <h2>Products</h2>
      {products.map(product => (
        <div key={product.id} className="product-item">
          <h3>{product.name}</h3>
          <p>SKU: {product.sku}</p>
          <p>Stock: {product.current_stock}</p>
          <button 
            onClick={() => handleStockUpdate(product.id, 10)}
          >
            Add 10 Stock
          </button>
        </div>
      ))}
    </div>
  );
};

// components/ManufacturingDashboard.js
import React, { useState, useEffect } from 'react';
import { useManufacturingOrders } from '../hooks/useManufacturing';

const ManufacturingDashboard = () => {
  const { getDashboard } = useManufacturingOrders();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getDashboard();
        setDashboard(data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!dashboard) return <div>Failed to load dashboard</div>;

  return (
    <div className="dashboard">
      <h2>Manufacturing Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{dashboard.statistics.total_mos}</p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p>{dashboard.statistics.in_progress}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p>{dashboard.statistics.completed}</p>
        </div>
      </div>
      
      <div className="recent-orders">
        <h3>Recent Orders</h3>
        {dashboard.recent_orders.map(order => (
          <div key={order.mo_id} className="order-item">
            <span>{order.mo_number}</span>
            <span>{order.product_name}</span>
            <span>{order.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### **5. Error Handling and Loading States**
```javascript
// hooks/useApiState.js
import { useState } from 'react';

export const useApiState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute };
};

// Usage in components
const MyComponent = () => {
  const { loading, error, execute } = useApiState();

  const handleAction = async () => {
    const result = await execute(() => 
      apiClient.post('/manufacturing-orders/123/confirm/')
    );
    
    if (result.success) {
      // Handle success
    }
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div className="error">Error: {error}</div>}
      <button onClick={handleAction}>Confirm Order</button>
    </div>
  );
};
```

---

## 🔐 **Security Best Practices**

1. **Token Storage**: Store tokens in localStorage, consider httpOnly cookies for production
2. **Token Refresh**: Implement automatic token refresh before expiration
3. **Request Interceptors**: Handle 401 responses globally
4. **Input Validation**: Validate all inputs on the frontend before API calls
5. **Error Handling**: Implement consistent error handling across all API calls
6. **Loading States**: Always show loading indicators for better UX

## 📊 **Performance Tips**

1. **Pagination**: Use pagination for large datasets
2. **Caching**: Implement client-side caching for frequently accessed data
3. **Debouncing**: Debounce search inputs to reduce API calls
4. **Lazy Loading**: Load data only when needed
5. **Optimistic Updates**: Update UI immediately, rollback on error

This comprehensive API documentation provides all the endpoints and patterns needed to build a complete React frontend for your manufacturing system! 🚀