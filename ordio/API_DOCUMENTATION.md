# 📋 Manufacturing Management System API Documentation

## 🌟 Overview

This document provides comprehensive documentation for the Manufacturing Management System REST API. The API enables complete management of manufacturing operations including products, BOMs, manufacturing orders, work orders, work centers, and inventory tracking.

## 🔐 Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📍 Base URL

```
http://localhost:8000/api/
```

---

## 📦 **1. Products API**

### **Base Endpoint:** `/api/products/`

### **1.1 List Products**
- **GET** `/api/products/`
- **Description:** Get paginated list of all products
- **Query Parameters:**
  - `product_type`: Filter by RAW_MATERIAL or FINISHED_GOOD
  - `is_active`: Filter by active status (true/false)
  - `search`: Search by name, SKU, or description
  - `ordering`: Sort by name, created_at, current_stock

**Response Example:**
```json
{
  "count": 25,
  "results": [
    {
      "product_id": "uuid-here",
      "name": "Wooden Table",
      "sku": "WT-001",
      "product_type": "FINISHED_GOOD",
      "current_stock": "50.00",
      "unit_of_measure": "units",
      "stock_status": "In Stock",
      "is_active": true
    }
  ]
}
```

### **1.2 Create Product**
- **POST** `/api/products/`
- **Description:** Create a new product

**Request Body:**
```json
{
  "name": "Wooden Leg",
  "sku": "WL-001",
  "product_type": "RAW_MATERIAL",
  "current_stock": "100.00",
  "minimum_stock": "20.00",
  "unit_of_measure": "units",
  "unit_cost": "5.50",
  "description": "High quality wooden leg for tables"
}
```

### **1.3 Get Product Details**
- **GET** `/api/products/{id}/`
- **Description:** Get detailed information about a specific product

### **1.4 Update Stock**
- **POST** `/api/products/{id}/update_stock/`
- **Description:** Manually update product stock

**Request Body:**
```json
{
  "quantity_change": "25.00",
  "notes": "Manual stock addition"
}
```

### **1.5 Special Endpoints**
- **GET** `/api/products/low_stock/` - Get products below minimum stock
- **GET** `/api/products/out_of_stock/` - Get out of stock products
- **GET** `/api/products/{id}/stock_movements/` - Get stock movement history

---

## 🏭 **2. Work Centers API**

### **Base Endpoint:** `/api/workcenters/`

### **2.1 List Work Centers**
- **GET** `/api/workcenters/`
- **Description:** Get list of all work centers

**Response Example:**
```json
{
  "results": [
    {
      "work_center_id": "uuid-here",
      "name": "Assembly Line 1",
      "code": "ASM1",
      "cost_per_hour": "25.00",
      "capacity_hours_per_day": "8.00",
      "is_active": true
    }
  ]
}
```

### **2.2 Create Work Center**
- **POST** `/api/workcenters/`

**Request Body:**
```json
{
  "name": "Paint Floor",
  "code": "PAINT",
  "cost_per_hour": "30.00",
  "capacity_hours_per_day": "8.00",
  "description": "Painting and finishing operations",
  "location": "Building A - Floor 2"
}
```

### **2.3 Work Center Utilization**
- **GET** `/api/workcenters/{id}/utilization/`
- **Description:** Get utilization statistics for past 30 days

---

## 🔧 **3. BOM (Bill of Materials) API**

### **Base Endpoint:** `/api/boms/`

### **3.1 List BOMs**
- **GET** `/api/boms/`

**Response Example:**
```json
{
  "results": [
    {
      "bom_id": "uuid-here",
      "product_name": "Wooden Table",
      "name": "Standard Wooden Table Recipe",
      "version": "1.0",
      "is_active": true,
      "component_count": 4,
      "operation_count": 3,
      "created_at": "2025-09-20T10:30:00Z"
    }
  ]
}
```

### **3.2 Get BOM Details**
- **GET** `/api/boms/{id}/`

