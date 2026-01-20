import React, { memo, useState, useRef, useEffect } from 'react';
import { DotsHorizontalIcon, EyeIcon, PrintIcon, ImageIcon, UnfoldMoreIcon, UnfoldLessIcon } from './icons';
import { DropdownList, DropdownItem, DropdownDivider } from './DropdownList';
import { Button } from './Button';

interface SubHeaderProps {
  onTogglePreview: () => void;
  onCopySurvey: () => void;
  onExportCsv: () => void;
  onPrintBlueprint: () => void;
  onPrintSurvey: () => void;
  onImportSurvey: () => void;
  onCopySurveyFlow?: () => void;
  lastSaved?: string;
  onToggleCollapseAll?: () => void;
  allBlocksCollapsed?: boolean;
  activeMainTab?: string;
}

const SubHeader: React.FC<SubHeaderProps> = memo(({ onTogglePreview, onCopySurvey, onExportCsv, onPrintBlueprint, onPrintSurvey, onImportSurvey, onCopySurveyFlow, lastSaved, onToggleCollapseAll, allBlocksCollapsed, activeMainTab }) => {
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
        {activeMainTab !== 'Flow' && onToggleCollapseAll && (
          <Button
            variant="ghost"
            size="large"
            onClick={onToggleCollapseAll}
            aria-label={allBlocksCollapsed ? "Expand all" : "Collapse all"}
          >
            {allBlocksCollapsed ? (
              <UnfoldMoreIcon className="text-xl" />
            ) : (
              <UnfoldLessIcon className="text-xl" />
            )}
            {allBlocksCollapsed ? "Expand all" : "Collapse all"}
          </Button>
        )}
        <Button
          variant="primary"
          size="large"
          onClick={onTogglePreview}
        >
          <EyeIcon className="text-base leading-none" />
          <span>Preview</span>
        </Button>

        <div className="relative" ref={actionsMenuRef}>
          <Button
            variant="ghost"
            size="large"
            iconOnly
            onClick={(e) => { e.stopPropagation(); setIsActionsOpen(prev => !prev); }}
            active={isActionsOpen}
            aria-haspopup="true"
            aria-expanded={isActionsOpen}
            aria-label="Actions"
          >
            <DotsHorizontalIcon className="text-xl" />
          </Button>
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
