import React, { useMemo } from 'react';
import type { Question } from '../../../types';
import { QuestionType } from '../../../types';

interface NavigationSettingsProps {
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
}

const NavigationSettings: React.FC<NavigationSettingsProps> = ({ question, onUpdate }) => {
    const isAutoadvanceable = useMemo(() => [QuestionType.Radio, QuestionType.ChoiceGrid].includes(question.type), [question.type]);

    return (
        <div className="space-y-6">
            {isAutoadvanceable && (
                <div>
                    <div className="flex items-center justify-between">
                        <div className="flex-1 pr-4">
                            <label htmlFor="question-auto-advance" className="text-sm font-medium text-on-surface block">
                                Autoadvance
                            </label>
                            <p className="text-xs text-on-surface-variant mt-0.5">Automatically move to the next page when this question is answered.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="question-auto-advance"
                                checked={question.autoAdvance ?? false}
                                onChange={(e) => onUpdate({ autoAdvance: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-outline peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            )}
            <div>
                <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                        <label htmlFor="hide-back-button" className="text-sm font-medium text-on-surface block">
                            Hide back button
                        </label>
                        <p className="text-xs text-on-surface-variant mt-0.5">Prevent respondent from going back from this question.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="hide-back-button"
                            checked={!!question.hideBackButton}
                            onChange={(e) => onUpdate({ hideBackButton: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-outline peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default NavigationSettings;