**Response Example:**
```json
{
  "bom_id": "uuid-here",
  "product_name": "Wooden Table",
  "name": "Standard Wooden Table Recipe",
  "version": "1.0",
  "is_active": true,
  "components": [
    {
      "component_name": "Wooden Leg",
      "quantity": "4.00",
      "unit_of_measure": "units",
      "total_cost": "22.00"
    }
  ],
  "operations": [
    {
      "name": "Assembly",
      "sequence": 1,
      "work_center_name": "Assembly Line 1",
      "duration_minutes": 60,
      "operation_cost": "25.00"
    }
  ],
  "total_bom_cost": "97.50"
}
```

### **3.3 BOM Management**
- **POST** `/api/boms/{id}/add_component/` - Add component to BOM
- **POST** `/api/boms/{id}/add_operation/` - Add operation to BOM
- **DELETE** `/api/boms/{id}/remove_component/` - Remove component
- **DELETE** `/api/boms/{id}/remove_operation/` - Remove operation
- **POST** `/api/boms/{id}/clone/` - Clone BOM with new version

---

## 🏗️ **4. Manufacturing Orders API**

### **Base Endpoint:** `/api/manufacturing-orders/`

### **4.1 List Manufacturing Orders**
- **GET** `/api/manufacturing-orders/`

**Response Example:**
```json
{
  "results": [
    {
      "mo_id": "uuid-here",
      "mo_number": "MO20250901",
      "product_name": "Wooden Table",
      "quantity_to_produce": 10,
      "status": "IN_PROGRESS",
      "priority": "MEDIUM",
      "scheduled_start_date": "2025-09-21",
      "assignee_name": "john_manager",
      "progress_percentage": 33.33,
      "work_order_count": 3
    }
  ]
}
```

### **4.2 Create Manufacturing Order**
- **POST** `/api/manufacturing-orders/`

**Request Body:**
```json
{
  "product": "product-uuid-here",
  "bom": "bom-uuid-here",
  "quantity_to_produce": 5,
  "priority": "HIGH",
  "scheduled_start_date": "2025-09-22",
  "assignee": "user-uuid-here",
  "notes": "Urgent order for customer ABC"
}
```

### **4.3 MO Actions**
- **POST** `/api/manufacturing-orders/{id}/confirm/` - Confirm MO and create work orders
- **POST** `/api/manufacturing-orders/{id}/complete/` - Complete MO and process stock movements
- **GET** `/api/manufacturing-orders/{id}/component_requirements/` - Check component availability

### **4.4 Dashboard**
- **GET** `/api/manufacturing-orders/dashboard/`

**Response Example:**
```json
{
  "statistics": {
    "total_mos": 25,
    "draft": 3,
    "confirmed": 5,
    "in_progress": 8,
    "completed": 9,
    "canceled": 0
  },
  "recent_orders": [...]
}
```

---

## ⚙️ **5. Work Orders API**

### **Base Endpoint:** `/api/work-orders/`

### **5.1 List Work Orders**
- **GET** `/api/work-orders/`

**Response Example:**
```json
{
  "results": [
    {
      "wo_id": "uuid-here",
      "wo_number": "MO20250901-01",
      "name": "Assembly",
      "work_center_name": "Assembly Line 1",
      "sequence": 1,
      "status": "IN_PROGRESS",
      "operator_name": "operator1",
      "estimated_duration_minutes": 600,
      "actual_duration_minutes": 0,
      "efficiency_percentage": 0,
      "is_overdue": false
    }
  ]
}
```

### **5.2 Work Order Actions**
- **POST** `/api/work-orders/{id}/start/` - Start work order

**Request Body:**
```json
{
  "operator": "user-uuid-here",
  "notes": "Starting assembly process"
}
```

- **POST** `/api/work-orders/{id}/pause/` - Pause work order
- **POST** `/api/work-orders/{id}/complete/` - Complete work order

**Complete Request Body:**
```json
{
  "notes": "Assembly completed successfully",
  "actual_duration": 550
}
```

### **5.3 Special Endpoints**
- **GET** `/api/work-orders/my_tasks/` - Get current user's assigned work orders
- **GET** `/api/work-orders/pending/` - Get all pending work orders

---

## 📊 **6. Inventory & Stock Ledger API**

### **Base Endpoint:** `/api/stock-ledger/`

### **6.1 Stock Movements**
- **GET** `/api/stock-ledger/`

