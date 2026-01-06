import React from 'react';
import { SidebarToolboxItem } from './SidebarToolboxItem';
import { ContentPasteIcon, ChevronRightIcon } from './icons';
import { Button } from './Button';

interface SidebarLibrarySurveyProps {
    id: string;
    title: string;
    isDragged: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onClick?: () => void;
    isExpanded?: boolean;
}

export const SidebarLibrarySurvey: React.FC<SidebarLibrarySurveyProps> = ({
    id,
    title,
    isDragged,
    onDragStart,
    onDragEnd,
    onClick,
    isExpanded = false
}) => {
    return (
        <SidebarToolboxItem
            icon={ContentPasteIcon} // Used as the identity icon for Surveys (clipboard style)
            label={title}
            isDragged={isDragged}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={`bg-surface`} // Main surface color token
            endAction={
                <Button variant="tertiary" size="small" iconOnly onClick={onClick}>
                    <ChevronRightIcon className={`text-base leading-none transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                </Button>
            }
        />
    );
};
