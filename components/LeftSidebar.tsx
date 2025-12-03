import React, { memo } from 'react';
import type { NavItem } from '../types';
import { mainNavItems } from '../constants';

import { PanelLeftIcon } from './icons';

interface LeftSidebarProps {
  activeTab: string;
  onTabSelect: (tabId: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = memo(({ activeTab, onTabSelect }) => {
  return (
    <nav className="flex-shrink-0 w-16 bg-surface-container border-r border-outline-variant flex flex-col gap-[10px]">
      {mainNavItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabSelect(item.id)}
          className={`flex flex-col items-center justify-center w-full h-16 transition-colors gap-1 ${activeTab === item.id
            ? 'text-primary border-r-[3px] border-primary'
            : 'text-on-surface-variant hover:text-primary'
            }`}
          aria-label={item.label}
        >
          <item.icon className="text-xl" />
          <span className={`text-[11px] leading-[15px] ${activeTab === item.id ? 'font-medium' : 'font-light'}`} style={{ fontFamily: "'Outfit', sans-serif" }}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
});

export default LeftSidebar;