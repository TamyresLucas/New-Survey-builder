import React, { useMemo } from 'react';
import type { Question } from '../../../types';
import { QuestionType } from '../../../types';
import { Toggle } from '../../Toggle';

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
                        <Toggle
                            id="question-auto-advance"
                            checked={question.autoAdvance ?? false}
                            onChange={(checked) => onUpdate({ autoAdvance: checked })}
                        />
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
                    <Toggle
                        id="hide-back-button"
                        checked={!!question.hideBackButton}
                        onChange={(checked) => onUpdate({ hideBackButton: checked })}
                    />
                </div>
            </div>
        </div>
    );
};

export default NavigationSettings;
