import React, { memo, useState, useRef, useEffect } from 'react';
import { DotsHorizontalIcon, EyeIcon } from './icons';

interface SubHeaderProps {
  onTogglePreview: () => void;
  onCopySurvey: () => void;
  onExportCsv: () => void;
  onImportSurvey: () => void;
}

const SubHeader: React.FC<SubHeaderProps> = memo(({ onTogglePreview, onCopySurvey, onExportCsv, onImportSurvey }) => {
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
    <nav className="relative flex items-center h-[47px] bg-surface-container border-b border-outline-variant px-4 shrink-0 z-30">
      <div className="flex-1"></div> {/* Left spacer */}

      {/* Centered Navigation */}
      <div className="flex-none flex items-center h-full">
        {navItems.map((item) => (
          <button
            key={item}
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className={`flex items-center h-full px-5 text-lg transition-colors duration-200
              ${activeItem === item
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
        <button
          onClick={onTogglePreview}
          className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-on-primary bg-primary rounded-md hover:opacity-90 transition-opacity"
        >
          <EyeIcon className="text-base leading-none" />
          <span>Preview</span>
        </button>

        <div className="relative" ref={actionsMenuRef}>
          <button
            onClick={() => setIsActionsOpen(prev => !prev)}
            className="w-8 h-8 flex items-center justify-center text-on-surface bg-transparent rounded-md hover:bg-surface-container-high transition-colors"
            aria-haspopup="true"
            aria-expanded={isActionsOpen}
            aria-label="Actions"
          >
            <DotsHorizontalIcon className="text-xl" />
          </button>
          {isActionsOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-surface-container border border-outline-variant rounded-md shadow-lg z-20" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => { onImportSurvey(); setIsActionsOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high"
                  >
                    Import survey
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { onExportCsv(); setIsActionsOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high"
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
      </div>
    </nav>
  );
});

export default SubHeader;