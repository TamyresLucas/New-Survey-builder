import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { changelogs } from '../changelogs/changelogData';
import { LinkIcon, BellIcon, QuestionIcon, GridIcon, CheckmarkIcon, SunIcon, MoonIcon, SparkleIcon, PublishIcon, HistoryIcon } from './icons';
import { AppChangelogModal } from './AppChangelogModal';
import { useTheme } from '../contexts/ThemeContext';
import type { SurveyStatus } from '../types';

interface HeaderProps {
  surveyName: string;
  isGeminiPanelOpen: boolean;
  onToggleGeminiPanel: () => void;
  onUpdateSurveyName: (name: string) => void;
  surveyStatus: SurveyStatus;
  isDirty: boolean;
  onToggleActivateSurvey: () => void;
  onUpdateLiveSurvey: () => void;
}

const Header: React.FC<HeaderProps> = memo(({ surveyName, isGeminiPanelOpen, onToggleGeminiPanel, onUpdateSurveyName, surveyStatus, isDirty, onToggleActivateSurvey, onUpdateLiveSurvey }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  const currentVersion = changelogs[0]?.version || 'v1.0.0';

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(surveyName);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const createPasteHandler = useCallback(<T extends HTMLInputElement | HTMLTextAreaElement>(
    onChange: (newValue: string) => void
  ) => (e: React.ClipboardEvent<T>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const target = e.currentTarget;
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;

    const newValue = target.value.substring(0, start) + text + target.value.substring(end);
    onChange(newValue);

    const newCursorPos = start + text.length;
    requestAnimationFrame(() => {
      if (document.activeElement === target) {
        target.selectionStart = newCursorPos;
        target.selectionEnd = newCursorPos;
      }
    });
  }, []);

  useEffect(() => {
    setTitleValue(surveyName);
  }, [surveyName]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSave = () => {
    if (titleValue.trim() && titleValue.trim() !== surveyName) {
      onUpdateSurveyName(titleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitleValue(surveyName);
      setIsEditingTitle(false);
    }
  };

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
    if (surveyStatus === 'active' && isDirty) {
      return (
        <span
          style={{ fontFamily: "'Open Sans', sans-serif" }}
          className="flex items-center justify-center rounded-[16px] border border-warning bg-warning-container px-2 py-1 text-sm font-normal text-on-warning-container min-w-[110px] h-[27px]"
        >
          Pending update
        </span>
      );
    }

    switch (surveyStatus) {
      case 'active':
        return (
          <span
            style={{ fontFamily: "'Open Sans', sans-serif" }}
            className="flex items-center justify-center rounded-[16px] border border-success bg-success-container px-2 py-1 text-sm font-normal text-on-success-container min-w-[56px] h-[27px]"
          >
            Active
          </span>
        );
      case 'stopped':
        return (
          <span
            style={{ fontFamily: "'Open Sans', sans-serif" }}
            className="flex items-center justify-center rounded-[16px] border border-error bg-error-container px-2 py-1 text-sm font-normal text-on-error-container min-w-[71px] h-[27px]"
          >
            Stopped
          </span>
        );
      case 'draft':
      default:
        return (
          <span
            style={{ fontFamily: "'Open Sans', sans-serif" }}
            className="flex items-center justify-center rounded-[16px] border border-outline bg-surface-container-high px-2 py-1 text-sm font-normal text-on-surface min-w-[56px] h-[27px]"
          >
            Draft
          </span>
        );
    }
  };

  return (
    <header className="flex items-center justify-between bg-surface-container border-b border-outline-variant px-5 py-2.5 flex-shrink-0 relative z-50">
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
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            onPaste={createPasteHandler(setTitleValue)}
            className="text-base font-medium bg-surface-container-highest border-b border-primary focus:outline-none ml-4"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          />
        ) : (
          <h1
            onClick={() => setIsEditingTitle(true)}
            className="text-base font-medium text-on-surface ml-4 cursor-pointer"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {surveyName}
          </h1>
        )}
        <div className="flex items-center text-sm text-on-surface-variant ml-4" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          {renderStatusBadge()}
          {surveyStatus === 'active' && isDirty && (
            <button
              onClick={onUpdateLiveSurvey}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-on-success bg-success rounded-md hover:opacity-90 transition-opacity ml-2"
            >
              <PublishIcon className="text-base leading-none" />
              <span>Update</span>
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-5">
        <label htmlFor="activate-survey-toggle" className="flex items-center cursor-pointer">
          <span className="text-sm font-medium text-on-surface mr-3" style={{ fontFamily: "'Open Sans', sans-serif" }}>Activate</span>
          <div className="relative">
            <input
              type="checkbox"
              id="activate-survey-toggle"
              className="sr-only peer"
              checked={surveyStatus === 'active'}
              onChange={onToggleActivateSurvey}
            />
            <div className="w-10 h-6 bg-outline rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </div>
        </label>



        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyClick}
            className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${isCopied
              ? 'bg-success text-on-success'
              : 'border border-outline text-on-surface hover:bg-surface-container-high'
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
              : 'hover:bg-surface-container-high'
              }`}
            aria-label="AI Features"
            aria-pressed={isGeminiPanelOpen}
          >
            <SparkleIcon className="text-2xl" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-container-high rounded-md transition-colors" aria-label="Notifications">
            <BellIcon className="text-2xl" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-container-high rounded-md transition-colors" aria-label="Help">
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
            <div className="absolute right-0 mt-2 w-64 bg-surface-container rounded-md shadow-lg ring-1 ring-black/5 dark:ring-outline-variant z-30">
              <div className="py-1">
                <div className="px-4 py-2 border-b border-outline-variant">
                  <p className="text-sm text-on-surface-variant" id="user-menu-email-label">Signed in as</p>
                  <p className="text-sm font-medium text-on-surface truncate" aria-labelledby="user-menu-email-label">tamyres.lucas@voxco.com</p>
                  <p className="text-xs text-on-surface-variant mt-1">Version: {currentVersion}</p>
                </div>
                <div className="p-2">
                  <div className="flex justify-between items-center px-2 py-1">
                    <span className="text-sm font-medium text-on-surface">Theme</span>
                    <div className="flex items-center rounded-full bg-surface-container-high p-1">
                      <button onClick={() => setTheme('light')} className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${theme === 'light' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`} aria-label="Switch to light mode">
                        <SunIcon className="text-base" />
                      </button>
                      <button onClick={() => setTheme('dark')} className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${theme === 'dark' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`} aria-label="Switch to dark mode">
                        <MoonIcon className="text-base" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-outline-variant">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsChangelogOpen(true);
                      }}
                      className="w-full text-left px-2 py-1.5 text-sm text-on-surface hover:bg-surface-container-high rounded-md flex items-center gap-2 transition-colors"
                    >
                      <HistoryIcon className="text-base text-on-surface-variant" />
                      See app changelog
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {isChangelogOpen && <AppChangelogModal onClose={() => setIsChangelogOpen(false)} />}
    </header>
  );
});

export default Header;