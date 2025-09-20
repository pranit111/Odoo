import React, { useState, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProfileDropdown } from './ProfileDropdown';
import { 
  Menu, 
  X, 
  Home, 
  Package, 
  Settings, 
  BarChart3, 
  Warehouse,
  Wrench,
  LogOut,
  User
} from 'lucide-react';

const menuItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/manufacturing-orders', icon: Package, label: 'Manufacturing Orders' },
  { path: '/work-centers', icon: Settings, label: 'Work Centers' },
  { path: '/work-orders', icon: Wrench, label: 'Work Orders' },
  { path: '/stock-ledger', icon: Warehouse, label: 'Stock Ledger' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
];

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-black text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <img src="/ordio-logo.gif" alt="Ordio" className="h-8 w-8" />
            <h2 className="text-xl font-bold">Ordio</h2>
          </div>
          <button 
            className="lg:hidden p-2 rounded-md hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="mt-8">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-700 transition-colors ${location.pathname === item.path ? 'bg-gray-700 border-r-4 border-white' : ''}`}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              <item.icon size={20} className="mr-3" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
          <div className="flex items-center mb-4">
            <User size={16} className="mr-2" />
            <span className="text-sm">{user?.name}</span>
          </div>
          <button 
            className="flex items-center text-sm hover:text-gray-300 transition-colors"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              className="lg:hidden p-2 rounded-md text-black hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-black">Manufacturing Dashboard</h1>
            <div className="flex items-center gap-2">
              <ProfileDropdown />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};