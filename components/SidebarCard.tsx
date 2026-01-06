import React, { ReactNode } from 'react';
import { DragIndicatorIcon } from './icons';

interface SidebarCardProps {
    id: string;
    title: string | ReactNode;
    subtitle?: string | ReactNode;
    icon?: React.ElementType;
    isSelected?: boolean;
    isDragged?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
    actionsMenu?: ReactNode;
    actionsMenuRef?: React.RefObject<HTMLDivElement>;
    children?: ReactNode;
    dropIndicator?: ReactNode;
    className?: string; // Allow custom classes if needed
    iconColorClass?: string;
}

export const SidebarCard: React.FC<SidebarCardProps> = ({
    id,
    title,
    subtitle,
    icon: Icon = DragIndicatorIcon,
    isSelected,
    isDragged,
    onClick,
    onDragStart,
    onDragEnd,
    actionsMenu,
    actionsMenuRef,
    children,
    dropIndicator,
    className = '',
    iconColorClass = 'text-on-surface-variant'
}) => {
    return (
        <React.Fragment>
            {dropIndicator}
            <div
                data-block-id={id}
                className={isDragged ? 'opacity-30' : ''}
            >
                <div
                    draggable={!!onDragStart}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onClick={onClick}
                    className={`px-4 h-[40px] cursor-pointer border-b border-t border-outline flex items-center justify-between group ${isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-lowest hover:border-outline-hover'} ${className}`}
                >
                    <div className="flex items-center cursor-grab flex-grow truncate">
                        <div className="relative w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center">
                            <Icon className={`text-base leading-none absolute inset-0 transition-opacity group-hover:opacity-0 ${isSelected ? 'text-on-primary' : iconColorClass}`} />
                            <DragIndicatorIcon className={`text-base leading-none absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100 ${isSelected ? 'text-on-primary' : 'text-on-surface-variant'}`} />
                        </div>
                        <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-on-primary' : 'text-on-surface'}`}>
                            {title}
                            {subtitle}
                        </h3>
                    </div>
                    {actionsMenu && (
                        <div className="relative flex-shrink-0" ref={actionsMenuRef}>
                            {actionsMenu}
                        </div>
                    )}
                </div>
                {children}
            </div>
        </React.Fragment>
    );
};

export default SidebarCard;
