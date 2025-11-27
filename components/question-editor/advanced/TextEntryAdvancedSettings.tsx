import React from 'react';
import type { Question } from '../../../types';
import { ChevronDownIcon } from '../../icons';

const TextEntryAdvancedSettings: React.FC<{ question: Question, onUpdate: (updates: Partial<Question>) => void }> = ({ question, onUpdate }) => {
    const textEntrySettings = question.textEntrySettings || {};
    const advanced = textEntrySettings.advanced || {};

    const handleUpdateSettings = (updates: Partial<typeof textEntrySettings>) => {
        onUpdate({ textEntrySettings: { ...textEntrySettings, ...updates } });
    };

    const handleUpdateAdvanced = (updates: Partial<typeof advanced>) => {
        handleUpdateSettings({ advanced: { ...advanced, ...updates } });
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                        <label htmlFor="show-char-counter" className="text-sm font-medium text-on-surface block">Show Character Counter</label>
                        <p className="text-xs text-on-surface-variant mt-0.5">Display character count below text box</p>
                    </div>
                    <input type="checkbox" id="show-char-counter" checked={advanced.showCharCounter || false} onChange={(e) => handleUpdateAdvanced({ showCharCounter: e.target.checked })} className="w-5 h-5 accent-primary cursor-pointer border border-outline rounded" />
                </div>
                {advanced.showCharCounter && (
                    <div className="ml-4 mb-4 p-3 bg-surface-container-high rounded-md">
                        <label htmlFor="counter-type" className="block text-sm font-medium text-on-surface-variant mb-1">Counter Display</label>
                        <div className="relative">
                            <select
                                id="counter-type"
                                value={advanced.counterType || 'remaining'}
                                onChange={(e) => handleUpdateAdvanced({ counterType: e.target.value as any })}
                                className="w-full bg-transparent border border-input-border rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                            >
                                <option value="remaining">Characters Remaining</option>
                                <option value="used">Characters Used</option>
                                <option value="both">Both (Used / Maximum)</option>
                            </select>
                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                        </div>
                    </div>
                )}
                {textEntrySettings.answerLength === 'long' && (
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                            <label htmlFor="auto-resize" className="text-sm font-medium text-on-surface block">Auto-resize Text Box</label>
                            <p className="text-xs text-on-surface-variant mt-0.5">Expand text box as respondent types</p>
                        </div>
                        <input type="checkbox" id="auto-resize" checked={advanced.autoResize || false} onChange={(e) => handleUpdateAdvanced({ autoResize: e.target.checked })} className="w-5 h-5 accent-primary cursor-pointer border border-outline rounded" />
                    </div>
                )}
                <div className="mb-4">
                    <label htmlFor="text-box-width" className="block text-sm font-medium text-on-surface-variant mb-1">Text Box Width</label>
                    <div className="relative">
                        <select
                            id="text-box-width"
                            value={advanced.textBoxWidth || 'full'}
                            onChange={(e) => handleUpdateAdvanced({ textBoxWidth: e.target.value as any })}
                            className="w-full bg-transparent border border-input-border rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                        >
                            <option value="full">Full Width (100%)</option>
                            <option value="large">Large (75%)</option>
                            <option value="medium">Medium (50%)</option>
                            <option value="small">Small (25%)</option>
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">Narrower boxes can signal expected answer length</p>
                </div>
            </div>
        </div>
    );
};

export default TextEntryAdvancedSettings;
