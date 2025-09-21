#Demo Video Drive Link :https://drive.google.com/drive/folders/1HMUd5DchYj1mywIQHebKipYOwQ6kvqSW?usp=sharing
            Youtube Link:https://youtu.be/fwGGFRvkVr0

# Ordio - Manufacturing ERP System

A comprehensive Enterprise Resource Planning (ERP) system built with Django REST Framework backend and React TypeScript frontend, designed specifically for manufacturing operations management.

## 🚀 Features

### Core Manufacturing Features
- *Bill of Materials (BOM) Management* - Create and manage product BOMs with components and quantities
- *Manufacturing Orders* - Track production orders from planning to completion
- *Work Centers* - Manage production facilities and resources
- *Inventory Management* - Real-time stock tracking and movements
- *Product Catalog* - Comprehensive product database with specifications
- *Stock Ledger* - Detailed inventory transaction history

### Advanced Features
- *User Authentication & Authorization* - JWT-based secure authentication
- *Profile Management* - Email/password change with OTP verification
- *Dashboard Analytics* - KPI tracking and manufacturing insights
- *Work Orders Analysis* - Production efficiency and performance reports
- *Natural Language to SQL* - AI-powered data querying interface
- *Responsive Design* - Mobile-friendly interface with Tailwind CSS

## 🏗 Architecture

### Backend (Django REST Framework)

ordio/
├── ordio/                 # Main Django project
├── user_auth/            # Authentication & user management
├── products/             # Product catalog management
├── bom/                  # Bill of Materials
├── manufacturing/        # Manufacturing orders & operations
├── inventory/            # Stock management
├── workcenters/          # Work center management
└── nl_sql/              # Natural Language to SQL AI engine


### Frontend (React + TypeScript)

Odoo-Frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Application pages
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API client and auth services
│   └── App.tsx          # Main application component
├── public/              # Static assets
└── package.json         # Dependencies and scripts


## 📋 Prerequisites

### Backend Requirements
- Python 3.8+
- Django 4.2+
- PostgreSQL (for production) or SQLite (for development)

### Frontend Requirements
- Node.js 16+
- npm or yarn

## ⚙ Installation

### 1. Clone the Repository
bash
git clone <repository-url>
cd Odoo


### 2. Backend Setup

#### Navigate to Backend Directory
bash
cd ordio


#### Create Virtual Environment
bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate


#### Install Dependencies
bash
pip install -r requirements.txt


#### Environment Variables
Create a .env file in the ordio directory:
env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
GEMINI_API_KEY=your-gemini-api-key  # For NL to SQL feature


#### Database Setup
bash
# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser


#### Start Backend Server
bash
python manage.py runserver


The backend will be available at http://localhost:8000

### 3. Frontend Setup

#### Navigate to Frontend Directory
bash
cd Odoo-Frontend


#### Install Dependencies
bash
npm install


#### Environment Variables
Create a .env file in the Odoo-Frontend directory:
env
VITE_API_BASE_URL=http://localhost:8000


#### Start Development Server
bash
npm run dev


The frontend will be available at http://localhost:5173

## 🔌 API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/ | User registration |
| POST | /api/auth/send-otp/ | Send OTP for verification |
| POST | /api/auth/verify-otp/ | OTP verification |
| POST | /api/auth/login/ | User login |
| POST | /api/auth/logout/ | User logout |
| GET | /api/auth/profile/ | Get user profile |
| PUT | /api/auth/profile/ | Update user profile |
| POST | /api/auth/token/refresh/ | Refresh JWT token |

### Profile Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/send-email-change-otp/ | Send OTP for email change |
| POST | /api/auth/change-email/ | Change user email |
| POST | /api/auth/send-password-change-otp/ | Send OTP for password change |
| POST | /api/auth/change-password/ | Change user password |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products/ | List all products |
| POST | /api/products/ | Create new product |
| GET | /api/products/{id}/ | Get product details |
| PUT | /api/products/{id}/ | Update product |
| DELETE | /api/products/{id}/ | Delete product |

### Bill of Materials (BOM)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/bom/ | List all BOMs |
| POST | /api/bom/ | Create new BOM |
| GET | /api/bom/{id}/ | Get BOM details |
| PUT | /api/bom/{id}/ | Update BOM |
| DELETE | /api/bom/{id}/ | Delete BOM |

### Manufacturing Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/manufacturing/orders/ | List manufacturing orders |
| POST | /api/manufacturing/orders/ | Create manufacturing order |
| GET | /api/manufacturing/orders/{id}/ | Get order details |
| PUT | /api/manufacturing/orders/{id}/ | Update order |
| DELETE | /api/manufacturing/orders/{id}/ | Delete order |

