import React, { forwardRef } from 'react';
import { SignalIcon, BatteryIcon } from './icons';

interface MobilePreviewFrameProps {
    children: React.ReactNode;
    onScroll?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export const MobilePreviewFrame = forwardRef<HTMLDivElement, MobilePreviewFrameProps>(({ children, onScroll, className, style }, ref) => {
    return (
        <div
            className={`relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[670px] w-[300px] shadow-xl ${className || ''}`}
            style={style}
        >
            <div className="w-[140px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-surface-container">
                <div className="px-4 py-2 flex justify-between items-center text-xs text-on-surface-variant font-sans font-bold">
                    <span>12:29</span>
                    <div className="flex items-center gap-1">
                        <SignalIcon className="text-base" />
                        <BatteryIcon className="text-base" />
                    </div>
                </div>
                <div ref={ref} onScroll={onScroll} className="p-4 overflow-y-auto h-[calc(100%-32px)]">
                    {children}
                </div>
            </div>
        </div>
    );
});

MobilePreviewFrame.displayName = 'MobilePreviewFrame';
