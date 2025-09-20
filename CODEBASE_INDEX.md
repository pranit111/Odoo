# 📋 Ordio Manufacturing System - Complete Codebase Index

## 🏭 Project Overview

**Ordio** is a comprehensive Manufacturing Resource Planning (MRP) system built with Django REST Framework backend and React TypeScript frontend. It provides complete manufacturing workflow management from bill of materials to production completion.

### 🎯 Core Features
- **User Authentication** with OTP verification
- **Product Management** (Raw Materials & Finished Goods)
- **Bill of Materials (BOM)** creation and management
- **Manufacturing Orders** with work order tracking
- **Work Centers** and operation management
- **Real-time Inventory** tracking with stock ledger
- **Production Analytics** and reporting

---

## 🗂️ Project Structure

```
Odoo/
├── ordio/                          # Django Backend
│   ├── manage.py                   # Django management script
│   ├── db.sqlite3                  # SQLite database
│   ├── requirements.txt            # Python dependencies
│   ├── ordio/                      # Main Django project
│   │   ├── settings.py            # Django configuration
│   │   ├── urls.py                # Main URL routing
│   │   ├── wsgi.py                # WSGI application
│   │   └── asgi.py                # ASGI application
│   ├── user_auth/                 # User Authentication App
│   ├── products/                  # Product Management App
│   ├── workcenters/               # Work Center Management App
│   ├── bom/                       # Bill of Materials App
│   ├── manufacturing/             # Manufacturing Orders App
│   └── inventory/                 # Inventory & Stock Management App
├── Odoo-Frontend/                 # React Frontend
│   ├── package.json               # Node.js dependencies
│   ├── vite.config.ts             # Vite configuration
│   ├── tailwind.config.js         # Tailwind CSS configuration
│   ├── src/
│   │   ├── App.tsx                # Main application component
│   │   ├── main.tsx               # React entry point
│   │   ├── components/            # Reusable React components
│   │   ├── pages/                 # Page components
│   │   ├── services/              # API services
│   │   └── hooks/                 # Custom React hooks
│   └── public/                    # Static assets
├── CODEBASE_INDEX.md              # This documentation
├── DJANGO_REACT_INTEGRATION_COMPLETE.md  # Integration guide
└── REACT_API_INTEGRATION.md       # API integration details
```

---

## 🔧 Backend Architecture (Django)

### 🛠️ Technology Stack
- **Framework**: Django 4.2.24
- **API**: Django REST Framework 3.16.1
- **Authentication**: JWT (djangorestframework-simplejwt 5.5.1)
- **Database**: PostgreSQL (configured) / SQLite (default)
- **CORS**: django-cors-headers 4.9.0
- **Configuration**: python-decouple 3.8

### 📦 Django Apps

#### 1. **user_auth** - Authentication & User Management
```python
# Models
- CustomUser: Extended AbstractUser with OTP functionality
  - Fields: email, role (ADMIN/MANAGER/OPERATOR), otp, is_verified
  - Methods: generate_otp(), verify_otp()

# API Endpoints
POST /api/auth/register/          # User registration
POST /api/auth/send-otp/          # Send OTP to email
POST /api/auth/verify-otp/        # Verify OTP
POST /api/auth/login/             # User login (JWT)
POST /api/auth/logout/            # User logout
POST /api/auth/token/refresh/     # Refresh JWT token
GET  /api/auth/profile/           # Get user profile
PUT  /api/auth/profile/update/    # Update user profile
```

#### 2. **products** - Product Management
```python
# Models
- Product: Master product table
  - Fields: product_id (UUID), name, sku, product_type, current_stock, 
           minimum_stock, unit_of_measure, unit_cost, description
  - Methods: is_low_stock(), get_stock_status(), can_consume()

# API Endpoints
GET    /api/products/             # List products (with filters)
POST   /api/products/             # Create product
GET    /api/products/{id}/        # Product detail
PUT    /api/products/{id}/        # Update product
DELETE /api/products/{id}/        # Delete product
POST   /api/products/{id}/update-stock/  # Update stock level
```

