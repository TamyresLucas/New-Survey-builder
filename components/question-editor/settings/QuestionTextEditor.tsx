import React, { useState, useEffect, useCallback } from 'react';

interface QuestionTextEditorProps {
    text: string;
    onTextChange: (newText: string) => void;
}

const QuestionTextEditor: React.FC<QuestionTextEditorProps> = ({ text, onTextChange }) => {
    const [questionText, setQuestionText] = useState(text);

    useEffect(() => {
        setQuestionText(text);
    }, [text]);

    const handleTextBlur = () => {
        if (questionText.trim() !== text) {
            onTextChange(questionText.trim());
        }
    };

    const createPasteHandler = useCallback((onChange: (newValue: string) => void) => (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const clipboardText = e.clipboardData.getData('text/plain');
        const target = e.currentTarget;
        const start = target.selectionStart ?? 0;
        const end = target.selectionEnd ?? 0;
        const newValue = target.value.substring(0, start) + clipboardText + target.value.substring(end);
        onChange(newValue);
        const newCursorPos = start + clipboardText.length;
        requestAnimationFrame(() => {
            if (document.activeElement === target) {
                target.selectionStart = newCursorPos;
                target.selectionEnd = newCursorPos;
            }
        });
    }, []);

    return (
        <div>
            <label htmlFor="question-text" className="block text-sm font-medium text-on-surface-variant mb-1">
                Question Text
            </label>
            <textarea
                id="question-text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                onBlur={handleTextBlur}
                onPaste={createPasteHandler(setQuestionText)}
                rows={4}
                className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                placeholder="Enter your question here..."
            />
            <p className="text-xs text-on-surface-variant mt-1">Maximum 5000 characters</p>
        </div>
    );
};

export default QuestionTextEditor;