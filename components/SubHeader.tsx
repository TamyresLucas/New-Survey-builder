import React, { memo } from 'react';
import { EyeIcon, ChevronDownIcon } from './icons';

const SubHeader: React.FC = memo(() => {
  const navItems = ['Design', 'Test', 'Distribute', 'Results', 'Analyze'];
  const activeItem = 'Design';

  return (
    <nav className="relative flex items-center justify-center h-[47px] bg-surface-container border-b border-outline-variant px-4 shrink-0">
      {/* Centered Navigation */}
      <div className="flex items-center h-full">
        {navItems.map((item) => (
          <button
            key={item}
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className={`flex items-center h-full px-5 text-lg transition-colors duration-200
              ${
                activeItem === item
                  ? 'text-primary border-b-[3px] border-primary font-medium'
                  : 'text-on-surface font-light hover:text-primary'
              }`
            }
          >
            {item}
          </button>
        ))}
      </div>

      {/* Right-aligned Buttons */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
        <button
          style={{ fontFamily: "'Open Sans', sans-serif" }}
          className="flex items-center justify-center gap-2 px-2.5 h-[28px] bg-surface-container border border-on-surface rounded-[4px] text-sm font-semibold text-on-surface"
        >
          <span>Actions</span>
          <ChevronDownIcon className="text-[10px]" />
        </button>
        <button
          style={{ fontFamily: "'Open Sans', sans-serif" }}
          className="flex items-center justify-center gap-2 px-2.5 h-[28px] bg-primary rounded-[4px] text-sm font-semibold text-on-primary"
        >
          <EyeIcon className="text-base" />
          <span>Preview</span>
        </button>
      </div>
    </nav>
  );
});

export default SubHeader;