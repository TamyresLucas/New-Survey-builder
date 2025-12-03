import React from 'react';
import type { Question } from '../../../types';
import { QuestionType } from '../../../types';
import { ChevronDownIcon } from '../../icons';

const ChoiceLayoutEditor: React.FC<{ question: Question, onUpdate: (updates: Partial<Question>) => void }> = ({ question, onUpdate }) => {
    const isChoiceGrid = question.type === QuestionType.ChoiceGrid;

    const handleUpdate = (updates: Partial<Question>) => {
        onUpdate(updates);
    };

    return (
        <div className="space-y-6">
            {!isChoiceGrid && (
                <div>
                    <h3 className="text-sm font-medium text-on-surface mb-2">Display & Layout</h3>
                    <p className="text-xs text-on-surface-variant mb-4">Fine-tune the appearance of choices.</p>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="choice-orientation" className="block text-sm font-medium text-on-surface-variant mb-1">Choice Orientation</label>
                            <div className="relative">
                                <select
                                    id="choice-orientation"
                                    value={question.advancedSettings?.choiceOrientation || 'vertical'}
                                    onChange={e => handleUpdate({ advancedSettings: { ...question.advancedSettings, choiceOrientation: e.target.value as any } })}
                                    className="w-full bg-transparent border border-input-border rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                >
                                    <option value="vertical">Vertical</option>
                                    <option value="horizontal">Horizontal</option>
                                    <option value="grid">Grid</option>
                                </select>
                                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                            </div>
                        </div>

                        {question.advancedSettings?.choiceOrientation === 'grid' && (
                            <div>
                                <label htmlFor="num-columns" className="block text-sm font-medium text-on-surface-variant mb-1">Number of Columns</label>
                                <input
                                    type="number"
                                    id="num-columns"
                                    min="2"
                                    max="10"
                                    value={question.advancedSettings?.numColumns || 2}
                                    onChange={e => handleUpdate({ advancedSettings: { ...question.advancedSettings, numColumns: parseInt(e.target.value, 10) } })}
                                    className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="choice-width" className="block text-sm font-medium text-on-surface-variant mb-1">Choice Width</label>
                            <div className="relative">
                                <select
                                    id="choice-width"
                                    value={question.advancedSettings?.choiceWidth || 'auto'}
                                    onChange={e => handleUpdate({ advancedSettings: { ...question.advancedSettings, choiceWidth: e.target.value as any } })}
                                    className="w-full bg-transparent border border-input-border rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                >
                                    <option value="auto">Auto</option>
                                    <option value="full">Full Width</option>
                                    <option value="fixed">Fixed</option>
                                </select>
                                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className={!isChoiceGrid ? 'border-t border-outline-variant pt-6' : ''}>
                <h3 className="text-sm font-medium text-on-surface mb-2">Mobile Layout</h3>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <label htmlFor="enable-mobile-layout" className="text-sm font-medium text-on-surface block">
                            {isChoiceGrid ? 'Mobile-optimized layout' : 'Enable mobile-specific layout'}
                        </label>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                            {isChoiceGrid ? 'Display as an interactive accordion on mobile.' : 'Override display settings for mobile devices.'}
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="enable-mobile-layout"
                            checked={question.advancedSettings?.enableMobileLayout || false}
                            onChange={(e) => handleUpdate({ advancedSettings: { ...question.advancedSettings, enableMobileLayout: e.target.checked } })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-outline peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                {question.advancedSettings?.enableMobileLayout && !isChoiceGrid && (
                    <div className="mt-4 pl-4 border-l-2 border-outline-variant space-y-4">
                        <div>
                            <label htmlFor="mobile-choice-orientation" className="block text-sm font-medium text-on-surface-variant mb-1">Choice Orientation (Mobile)</label>
                            <div className="relative">
                                <select
                                    id="mobile-choice-orientation"
                                    value={question.advancedSettings?.mobile?.choiceOrientation || 'vertical'}
                                    onChange={e => handleUpdate({ advancedSettings: { ...question.advancedSettings, mobile: { ...question.advancedSettings?.mobile, choiceOrientation: e.target.value as any } } })}
                                    className="w-full bg-transparent border border-input-border rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                >
                                    <option value="vertical">Vertical</option>
                                    <option value="horizontal">Horizontal</option>
                                    <option value="grid">Grid</option>
                                </select>
                                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="mobile-choice-width" className="block text-sm font-medium text-on-surface-variant mb-1">Choice Width (Mobile)</label>
                            <div className="relative">
                                <select
                                    id="mobile-choice-width"
                                    value={question.advancedSettings?.mobile?.choiceWidth || 'auto'}
                                    onChange={e => handleUpdate({ advancedSettings: { ...question.advancedSettings, mobile: { ...question.advancedSettings?.mobile, choiceWidth: e.target.value as any } } })}
                                    className="w-full bg-transparent border border-input-border rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                >
                                    <option value="auto">Auto</option>
                                    <option value="full">Full Width</option>
                                    <option value="fixed">Fixed</option>
                                </select>
                                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChoiceLayoutEditor;
