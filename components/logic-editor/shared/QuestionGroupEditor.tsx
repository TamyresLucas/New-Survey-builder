
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Question, Survey } from '../../../types';
import { ChevronDownIcon, CheckmarkIcon } from '../../icons';

interface QuestionGroupEditorProps {
    question: Question;
    survey: Survey;
    onUpdate: (updates: Partial<Question>) => void;
}

export const QuestionGroupEditor: React.FC<QuestionGroupEditorProps> = ({ question, survey, onUpdate }) => {
    const [inputValue, setInputValue] = useState(question.groupName || '');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setInputValue(question.groupName || '');
    }, [question.groupName]);

    const existingGroups = useMemo(() => {
        const groups = new Set<string>();
        survey.blocks.forEach(block => {
            block.questions.forEach(q => {
                if (q.groupName) {
                    groups.add(q.groupName);
                }
            });
        });
        return Array.from(groups).sort();
    }, [survey]);

    const filteredGroups = useMemo(() => {
        if (!inputValue) {
            return existingGroups;
        }
        return existingGroups.filter(group => 
            group.toLowerCase().includes(inputValue.toLowerCase())
        );
    }, [existingGroups, inputValue]);

    const isCreatingNew = useMemo(() => {
        const trimmedInput = inputValue.trim();
        return trimmedInput && !existingGroups.some(g => g.toLowerCase() === trimmedInput.toLowerCase());
    }, [inputValue, existingGroups]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                const trimmedValue = inputValue.trim();
                if (trimmedValue !== (question.groupName || '')) {
                     onUpdate({ groupName: trimmedValue || undefined });
                }
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [containerRef, inputValue, onUpdate, question.groupName]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (!isDropdownOpen) {
            setIsDropdownOpen(true);
        }
    };

    const handleOptionClick = (group: string) => {
        setInputValue(group);
        onUpdate({ groupName: group });
        setIsDropdownOpen(false);
    };

    const handleInputFocus = () => {
        setIsDropdownOpen(true);
    };
    
    const confirmNewGroup = () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue) {
            onUpdate({ groupName: trimmedValue });
        }
        setIsDropdownOpen(false);
        inputRef.current?.blur();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            confirmNewGroup();
        } else if (e.key === 'Escape') {
            setIsDropdownOpen(false);
            inputRef.current?.blur();
        }
    };
    
    const handleIconClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isCreatingNew) {
            confirmNewGroup();
        } else {
            setIsDropdownOpen(prev => !prev);
            if (!isDropdownOpen) {
                inputRef.current?.focus();
            }
        }
    };

    return (
        <div ref={containerRef}>
            <label htmlFor="question-group-name" className="block text-sm font-medium text-on-surface mb-1">
                Question Group
            </label>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    id="question-group-name"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-surface border border-outline rounded-md p-2 pr-10 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                    placeholder="Enter or select a group name..."
                    autoComplete="off"
                />
                <button
                    type="button"
                    onClick={handleIconClick}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-on-surface-variant hover:bg-surface-container-high"
                    aria-label={isCreatingNew ? "Confirm new group" : "Toggle dropdown"}
                >
                    {isCreatingNew ? <CheckmarkIcon className="text-xl text-primary" /> : <ChevronDownIcon className="text-xl" />}
                </button>
                
                {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 w-full max-h-60 overflow-y-auto bg-surface-container border border-outline-variant rounded-md shadow-lg z-20 py-1">
                        <ul>
                            {filteredGroups.length > 0 ? (
                                filteredGroups.map(group => (
                                    <li key={group}>
                                        <button
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleOptionClick(group);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm flex items-center justify-between text-on-surface hover:bg-surface-container-high"
                                        >
                                            <span>{group}</span>
                                            {question.groupName === group && <CheckmarkIcon className="text-base text-primary" />}
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-2 text-sm text-on-surface-variant italic">
                                    {inputValue ? 'No matching groups. Press Enter or click checkmark to create.' : 'No existing groups.'}
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">Group questions to use in randomization rules.</p>
        </div>
    );
};