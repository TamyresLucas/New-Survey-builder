import React, { memo, useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, EyeIcon } from './icons';

interface SubHeaderProps {
  onTogglePreview: () => void;
  onCopySurvey: () => void;
  onSaveSurvey: () => void;
}

const SubHeader: React.FC<SubHeaderProps> = memo(({ onTogglePreview, onCopySurvey, onSaveSurvey }) => {
  const navItems = ['Design', 'Test', 'Distribute', 'Results', 'Analyze'];
  const activeItem = 'Design';

  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="relative flex items-center h-[47px] bg-surface-container border-b border-outline-variant px-4 shrink-0">
      <div className="flex-1"></div> {/* Left spacer */}
      
      {/* Centered Navigation */}
      <div className="flex-none flex items-center h-full">
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

      {/* Right-aligned Actions */}
      <div className="flex-1 flex items-center justify-end gap-2">
        <div className="relative" ref={actionsMenuRef}>
            <button
                onClick={() => setIsActionsOpen(prev => !prev)}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-on-surface bg-surface-container-high border border-outline rounded-full hover:bg-surface-container-highest transition-colors"
                aria-haspopup="true"
                aria-expanded={isActionsOpen}
            >
                <span>Actions</span>
                <ChevronDownIcon className={`text-base transition-transform ${isActionsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isActionsOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-surface-container border border-outline-variant rounded-md shadow-lg z-20" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    <ul className="py-1">
                        <li>
                            <button
                                onClick={() => { onSaveSurvey(); setIsActionsOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high"
                            >
                                Save survey
                            </button>
                        </li>
                        <div className="border-t border-dotted border-outline-variant mx-2 my-1" />
                        <li>
                            <button
                                onClick={() => { alert('Import not implemented.'); setIsActionsOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled
                            >
                                Import survey
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => { alert('Export not implemented.'); setIsActionsOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled
                            >
                                Export survey as CSV
                            </button>
                        </li>
                        <div className="border-t border-dotted border-outline-variant mx-2 my-1" />
                        <li>
                            <button
                                onClick={() => { onCopySurvey(); setIsActionsOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high"
                            >
                                Copy survey
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>

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