#### 3. **workcenters** - Work Center Management
```python
# Models
- WorkCenter: Production workstations/machines
  - Fields: work_center_id (UUID), name, code, cost_per_hour, 
           capacity_hours_per_day, location, is_active
  - Methods: get_daily_capacity_minutes(), calculate_operation_cost()

# API Endpoints
GET    /api/workcenters/          # List work centers
POST   /api/workcenters/          # Create work center
GET    /api/workcenters/{id}/     # Work center detail
PUT    /api/workcenters/{id}/     # Update work center
DELETE /api/workcenters/{id}/     # Delete work center
```

#### 4. **bom** - Bill of Materials
```python
# Models
- BOM: Manufacturing recipes
  - Fields: bom_id (UUID), product, name, version, is_active
  - Methods: get_total_component_cost(), get_total_operation_cost()
  - Constraint: Only one active BOM per product

- BOMComponent: Raw materials required
  - Fields: bom, component (Product), quantity, notes
  - Methods: get_total_cost(), check_availability()

- BOMOperation: Production steps
  - Fields: bom, work_center, name, sequence, setup_time, run_time
  - Methods: get_total_time_minutes(), get_operation_cost()

# API Endpoints
GET    /api/boms/                 # List BOMs
POST   /api/boms/                 # Create BOM
GET    /api/boms/{id}/            # BOM detail
PUT    /api/boms/{id}/            # Update BOM
DELETE /api/boms/{id}/            # Delete BOM
GET    /api/boms/{id}/components/ # BOM components
POST   /api/boms/{id}/components/ # Add component
GET    /api/boms/{id}/operations/ # BOM operations
POST   /api/boms/{id}/operations/ # Add operation
```

#### 5. **manufacturing** - Manufacturing Orders
```python
# Models
- ManufacturingOrder: Production authorization
  - Fields: mo_id (UUID), mo_number, product, bom, quantity_to_produce,
           status, priority, scheduled_start_date, assignee
  - Methods: generate_mo_number(), get_required_components(), 
           create_work_orders(), get_progress_percentage()

- WorkOrder: Individual production tasks
  - Fields: wo_id (UUID), wo_number, mo, bom_operation, work_center,
           status, operator, estimated_duration_minutes
  - Methods: start_work(), pause_work(), complete_work()

# API Endpoints
GET    /api/manufacturing-orders/     # List manufacturing orders
POST   /api/manufacturing-orders/     # Create manufacturing order
GET    /api/manufacturing-orders/{id}/ # MO detail
PUT    /api/manufacturing-orders/{id}/ # Update MO
DELETE /api/manufacturing-orders/{id}/ # Delete MO
POST   /api/manufacturing-orders/{id}/confirm/ # Confirm MO
GET    /api/work-orders/              # List work orders
POST   /api/work-orders/{id}/start/   # Start work order
POST   /api/work-orders/{id}/complete/ # Complete work order
```

#### 6. **inventory** - Stock Management
```python
# Models
- StockLedger: Immutable transaction log
  - Fields: ledger_id (UUID), product, quantity_change, stock_before,
           stock_after, movement_type, reference_number, related_mo
  - Methods: create_movement() (factory method)

- StockAdjustment: Manual stock adjustments
  - Fields: adjustment_id (UUID), product, quantity_before, quantity_after,
           adjustment_type, reason, approved_by

# API Endpoints
GET    /api/stock-ledger/         # Stock movement history
POST   /api/stock-ledger/         # Create stock movement
GET    /api/stock-adjustments/    # Stock adjustments
POST   /api/stock-adjustments/    # Create adjustment
POST   /api/stock-adjustments/{id}/approve/ # Approve adjustment
```

### 🔐 Security Features
- **JWT Authentication**: Access & refresh tokens
- **Role-based Access**: ADMIN, MANAGER, OPERATOR roles
- **OTP Verification**: Email-based account verification
- **CORS Configuration**: Frontend integration security
- **Permission Classes**: API endpoint protection

---

## 🎨 Frontend Architecture (React)

### 🛠️ Technology Stack
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **Routing**: React Router DOM 7.9.1
- **HTTP Client**: Axios 1.12.2
- **Icons**: Lucide React 0.344.0
- **State Management**: Custom hooks with React state

### 📱 Application Structure

#### Core Components (`src/components/`)
```typescript
AppLayout.tsx           # Main application layout with sidebar
Layout.tsx              # Base layout wrapper
Sidebar.tsx             # Navigation sidebar
ProtectedRoute.tsx      # Authentication guard
Form.tsx                # Reusable form component
Table.tsx               # Data table component
Filters.tsx             # Filter controls
KPIGrid.tsx             # Dashboard metrics display
```

