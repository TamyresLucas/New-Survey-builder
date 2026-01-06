import { DragIndicatorIcon } from './icons';

interface SidebarToolboxItemProps {
    icon: React.ElementType;
    label: string;
    isEnabled?: boolean;
    isDragged?: boolean;
    isDraggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
    className?: string; // Allow custom classes
    endAction?: React.ReactNode;
}

export const SidebarToolboxItem: React.FC<SidebarToolboxItemProps> = ({
    icon: Icon,
    label,
    isEnabled = true,
    isDragged = false,
    isDraggable = true,
    onDragStart,
    onDragEnd,
    className = '',
    endAction
}) => {
    return (
        <div
            draggable={isEnabled && isDraggable}
            onDragStart={isEnabled && isDraggable ? onDragStart : undefined}
            onDragEnd={isEnabled && isDraggable ? onDragEnd : undefined}
            className={`flex items-center justify-between px-4 h-[40px] border-b border-outline transition-all bg-surface-container group ${isEnabled ? 'hover:bg-surface-container-lowest cursor-grab' : 'cursor-not-allowed'
                } ${isDragged ? 'opacity-30' : ''} ${className}`}
        >
            <div className="flex items-center flex-grow truncate">
                <div className="relative w-5 h-5 mr-3 flex-shrink-0 flex items-center justify-center">
                    <Icon className={`text-xl leading-none absolute inset-0 transition-opacity group-hover:opacity-0 ${isEnabled ? 'text-primary' : 'text-on-surface-disabled'}`} />
                    <DragIndicatorIcon className={`text-xl leading-none absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100 ${isEnabled ? 'text-on-surface-variant' : 'text-on-surface-disabled'}`} />
                </div>
                <span className={`text-sm truncate ${isEnabled ? 'text-on-surface' : 'text-on-surface-disabled'}`} style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    {label}
                </span>
            </div>
            {endAction && (
                <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {endAction}
                </div>
            )}
        </div>
    );
};
