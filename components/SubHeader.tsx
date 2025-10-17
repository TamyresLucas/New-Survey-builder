import React, { memo } from 'react';

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
    </nav>
  );
});

export default SubHeader;
