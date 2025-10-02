import React, { memo } from 'react';
import type { NavItem } from '../types';
import { mainNavItems } from '../constants';

interface LeftSidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = memo(({ activeTab, setActiveTab }) => {
  return (
    <nav className="flex-shrink-0 w-20 bg-surface-container border-r border-outline-variant flex flex-col items-center py-4">
      {mainNavItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg mb-2 transition-colors ${
            activeTab === item.id 
              ? 'bg-primary-container text-primary' 
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
          aria-label={item.label}
        >
          <item.icon className="text-2xl" />
          <span className="text-xs mt-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
});

export default LeftSidebar;