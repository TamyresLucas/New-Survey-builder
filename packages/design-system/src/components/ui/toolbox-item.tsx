import { GripVertical } from './icons';
import { cn } from '@/lib/utils';
import React from 'react';

interface ToolboxItemProps {
    /** Icon component to display */
    icon: React.ElementType;
    /** Label text */
    label: string;
    /** Whether the item is enabled (default: true) */
    isEnabled?: boolean;
    /** Whether the item is currently being dragged */
    isDragging?: boolean;
    /** Whether the item can be dragged (default: true) */
    isDraggable?: boolean;
    /** Drag start handler */
    onDragStart?: (e: React.DragEvent) => void;
    /** Drag end handler */
    onDragEnd?: (e: React.DragEvent) => void;
    /** Click handler (for non-draggable items) */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
}

export const ToolboxItem: React.FC<ToolboxItemProps> = ({
    icon: Icon,
    label,
    isEnabled = true,
    isDragging = false,
    isDraggable = true,
    onDragStart,
    onDragEnd,
    onClick,
    className = ''
}) => {
    const handleClick = () => {
        if (isEnabled && onClick) {
            onClick();
        }
    };

    return (
        <div
            role="button"
            tabIndex={isEnabled ? 0 : -1}
            aria-disabled={!isEnabled}
            aria-grabbed={isDragging}
            aria-label={`Add ${label} question`}
            draggable={isEnabled && isDraggable}
            onDragStart={isEnabled && isDraggable ? onDragStart : undefined}
            onDragEnd={isEnabled && isDraggable ? onDragEnd : undefined}
            onClick={handleClick}
            onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && isEnabled && onClick) {
                    e.preventDefault();
                    onClick();
                }
            }}
            className={cn(
                'flex items-center justify-between px-4 h-8 border-b transition-all group',
                // Border color based on state
                isEnabled ? 'border-primary/20' : 'border-primary/10',
                // Background: card normally, primary when dragging
                isDragging ? 'bg-primary' : 'bg-card',
                // Hover state (only when enabled and not dragging)
                isEnabled && !isDragging && 'hover:bg-muted',
                // Cursor based on state
                !isEnabled && 'cursor-not-allowed',
                isEnabled && isDraggable && !isDragging && 'cursor-grab',
                isEnabled && isDraggable && isDragging && 'cursor-grabbing',
                isEnabled && !isDraggable && 'cursor-pointer',
                // Dragging effect
                isDragging && 'shadow-md',
                className
            )}
        >
            <div className="flex items-center flex-grow truncate">
                <div className="relative w-5 h-5 mr-3 flex-shrink-0 flex items-center justify-center">
                    {/* Original icon - hidden on hover OR when dragging */}
                    <Icon
                        className={cn(
                            'text-lg leading-none transition-opacity duration-200',
                            // Hide when dragging or on hover (only when enabled)
                            isDragging && 'opacity-0',
                            isEnabled && !isDragging && 'group-hover:opacity-0',
                            // Color
                            isEnabled ? 'text-primary' : 'text-primary/40',
                            isDragging ? 'text-primary-foreground' : ''
                        )}
                    />
                    {/* Drag indicator - show on hover OR when dragging */}
                    {isEnabled && (
                        <div
                            className={cn(
                                'absolute inset-0 flex items-center justify-center transition-opacity duration-200',
                                isDragging ? 'text-primary-foreground' : 'text-muted-foreground',
                                // Show when dragging, or on hover
                                isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            )}
                        >
                            <GripVertical className="text-lg leading-none" />
                        </div>
                    )}
                </div>
                <span
                    className={cn(
                        'text-sm truncate',
                        isEnabled ? 'text-foreground' : 'text-primary/40',
                        isDragging ? 'text-primary-foreground' : ''
                    )}
                >
                    {label}
                </span>
            </div>
        </div>
    );
};