#### Pages (`src/pages/`)
```typescript
Login.tsx               # User login page
Signup.tsx              # User registration
OTPVerification.tsx     # OTP verification
Dashboard.tsx           # Main dashboard with KPIs
ManufacturingOrderForm.tsx    # Create/edit manufacturing orders
ManufacturingOrderDetail.tsx  # MO details and work orders
WorkCenterList.tsx      # Work center management
BillsOfMaterials.tsx    # BOM listing
BillOfMaterialForm.tsx  # BOM creation/editing
WorkOrders.tsx          # Work order management
StockLedger.tsx         # Inventory tracking
Reports.tsx             # Analytics and reports
ApiTest.tsx             # API integration testing
```

#### Services (`src/services/`)
```typescript
// API Client - Complete Django integration
apiClient.ts            # 50+ endpoint implementations
auth.ts                 # Authentication service

// TypeScript Interfaces (matching Django models)
export interface Product {
  product_id: string;
  name: string;
  sku: string;
  product_type: 'RAW_MATERIAL' | 'FINISHED_GOOD';
  current_stock: string;
  unit_of_measure: string;
  // ... other fields
}

export interface ManufacturingOrder {
  mo_id: string;
  mo_number: string;
  product: string;
  quantity_to_produce: number;
  status: 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';
  // ... other fields
}
```

#### Custom Hooks (`src/hooks/`)
```typescript
useAuth.tsx             # Authentication state management
useApiHooks.ts          # API integration hooks

// Available Hooks
useProducts()           # Product CRUD operations
useWorkCenters()        # Work center management
useBOMs()              # Bill of materials
useManufacturingOrders() # Manufacturing orders
useWorkOrders()         # Work order operations
useStockLedger()        # Inventory tracking
useInventory()          # Stock management
```

### 🔄 State Management Pattern
```typescript
// Custom hook example
export const useProducts = (filters?: ProductFilters) => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = async (productData: CreateProductData) => {
    setLoading(true);
    try {
      const newProduct = await apiClient.createProduct(productData);
      setData(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, createProduct, refetch };
};
```

---

## 🌐 API Integration

### 📡 Complete Endpoint Coverage
✅ **50+ Django endpoints** fully integrated  
✅ **TypeScript interfaces** for all data models  
✅ **Custom React hooks** for state management  
✅ **Error handling** and loading states  
✅ **JWT authentication** with auto-refresh  

### 🔧 Key Integration Features

#### Authentication Flow
```typescript
// Login process
1. User submits credentials → Django /api/auth/login/
2. Django returns JWT tokens
3. Frontend stores tokens securely
4. All API calls include Authorization header
5. Automatic token refresh on expiry
```

#### Real-time Data Flow
```typescript
// Manufacturing order creation
1. User fills form → React state
2. Form submission → POST /api/manufacturing-orders/
3. Django creates MO, returns data
4. React updates local state
5. UI reflects changes immediately
6. Background refetch ensures consistency
```

#### Error Handling Strategy
```typescript
// Centralized error management
- Network errors → User-friendly messages
- Validation errors → Form field highlighting
- Authentication errors → Automatic re-login
- Server errors → Error reporting with context
```

---

## 📊 Database Schema

### 🗄️ Key Relationships
```sql
CustomUser (1) ←→ (N) ManufacturingOrder [created_by, assignee]
Product (1) ←→ (N) ManufacturingOrder [product]
Product (1) ←→ (N) BOM [product]
BOM (1) ←→ (N) BOMComponent [bom]
BOM (1) ←→ (N) BOMOperation [bom]
BOM (1) ←→ (N) ManufacturingOrder [bom]
ManufacturingOrder (1) ←→ (N) WorkOrder [mo]
WorkCenter (1) ←→ (N) BOMOperation [work_center]
WorkCenter (1) ←→ (N) WorkOrder [work_center]
Product (1) ←→ (N) StockLedger [product]
ManufacturingOrder (1) ←→ (N) StockLedger [related_mo]
```

### 🔑 Primary Keys
- All models use **UUID** primary keys for security
- Human-readable numbers (MO-202409001, WO-001) for user interface
- Foreign key relationships maintain referential integrity

---

## 🚀 Development Workflow

