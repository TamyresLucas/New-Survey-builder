import React, { useState, useEffect, useRef, memo } from 'react';
import { LinkIcon, BellIcon, QuestionIcon, GridIcon, CheckmarkIcon, SunIcon, MoonIcon, SparkleIcon } from './icons';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  surveyName: string;
  isGeminiPanelOpen: boolean;
  onToggleGeminiPanel: () => void;
  onUpdateSurveyName: (name: string) => void;
}

type SurveyStatus = 'draft' | 'active' | 'stopped';

const Header: React.FC<HeaderProps> = memo(({ surveyName, isGeminiPanelOpen, onToggleGeminiPanel, onUpdateSurveyName }) => {
  const [surveyStatus, setSurveyStatus] = useState<SurveyStatus>('draft');
  const [isCopied, setIsCopied] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(surveyName);
  const titleInputRef = useRef<HTMLInputElement>(null);

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


  const handleToggle = () => {
    setSurveyStatus(prev => prev === 'active' ? 'stopped' : 'active');
  };

  const handleCopyClick = () => {
    setIsCopied(true);
  };

  const renderStatusBadge = () => {
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
    <header className="flex items-center justify-between bg-surface-container border-b border-outline-variant px-5 py-2.5 flex-shrink-0">
      <div className="flex items-center">
        <GridIcon className="text-2xl text-on-surface" />
        <span
          className="font-extrabold text-xl leading-tight text-on-surface ml-4"
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
        <div className="h-5 w-px bg-outline-variant mx-4"></div>
        <div className="flex items-center text-sm text-on-surface-variant space-x-3" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          <span>Saved at 5:29 PM</span>
          {renderStatusBadge()}
        </div>
      </div>
      <div className="flex items-center space-x-5">
        <label htmlFor="activate-survey-toggle" className="flex items-center cursor-pointer">
          <span className="text-sm font-medium text-on-surface mr-3" style={{ fontFamily: "'Open Sans', sans-serif" }}>Activate survey</span>
          <div className="relative">
            <input
              type="checkbox"
              id="activate-survey-toggle"
              className="sr-only peer"
              checked={surveyStatus === 'active'}
              onChange={handleToggle}
            />
            <div className="w-10 h-6 bg-outline rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </div>
        </label>
        
        <div className="flex items-center space-x-2">
            <button 
                onClick={handleCopyClick}
                className={`w-9 h-9 rounded-md transition-colors flex items-center justify-center ${
                    isCopied 
                    ? 'bg-success text-on-success' 
                    : 'border border-outline text-on-surface-variant hover:bg-surface-container-high'
                }`} 
                aria-label={isCopied ? "Link copied" : "Copy link"}
            >
                {isCopied ? <CheckmarkIcon className="text-xl" /> : <LinkIcon className="text-xl" />}
            </button>
            <div className="h-6 w-px bg-outline-variant mx-1"></div>
            <button 
                onClick={onToggleGeminiPanel} 
                className={`p-1.5 text-on-surface rounded-full transition-colors ${
                    isGeminiPanelOpen 
                    ? 'bg-primary-container' 
                    : 'hover:bg-surface-container-high'
                }`} 
                aria-label="AI Features" 
                aria-pressed={isGeminiPanelOpen}
            >
                <SparkleIcon className="text-2xl" />
            </button>
            <button className="p-1.5 text-on-surface hover:bg-surface-container-high rounded-full transition-colors" aria-label="Notifications">
                <BellIcon className="text-2xl" />
            </button>
            <button className="text-on-surface hover:opacity-80 transition-opacity" aria-label="Help">
                <QuestionIcon className="text-2xl" />
            </button>
        </div>

        <div className="relative" ref={userMenuRef}>
          <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ring-offset-surface-container">
            <img src="https://i.pravatar.cc/40?img=32" alt="User Avatar" className="h-9 w-9 rounded-full" />
          </button>
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container rounded-md shadow-lg ring-1 ring-black/5 dark:ring-outline-variant z-30">
              <div className="py-1">
                <div className="px-4 py-2 border-b border-outline-variant">
                  <p className="text-sm text-on-surface-variant" id="user-menu-email-label">Signed in as</p>
                  <p className="text-sm font-medium text-on-surface truncate" aria-labelledby="user-menu-email-label">user@example.com</p>
                </div>
                <div className="p-2">
                  <div className="flex justify-between items-center px-2 py-1">
                    <span className="text-sm font-medium text-on-surface">Theme</span>
                    <div className="flex items-center rounded-full bg-surface-container-high p-1">
                        <button onClick={() => setTheme('light')} className={`p-1 rounded-full transition-colors ${theme === 'light' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant'}`} aria-label="Switch to light mode">
                            <SunIcon className="text-base" />
                        </button>
                        <button onClick={() => setTheme('dark')} className={`p-1 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant'}`} aria-label="Switch to dark mode">
                            <MoonIcon className="text-base" />
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

export default Header;