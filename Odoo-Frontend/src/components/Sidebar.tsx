import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Package, Settings, FileText, BarChart3, LogOut, Wrench, Clipboard, Code } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const sidebarItems = [
    { name: 'Manufacturing Orders', path: '/', icon: Package },
    { name: 'Work Orders', path: '/work-orders', icon: Wrench },
    { name: 'Bills of Materials', path: '/bills-of-materials', icon: Clipboard },
    { name: 'Work Centers', path: '/work-centers', icon: Settings },
    { name: 'Stock Ledger', path: '/stock-ledger', icon: FileText },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'API Test', path: '/api-test', icon: Code }
  ];

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/manufacturing-orders')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-black text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <img src="/ordio-logo-white.gif" alt="Ordio" className="" />
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        {sidebarItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 p-3 mb-2 rounded cursor-pointer transition-colors ${
                isActive(item.path)
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <IconComponent size={20} />
              <span>{item.name}</span>
            </div>
          );
        })}
      </nav>
      
      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 p-3 text-gray-300">
          <User size={20} />
          <span className="text-sm">Administrator</span>
        </div>
        <div 
          className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded cursor-pointer transition-colors"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};