**Response Example:**
```json
{
  "results": [
    {
      "ledger_id": "uuid-here",
      "product_name": "Wooden Leg",
      "quantity_change": "-40.00",
      "stock_before": "100.00",
      "stock_after": "60.00",
      "movement_type": "MO_CONSUMPTION",
      "reference_number": "MO20250901",
      "mo_number": "MO20250901",
      "created_by_name": "system",
      "transaction_time": "2025-09-20T14:30:00Z"
    }
  ]
}
```

### **6.2 Stock Reports**
- **GET** `/api/stock-ledger/summary/` - Get movement summary for specified period
- **GET** `/api/stock-ledger/by_product/?product_id={uuid}` - Get movements for specific product

### **6.3 Stock Adjustments**
- **GET** `/api/stock-adjustments/` - List stock adjustments
- **POST** `/api/stock-adjustments/` - Create new adjustment

**Create Adjustment Request:**
```json
{
  "product": "product-uuid-here",
  "expected_quantity": "100.00",
  "actual_quantity": "95.00",
  "adjustment_type": "COUNT",
  "reason": "Physical count revealed shortage of 5 units"
}
```

- **POST** `/api/stock-adjustments/{id}/approve/` - Approve adjustment
- **GET** `/api/stock-adjustments/pending/` - Get pending adjustments

---

## 📈 **7. Inventory Reports API**

### **Base Endpoint:** `/api/inventory-reports/`

### **7.1 Stock Summary**
- **GET** `/api/inventory-reports/stock_summary/`

**Response Example:**
```json
{
  "summary": {
    "total_products": 50,
    "in_stock": 45,
    "out_of_stock": 2,
    "low_stock": 8
  },
  "recent_movements": [...]
}
```

### **7.2 Analysis Reports**
- **GET** `/api/inventory-reports/consumption_analysis/?days=30` - Component consumption analysis
- **GET** `/api/inventory-reports/production_analysis/?days=30` - Production output analysis

---

## 🚨 **Error Handling**

### **Standard Error Response Format:**
```json
{
  "error": "Error message description",
  "field_errors": {
    "field_name": ["Field specific error message"]
  }
}
```

### **HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔄 **Manufacturing Workflow Example**

### **Complete Manufacturing Process:**

1. **Create Products:**
```bash
POST /api/products/
# Create finished good and raw materials
```

2. **Create Work Centers:**
```bash
POST /api/workcenters/
# Create assembly line, paint floor, etc.
```

3. **Create BOM:**
```bash
POST /api/boms/
POST /api/boms/{id}/add_component/
POST /api/boms/{id}/add_operation/
```

4. **Create Manufacturing Order:**
```bash
POST /api/manufacturing-orders/
```

5. **Confirm MO (creates work orders):**
```bash
POST /api/manufacturing-orders/{id}/confirm/
```

6. **Execute Work Orders:**
```bash
POST /api/work-orders/{id}/start/
POST /api/work-orders/{id}/complete/
```

7. **Complete MO (processes stock movements):**
```bash
POST /api/manufacturing-orders/{id}/complete/
```

---

## 🎯 **Key Features**

- **Real-time Stock Tracking:** All inventory movements are automatically logged
- **Component Availability Checking:** System validates component availability before MO confirmation
- **Dynamic BOM Scaling:** Component requirements automatically scale with MO quantities
- **Work Order Progression:** Track individual operations within manufacturing orders
- **Cost Calculation:** Automatic calculation of material and labor costs
- **Audit Trail:** Complete traceability of all manufacturing operations
- **Role-based Access:** Different permissions for Admin, Manager, and Operator roles

---

## 🔧 **Installation & Setup**

1. **Install Dependencies:**
```bash
pip install djangorestframework django-cors-headers
```

2. **Run Migrations:**
```bash
python manage.py migrate
```

3. **Create Superuser:**
```bash
python manage.py createsuperuser
```

4. **Start Server:**
```bash
python manage.py runserver
```

---

## 📞 **Support**

For technical support or feature requests, please contact the development team or create an issue in the project repository.

**API Version:** 1.0  
**Last Updated:** September 20, 2025