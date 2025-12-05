import React from 'react';
import type { Question } from '../../../types';
import { ChevronDownIcon } from '../../icons';
import { DropdownField } from '../../DropdownField';

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
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="show-char-counter"
                            checked={advanced.showCharCounter || false}
                            onChange={(e) => handleUpdateAdvanced({ showCharCounter: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-outline peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                {advanced.showCharCounter && (
                    <div className="ml-4 mb-4 p-3 bg-surface-container-high rounded-md">
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Counter Display</label>
                        <DropdownField
                            value={advanced.counterType || 'remaining'}
                            onChange={(val) => handleUpdateAdvanced({ counterType: val as any })}
                            options={[
                                { value: 'remaining', label: 'Characters Remaining' },
                                { value: 'used', label: 'Characters Used' },
                                { value: 'both', label: 'Both (Used / Maximum)' }
                            ]}
                        />
                    </div>
                )}
                {textEntrySettings.answerLength === 'long' && (
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                            <label htmlFor="auto-resize" className="text-sm font-medium text-on-surface block">Auto-resize Text Box</label>
                            <p className="text-xs text-on-surface-variant mt-0.5">Expand text box as respondent types</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="auto-resize"
                                checked={advanced.autoResize || false}
                                onChange={(e) => handleUpdateAdvanced({ autoResize: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-outline peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                )}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Text Box Width</label>
                    <DropdownField
                        value={advanced.textBoxWidth || 'full'}
                        onChange={(val) => handleUpdateAdvanced({ textBoxWidth: val as any })}
                        options={[
                            { value: 'full', label: 'Full Width (100%)' },
                            { value: 'large', label: 'Large (75%)' },
                            { value: 'medium', label: 'Medium (50%)' },
                            { value: 'small', label: 'Small (25%)' }
                        ]}
                    />
                    <p className="text-xs text-on-surface-variant mt-1">Narrower boxes can signal expected answer length</p>
                </div>
            </div>
        </div>
    );
};

export default TextEntryAdvancedSettings;
