import React, { useCallback } from 'react';
import type { Question } from '../../../types';
import { ChevronDownIcon } from '../../icons';

interface TextValidationSettingsProps {
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
}

const TextValidationSettings: React.FC<TextValidationSettingsProps> = ({ question, onUpdate }) => {
    const textEntrySettings = question.textEntrySettings || {};
    const validation = textEntrySettings.validation || {};

    const handleUpdateSettings = (updates: Partial<typeof textEntrySettings>) => {
        onUpdate({ textEntrySettings: { ...textEntrySettings, ...updates } });
    };

    const handleUpdateValidation = (updates: Partial<typeof validation>) => {
        handleUpdateSettings({ validation: { ...validation, ...updates } });
    };

    const createPasteHandler = useCallback((onChange: (newValue: string) => void) => (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="content-type" className="block text-sm font-medium text-on-surface-variant mb-1">Content Type Validation</label>
                <div className="relative">
                    <select
                        id="content-type"
                        value={validation.contentType || 'none'}
                        onChange={e => handleUpdateValidation({ contentType: e.target.value as any })}
                        className="w-full bg-transparent border border-input-border rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                    >
                        <option value="none">None (any text)</option>
                        <option value="email">Email Address</option>
                        <option value="phone">Phone Number</option>
                        <option value="number">Number Only</option>
                        <option value="url">URL/Website</option>
                        <option value="date">Date (YYYY-MM-DD)</option>
                        <option value="postal_code">Postal/Zip Code</option>
                        <option value="custom_regex">Custom Pattern (Regex)</option>
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                </div>
                {validation.contentType === 'custom_regex' && (
                    <div className="mt-2 ml-4 p-3 bg-surface-container-high rounded-md">
                        <label htmlFor="custom-regex" className="block text-sm font-medium text-on-surface-variant mb-1">Custom Regex Pattern</label>
                        <input
                            type="text"
                            id="custom-regex"
                            value={validation.customRegex || ''}
                            onChange={(e) => handleUpdateValidation({ customRegex: e.target.value })}
                            className="w-full bg-transparent border border-input-border rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary font-mono"
                            placeholder="^[A-Z]{2}[0-9]{4}$"
                        />
                    </div>
                )}
            </div>
            {(validation.contentType === 'none' || !validation.contentType) && (
                <div>
                    <label htmlFor="answer-length" className="block text-sm font-medium text-on-surface-variant mb-1">Answer Length</label>
                    <div className="relative">
                        <select
                            id="answer-length"
                            value={textEntrySettings.answerLength || 'long'}
                            onChange={e => handleUpdateSettings({ answerLength: e.target.value as any })}
                            className="w-full bg-transparent border border-input-border rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                        >
                            <option value="short">Short Answer</option>
                            <option value="long">Long Answer (8+ lines)</option>
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                    </div>
                </div>
            )}
            <div>
                <label htmlFor="placeholder" className="block text-sm font-medium text-on-surface-variant mb-1">Placeholder Text</label>
                <input
                    type="text"
                    id="placeholder"
                    value={textEntrySettings.placeholder || ''}
                    onChange={(e) => handleUpdateSettings({ placeholder: e.target.value })}
                    onPaste={createPasteHandler((newValue) => handleUpdateSettings({ placeholder: newValue }))}
                    className="w-full bg-transparent border border-input-border rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                    placeholder="e.g., Enter your answer here..."
                />
            </div>
        </div>
    );
};

export default TextValidationSettings;