### Work Centers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/workcenters/ | List work centers |
| POST | /api/workcenters/ | Create work center |
| GET | /api/workcenters/{id}/ | Get work center details |
| PUT | /api/workcenters/{id}/ | Update work center |
| DELETE | /api/workcenters/{id}/ | Delete work center |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/inventory/ | List inventory items |
| POST | /api/inventory/ | Create inventory item |
| GET | /api/inventory/{id}/ | Get inventory details |
| PUT | /api/inventory/{id}/ | Update inventory |
| DELETE | /api/inventory/{id}/ | Delete inventory |

### Natural Language to SQL
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/nl-sql/execute/ | Execute natural language query |
| GET | /api/nl-sql/schema/ | Get database schema |

## 📱 Frontend Features

### Pages
- *Dashboard* - Manufacturing KPIs and overview
- *Products* - Product catalog management
- *Bill of Materials* - BOM creation and management
- *Manufacturing Orders* - Production order tracking
- *Work Centers* - Facility management
- *Inventory* - Stock tracking and management
- *Stock Ledger* - Inventory transaction history
- *Reports* - Work orders analysis and reports
- *Profile Setup* - User profile management

### Components
- *Responsive Layout* - Sidebar navigation with mobile support
- *Data Tables* - Sortable and filterable data display
- *Forms* - Dynamic form components with validation
- *Modals* - Interactive popup dialogs
- *Charts* - Data visualization components
- *Filters* - Advanced filtering capabilities

### Key Features
- *Protected Routes* - Authentication-based navigation
- *Real-time Updates* - Live data synchronization
- *Form Validation* - Client-side and server-side validation
- *Error Handling* - Comprehensive error management
- *Loading States* - User-friendly loading indicators

## 🤖 AI Features

### Natural Language to SQL
The system includes an AI-powered feature that converts natural language queries into SQL and executes them against the database.

#### Features:
- *Natural Language Processing* - Understands plain English queries
- *SQL Generation* - Converts queries to safe SQL statements
- *Security Validation* - Prevents malicious SQL injection
- *Real-time Execution* - Immediate query results
- *Schema Awareness* - Understands database structure

#### Example Queries:
- "Show me the last 10 manufacturing orders"
- "What products have low stock?"
- "List all work centers with their capacity"
- "Show manufacturing orders completed this week"

#### Access:
- *Floating Icon* - Always accessible via bottom-right chat icon
- *Modal Interface* - Clean, sidebar-integrated design
- *Real-time Results* - Instant query execution and display

## 🔐 Security Features

### Authentication
- *JWT Tokens* - Secure token-based authentication
- *OTP Verification* - Two-factor authentication for sensitive operations
- *Password Requirements* - Strong password enforcement (8+ chars, 1 uppercase, 1 number, 1 symbol)
- *Session Management* - Secure session handling

### API Security
- *CORS Configuration* - Cross-origin resource sharing
- *Permission Classes* - Role-based access control
- *Input Validation* - Request data validation
- *SQL Injection Prevention* - Safe query execution

## 📊 Database Models

### User Authentication
- *CustomUser* - Extended user model with OTP support
- *OTP Management* - Time-based one-time passwords

### Manufacturing
- *Product* - Product catalog with specifications
- *BillOfMaterial* - Product composition and recipes
- *ManufacturingOrder* - Production orders and tracking
- *WorkCenter* - Production facilities and resources

### Inventory
- *InventoryItem* - Stock items with locations
- *StockMovement* - Inventory transaction history

## 🚀 Deployment

### Backend Deployment
1. Set up production database (PostgreSQL recommended)
2. Configure environment variables
3. Run python manage.py collectstatic
4. Set up web server (Nginx + Gunicorn)
5. Configure SSL certificates

### Frontend Deployment
1. Run npm run build
2. Deploy built files to web server
3. Configure routing for SPA
4. Set up CDN (optional)

## 🛠 Development

### Backend Development
bash
# Run migrations after model changes
python manage.py makemigrations
python manage.py migrate

# Create new app
python manage.py startapp app_name

# Run tests
python manage.py test


### Frontend Development
bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run type checking
npm run type-check


## 📝 API Documentation

The API follows REST principles with JSON responses. All authenticated endpoints require a valid JWT token in the Authorization header:


Authorization: Bearer <your-jwt-token>


### Response Format
json
{
  "data": {},
  "message": "Success message",
  "status": "success"
}


### Error Format
json
{
  "error": "Error message",
  "details": {},
  "status": "error"
}


## 🔍 Testing

### Backend Testing
bash
cd ordio
python manage.py test


### Frontend Testing
bash
cd Odoo-Frontend
npm run test


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the code examples in this README

## 🔄 Version History

- *v1.0.0* - Initial release with core manufacturing features
- *v1.1.0* - Added profile management and OTP verification
- *v1.2.0* - Implemented Natural Language to SQL feature
- *v1.3.0* - Enhanced UI/UX and comprehensive reporting

---

Built with ❤ using Django REST Framework and React TypeScript.
