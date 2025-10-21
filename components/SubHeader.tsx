import React, { memo } from 'react';
import { EyeIcon } from './icons';

interface SubHeaderProps {
  onTogglePreview: () => void;
}

const SubHeader: React.FC<SubHeaderProps> = memo(({ onTogglePreview }) => {
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

      {/* Preview Button on the right */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <button 
          onClick={onTogglePreview}
          className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-on-primary bg-primary rounded-full hover:opacity-90 transition-opacity"
        >
          <EyeIcon className="text-base" />
          <span>Preview</span>
        </button>
      </div>
    </nav>
  );
});

export default SubHeader;