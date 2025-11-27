import React from 'react';

interface CanvasTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  variant: 'header' | 'floating';
}

const CanvasTabs: React.FC<CanvasTabsProps> = ({ activeTab, onTabChange, variant }) => {
  const tabs = ['Editor', 'Diagram'];

  if (variant === 'header') {
    return (
      <div className="px-4 border-b border-outline-variant flex-shrink-0 bg-surface-container">
        <nav className="flex space-x-4">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    );
  }

  // floating variant
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-surface-container border border-outline-variant rounded-lg shadow-md p-1 flex items-center gap-1">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab
            ? 'bg-primary text-on-primary'
            : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default CanvasTabs;
