import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { changelogs } from '../changelogs/changelogData';
import { LinkIcon, BellIcon, QuestionIcon, GridIcon, CheckmarkIcon, SunIcon, MoonIcon, SparkleIcon, PublishIcon, HistoryIcon } from './icons';
import { AppChangelogModal } from './AppChangelogModal';
import { EditableText } from './EditableText';
import { useTheme } from '../contexts/ThemeContext';
import { DropdownList, DropdownItem, DropdownDivider } from './DropdownList';
import { Toggle } from './Toggle';
import type { SurveyStatus } from '../types';
import { Badge } from './Badge';

interface HeaderProps {
  surveyName: string;
  isGeminiPanelOpen: boolean;
  onToggleGeminiPanel: () => void;
  onUpdateSurveyName: (name: string) => void;
  surveyStatus: SurveyStatus;
  isDirty: boolean;
  onToggleActivateSurvey: () => void;
  onUpdateLiveSurvey: () => void;
  lastSaved?: string;
}

const Header: React.FC<HeaderProps> = memo(({ surveyName, isGeminiPanelOpen, onToggleGeminiPanel, onUpdateSurveyName,
  surveyStatus,
  isDirty,
  onToggleActivateSurvey,
  onUpdateLiveSurvey,
  lastSaved
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  const currentVersion = changelogs[0]?.version || 'v1.0.0';



  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), 10000); // 10 seconds
    return () => clearTimeout(timer);
  }, [isCopied]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuRef]);


  const handleCopyClick = () => {
    setIsCopied(true);
  };

  const renderStatusBadge = () => {
    switch (surveyStatus) {
      case 'active':
        return isDirty ? (
          <Badge variant="yellow" active hideDot>Pending changes</Badge>
        ) : (
          <Badge variant="green" active hideDot>Published</Badge>
        );
      case 'stopped':
        return (
          <Badge variant="red" active>Stopped</Badge>
        );
      case 'draft':
      default:
        return (
          <Badge variant="grey" active hideDot>Draft</Badge>
        );
    }
  };

  return (
    <header className="flex items-center justify-between bg-surface-container border-b border-[color:var(--border-bd-def)] px-5 py-2.5 flex-shrink-0 relative z-50">
      <div className="flex items-center">
        <button className="text-on-surface hover:opacity-80 transition-opacity mr-4" aria-label="Workspaces">
          <GridIcon className="text-2xl" />
        </button>
        <span
          className="font-extrabold text-xl leading-tight text-on-surface"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          VOXCO
        </span>
        <EditableText
          html={surveyName}
          onChange={(newName) => {
            if (newName.trim() && newName.trim() !== surveyName) {
              onUpdateSurveyName(newName.trim());
            }
          }}
          className="text-base font-medium text-on-surface ml-4 min-w-[100px]"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        />
        <div className="flex items-center text-sm text-on-surface-variant ml-4" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          {renderStatusBadge()}

        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Showing Saved at timestamp as a "Last Published" indicator */}
        {lastSaved && (
          <span className="text-xs text-on-surface-variant mr-3">
            Saved at {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        {(() => {
          const isPublishDisabled = !isDirty && surveyStatus !== 'draft';
          return (
            <button
              onClick={isPublishDisabled ? undefined : onUpdateLiveSurvey}
              disabled={isPublishDisabled}
              title={isPublishDisabled ? "There are no changes to be published" : undefined}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${isPublishDisabled
                ? 'bg-[var(--button-button-primary-disabled)] text-[var(--text-txt-on-color-disable)] cursor-not-allowed'
                : 'text-on-success bg-success hover:opacity-90'
                }`}
            >
              <PublishIcon className="text-base leading-none" />
              <span>Publish</span>
            </button>
          );
        })()}



        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyClick}
            className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${isCopied
              ? 'bg-success text-on-success'
              : 'border border-[color:var(--button-btn-bd-def)] text-on-surface hover:bg-surface-container-lowest'
              }`}
            aria-label={isCopied ? "Link copied" : "Copy link"}
          >
            {isCopied ? <CheckmarkIcon className="text-xl" /> : <LinkIcon className="text-xl" />}
          </button>
          <div className="h-6 w-px bg-outline-variant mx-1"></div>
          <button
            onClick={onToggleGeminiPanel}
            className={`w-8 h-8 flex items-center justify-center text-on-surface rounded-md transition-colors ${isGeminiPanelOpen
              ? 'bg-primary-container'
              : 'hover:bg-surface-container-lowest'
              }`}
            aria-label="AI Features"
            aria-pressed={isGeminiPanelOpen}
          >
            <SparkleIcon className="text-2xl" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-container-lowest rounded-md transition-colors" aria-label="Notifications">
            <BellIcon className="text-2xl" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-container-lowest rounded-md transition-colors" aria-label="Help">
            <QuestionIcon className="text-2xl" />
          </button>
        </div>

        <div className="relative" ref={userMenuRef}>
          <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ring-offset-surface-container">
            <div className="h-9 w-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-medium shadow-sm">
              TL
            </div>
          </button>
          {isUserMenuOpen && (
            <DropdownList className="absolute right-0 mt-2 w-64 ring-1 ring-black/5 dark:ring-outline-variant">
              <div className="px-4 py-2">
                <p className="text-sm text-on-surface-variant" id="user-menu-email-label">Signed in as</p>
                <p className="text-sm font-medium text-on-surface truncate" aria-labelledby="user-menu-email-label">tamyres.lucas@voxco.com</p>
                <p className="text-xs text-on-surface-variant mt-1">Version: {currentVersion}</p>
              </div>
              <DropdownDivider />
              <div className="p-2">
                <div className="flex justify-between items-center px-2 py-1">
                  <span className="text-sm font-medium text-on-surface">Theme</span>
                  <div className="flex items-center rounded-full bg-surface-container-lowest p-1">
                    <button onClick={() => setTheme('light')} className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${theme === 'light' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`} aria-label="Switch to light mode">
                      <SunIcon className="text-base" />
                    </button>
                    <button onClick={() => setTheme('dark')} className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${theme === 'dark' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`} aria-label="Switch to dark mode">
                      <MoonIcon className="text-base" />
                    </button>
                  </div>
                </div>
                <DropdownDivider className="mt-2 pt-2" />
                <div className="mt-1">
                  <DropdownItem
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsChangelogOpen(true);
                    }}
                    icon={HistoryIcon}
                    className="rounded-md"
                  >
                    See app changelog
                  </DropdownItem>
                </div>
              </div>
            </DropdownList>
          )}
        </div>
      </div>
      {isChangelogOpen && <AppChangelogModal onClose={() => setIsChangelogOpen(false)} />}
    </header >
  );
});

export default Header;