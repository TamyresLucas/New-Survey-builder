import React, { memo, useState, useRef, useEffect } from 'react';
import { DotsHorizontalIcon, EyeIcon, PrintIcon, ImageIcon } from './icons';
import { DropdownList, DropdownItem, DropdownDivider } from './DropdownList';

interface SubHeaderProps {
  onTogglePreview: () => void;
  onCopySurvey: () => void;
  onExportCsv: () => void;
  onPrintBlueprint: () => void;
  onPrintSurvey: () => void;
  onImportSurvey: () => void;
  onCopySurveyFlow?: () => void;
  lastSaved?: string;
}

const SubHeader: React.FC<SubHeaderProps> = memo(({ onTogglePreview, onCopySurvey, onExportCsv, onPrintBlueprint, onPrintSurvey, onImportSurvey, onCopySurveyFlow, lastSaved }) => {
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
    <nav className="relative flex items-center h-[47px] bg-surface-container border-b border-[color:var(--border-bd-def)] px-4 shrink-0 z-30">
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
        {lastSaved && (
          <span className="text-xs text-on-surface-variant mr-3">
            Saved at {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <button
          onClick={onTogglePreview}
          className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-on-primary bg-primary rounded-md hover:opacity-90 transition-opacity"
        >
          <EyeIcon className="text-base leading-none" />
          <span>Preview</span>
        </button>

        <div className="relative" ref={actionsMenuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setIsActionsOpen(prev => !prev); }}
            className={`w-8 h-8 flex items-center justify-center text-on-surface bg-transparent rounded-md hover:bg-surface-container-lowest transition-colors ${isActionsOpen ? '!bg-surface-container-high' : ''}`}
            aria-haspopup="true"
            aria-expanded={isActionsOpen}
            aria-label="Actions"
          >
            <DotsHorizontalIcon className="text-xl" />
          </button>
          {isActionsOpen && (
            <div className="absolute top-full right-0 mt-2 z-20">
              <DropdownList className="w-56">
                <DropdownItem onClick={() => { onImportSurvey(); setIsActionsOpen(false); }}>
                  Import survey
                </DropdownItem>
                <DropdownItem onClick={() => { onExportCsv(); setIsActionsOpen(false); }}>
                  Export survey as CSV
                </DropdownItem>

                {/* Print Action */}
                <DropdownItem
                  onClick={() => { onPrintSurvey(); setIsActionsOpen(false); }}
                  icon={PrintIcon}
                >
                  Print survey
                </DropdownItem>

                <DropdownDivider />
                <DropdownItem onClick={() => { onCopySurvey(); setIsActionsOpen(false); }}>
                  Copy survey (JSON)
                </DropdownItem>
                {onCopySurveyFlow && (
                  <DropdownItem onClick={() => { onCopySurveyFlow(); setIsActionsOpen(false); }} icon={ImageIcon}>
                    Copy survey flow as PNG
                  </DropdownItem>
                )}
              </DropdownList>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
});

export default SubHeader;