### 🏃‍♂️ Quick Start

#### Backend Setup
```bash
cd ordio
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
# Django API available at http://localhost:8000
```

#### Frontend Setup
```bash
cd Odoo-Frontend
npm install
npm run dev
# React app available at http://localhost:5173
```

### 🧪 Testing & Validation

#### API Testing
- Built-in **ApiTest.tsx** page for live endpoint testing
- All CRUD operations testable through UI
- Real-time error monitoring and debugging

#### Authentication Testing
```bash
# Test flow
1. Register new user → /signup
2. Verify OTP → Email verification
3. Login → JWT token generation
4. Access protected routes → Token validation
5. Token refresh → Automatic renewal
```

### 📦 Deployment Considerations

#### Production Settings
```python
# Django settings for production
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        # ... PostgreSQL config
    }
}
CORS_ALLOWED_ORIGINS = ['https://your-frontend-domain.com']
```

#### Build Process
```bash
# Frontend production build
npm run build
# Creates optimized build in dist/

# Django static files
python manage.py collectstatic
```

---

## 🔍 Code Quality & Standards

### 📋 Best Practices Implemented

#### Backend (Django)
- **Model validation** with custom clean() methods
- **Atomic transactions** for stock movements
- **Proper indexing** on frequently queried fields
- **UUID primary keys** for security
- **Custom managers** for complex queries
- **Signal handlers** for automated workflows

#### Frontend (React)
- **TypeScript strict mode** for type safety
- **Custom hooks** for reusable logic
- **Error boundaries** for graceful error handling
- **Optimistic updates** for better UX
- **Code splitting** with React.lazy()
- **ESLint configuration** for code consistency

### 🛡️ Security Measures
- **JWT tokens** with refresh mechanism
- **CORS configuration** for cross-origin requests
- **CSRF protection** for state-changing operations
- **Input validation** on both frontend and backend
- **SQL injection prevention** with ORM
- **XSS protection** with React's built-in escaping

---

## 📈 Performance Optimizations

### ⚡ Backend Optimizations
- **Database indexing** on frequently queried fields
- **Select related** for reducing N+1 queries
- **Pagination** for large datasets
- **Atomic transactions** for consistency
- **Background tasks** for email sending

### ⚡ Frontend Optimizations
- **Code splitting** with dynamic imports
- **Memoization** with React.memo and useMemo
- **Debounced search** for real-time filtering
- **Optimistic updates** for immediate feedback
- **Error retry mechanisms** for failed requests

---

## 🎯 Future Enhancements

### 🔮 Planned Features
1. **Real-time notifications** with WebSockets
2. **Mobile app** with React Native
3. **Advanced analytics** with charts and dashboards
4. **Automated scheduling** with optimization algorithms
5. **Multi-language support** with i18n
6. **Document management** for work instructions
7. **Quality control** modules with inspection workflows
8. **Supplier management** for procurement
9. **Cost accounting** with detailed analytics
10. **Maintenance scheduling** for work centers

### 🔧 Technical Improvements
- **Redis caching** for frequently accessed data
- **Celery task queue** for background processing
- **Docker containerization** for deployment
- **Automated testing** with pytest and Jest
- **CI/CD pipeline** with GitHub Actions
- **API documentation** with Swagger/OpenAPI
- **Monitoring** with Sentry and analytics

---

## 📚 Additional Documentation

- **[DJANGO_REACT_INTEGRATION_COMPLETE.md](./DJANGO_REACT_INTEGRATION_COMPLETE.md)** - Complete integration guide
- **[REACT_API_INTEGRATION.md](./REACT_API_INTEGRATION.md)** - Detailed API integration documentation
- **[API_DOCUMENTATION.md](./ordio/API_DOCUMENTATION.md)** - Django API reference

---

## 🏆 Project Status

✅ **Backend API**: Complete with 50+ endpoints  
✅ **Frontend Integration**: Full React TypeScript implementation  
✅ **Authentication**: JWT with OTP verification  
✅ **Core Features**: All manufacturing workflows implemented  
✅ **Database**: Properly designed with relationships  
✅ **Documentation**: Comprehensive guides and references  

**The Ordio Manufacturing System is production-ready with a complete full-stack implementation.**

---

*Last Updated: September 21, 2025*  
*Generated from comprehensive codebase analysis*