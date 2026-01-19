import React, { memo } from 'react';
import type { NavItem } from '../../types';
import { mainNavItems } from '../../constants';

import { PanelLeftIcon, ArrowUpIcon } from '../icons';

interface LeftSidebarProps {
  activeTab: string;
  onTabSelect: (tabId: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = memo(({ activeTab, onTabSelect }) => {
  return (
    <nav className="flex-shrink-0 w-16 bg-surface-container border-r border-[color:var(--border-bd-def)] flex flex-col gap-[10px] h-full">
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
      <div className="flex-1" />
      {activeTab !== 'Flow' && (
        <>
          <button
            onClick={() => {
              const el = document.getElementById('print-canvas-scroll-container') || document.getElementById('main-canvas-scroll-container');
              if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-center justify-center w-full h-16 transition-colors gap-1 text-on-surface-variant hover:text-primary mb-2"
            aria-label="Back to top"
          >
            <ArrowUpIcon className="text-xl" />
          </button>
        </>
      )}
    </nav>
  );
});

export default LeftSidebar;