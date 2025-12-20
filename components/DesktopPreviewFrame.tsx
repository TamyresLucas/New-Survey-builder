import React, { forwardRef } from 'react';

interface DesktopPreviewFrameProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export const DesktopPreviewFrame = forwardRef<HTMLDivElement, DesktopPreviewFrameProps>(({ children, className, style }, ref) => {
    return (
        <div
            className={`flex flex-col border border-outline shadow-xl rounded-lg overflow-hidden bg-white dark:bg-neutral-900 w-full h-full max-w-5xl mx-auto ${className || ''}`}
            style={style}
            ref={ref}
        >
            {/* Browser Header / Toolbar */}
            <div className="bg-surface-container-high border-b border-outline px-4 py-2 flex items-center gap-4 flex-shrink-0">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-surface rounded px-3 py-1 text-xs text-on-surface-variant flex items-center justify-center opacity-70">
                    survey-preview.com
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-surface relative">
                {children}
            </div>
        </div>
    );
});

DesktopPreviewFrame.displayName = 'DesktopPreviewFrame';
