import React, { ReactNode } from 'react';
import { DragIndicatorIcon } from './icons';

interface SidebarCardProps {
    id: string;
    title: string | ReactNode;
    subtitle?: string | ReactNode;
    icon?: React.ElementType;
    isSelected?: boolean;
    isHovered?: boolean;
    isDragged?: boolean;
    isCollapsed?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
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
    isHovered,
    isDragged,
    isCollapsed,
    onClick,
    onMouseEnter,
    onMouseLeave,
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
                className={`
                    mx-2 mb-2 rounded-lg border transition-all
                    ${isDragged ? 'opacity-30' : ''}
                    ${isSelected ? 'border-2 border-primary shadow-md' :
                        isHovered ? 'border-primary/50 shadow-sm' :
                            'border-outline-variant'}
                    ${className}
                `}
            >
                <div
                    draggable={!!onDragStart}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onClick={onClick}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    className={`px-4 h-[40px] cursor-pointer flex items-center justify-between group rounded-t-md ${isCollapsed ? 'rounded-b-md' : 'border-b border-outline-variant'} ${isSelected ? 'bg-primary text-on-primary' : isHovered ? 'bg-surface-container-lowest' : 'bg-surface-container hover:bg-surface-container-lowest'}`}
                >
                    <div className="flex items-center cursor-grab flex-grow truncate">
                        <div className="relative w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center">
                            <Icon className={`text-base leading-none absolute inset-0 transition-opacity group-hover:opacity-0 ${isSelected ? 'text-on-primary' : iconColorClass}`} />
                            <DragIndicatorIcon className={`text-base leading-none absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100 ${isSelected ? 'text-on-primary' : 'text-on-surface-variant'}`} />
                        </div>
                        <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-on-primary' : 'text-on-surface'}`}>
                            {title}
                        </h3>
                        {subtitle}
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                        {actionsMenuRef && (
                            <div
                                ref={actionsMenuRef}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button className={`p-1 rounded-full hover:bg-black/10 transition-colors ${isSelected ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                                    <MoreIcon className="text-xl" />
                                </button>
                                {actionsMenu}
                            </div>
                        )}
                    </div>
                </div>
                {!isCollapsed && children && (
                    <div className="bg-surface-container rounded-b-md">
                        {children}
                    </div>
                )}
            </div>
        </React.Fragment>
    );
};

export default SidebarCard;
