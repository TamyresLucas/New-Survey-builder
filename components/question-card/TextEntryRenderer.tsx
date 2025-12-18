import React from 'react';
import type { Question } from '../../types';

interface TextEntryRendererProps {
    question: Question;
}

export const TextEntryRenderer: React.FC<TextEntryRendererProps> = ({ question }) => {
    return (
        <div className="mt-4">
            <textarea
                className="w-full bg-transparent border border-input-border rounded-md p-2 text-sm text-on-surface resize-y cursor-default hover:border-input-border-hover transition-colors"
                rows={question.textEntrySettings?.answerLength === 'long' ? 8 : 1}
                placeholder={question.textEntrySettings?.placeholder || ''}
                readOnly
            />
        </div>
    );
};
