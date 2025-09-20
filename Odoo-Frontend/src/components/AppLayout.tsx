import React from 'react';
import { Sidebar } from './Sidebar';
import { ProfileDropdown } from './ProfileDropdown';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div></div>
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-black mx-auto">{title}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <ProfileDropdown />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};