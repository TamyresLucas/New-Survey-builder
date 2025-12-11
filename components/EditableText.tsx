import React, { useRef, useEffect } from 'react';

interface EditableTextProps {
    html: string;
    onChange: (html: string) => void;
    onFocus?: () => void;
    className?: string;
    style?: React.CSSProperties;
    readOnly?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({ html, onChange, onFocus, className, style, readOnly }) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const lastHtml = useRef(html);

    useEffect(() => {
        if (elementRef.current && html !== elementRef.current.innerHTML) {
            elementRef.current.innerHTML = html;
        }
        lastHtml.current = html;
    }, [html]);

    const handleBlur = () => {
        if (readOnly) return;
        const currentHtml = elementRef.current?.innerHTML || '';
        if (lastHtml.current !== currentHtml) {
            onChange(currentHtml);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        if (readOnly) {
            e.preventDefault();
            return;
        }
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        const selection = window.getSelection();
        if (!selection) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();

        const textNode = document.createTextNode(text);
        range.insertNode(textNode);

        // Move cursor to the end of the inserted text
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    };

    const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

    return (
        <div
            ref={elementRef}
            className={`${className || ''} outline-none border-b border-transparent focus:border-primary transition-colors ${readOnly ? 'cursor-default' : 'cursor-text hover:bg-surface-container-lowest'}`}
            style={style}
            contentEditable={!readOnly}
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: html }}
            onBlur={handleBlur}
            onFocus={readOnly ? undefined : onFocus}
            onClick={stopPropagation}
            onMouseDown={stopPropagation} // Also stop mousedown to prevent deselect logic
            onPaste={handlePaste}
        />
    );
};
