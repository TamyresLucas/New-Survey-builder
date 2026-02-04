import React, { useState, useEffect } from 'react';
import { EditableText } from './EditableText';

interface SurveyTitleEditorProps {
    displayTitle: string;
    onUpdateDisplayTitle: (title: string) => void;
    maxLength?: number;
    readOnly?: boolean;
}

export const SurveyTitleEditor: React.FC<SurveyTitleEditorProps> = ({
    displayTitle,
    onUpdateDisplayTitle,
    maxLength = 100,
    readOnly = false,
}) => {
    const [charCount, setCharCount] = useState(displayTitle.length);

    useEffect(() => {
        setCharCount(displayTitle.length);
    }, [displayTitle]);

    const handleChange = (newTitle: string) => {
        // Truncate to max length
        const truncated = newTitle.slice(0, maxLength);
        const trimmed = truncated.trim();

        // Always update if there's valid content
        if (trimmed) {
            onUpdateDisplayTitle(trimmed);
            setCharCount(trimmed.length);
        }
    };

    return (
        <div className="mb-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="relative">
                    <EditableText
                        html={displayTitle || 'Add survey title...'}
                        onChange={handleChange}
                        className="text-3xl font-bold text-on-surface"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                        readOnly={readOnly}
                    />
                    {!readOnly && (
                        <div className="absolute -bottom-6 right-0 text-xs text-on-surface-variant">
                            {charCount}/{maxLength}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
