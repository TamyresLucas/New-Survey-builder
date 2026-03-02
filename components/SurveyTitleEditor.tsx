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
    const [isEditing, setIsEditing] = useState(false);

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
                        html={displayTitle ?? 'Add survey title...'}
                        onChange={handleChange}
                        className="font-survey text-3xl font-semibold text-on-surface"
                        readOnly={readOnly}
                        onFocus={() => setIsEditing(true)}
                        onBlur={() => setIsEditing(false)}
                    />
                    <div className="flex items-center justify-between mt-2 mb-8">
                        <div className="w-16 h-1 bg-primary"></div>
                        {!readOnly && isEditing && (
                            <div className="text-xs text-on-surface-variant animate-in fade-in slide-in-from-right-1 duration-200">
                                {charCount}/{maxLength}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
