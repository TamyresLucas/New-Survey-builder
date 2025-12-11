import React from 'react';

interface ToggleProps {
    id?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'large' | 'small';
}

export const Toggle: React.FC<ToggleProps> = ({
    id,
    checked,
    onChange,
    disabled = false,
    size = 'large'
}) => {
    const isLarge = size === 'large';

    // Large: 36x24 container, 36x20 track, 16x16 button
    // Small: 25x14 container, 24x14 track, 10x10 button
    const containerHeight = isLarge ? 24 : 14;
    const trackHeight = isLarge ? 20 : 14;
    const buttonSize = isLarge ? 16 : 10;

    return (
        <div className={`relative ${isLarge ? 'w-9 h-6' : 'w-[25px] h-[14px]'}`}>
            <input
                type="checkbox"
                id={id}
                className="sr-only"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            <label
                htmlFor={id}
                className={`block ${isLarge ? 'w-9 h-6' : 'w-[25px] h-[14px]'} cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {/* Track */}
                <div
                    className={`absolute ${isLarge ? 'w-9 h-5' : 'w-6 h-[14px]'} rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-outline'
                        }`}
                    style={{
                        top: `calc(50% - ${trackHeight / 2}px)`,
                        left: 0
                    }}
                />
                {/* Button */}
                <div
                    className={`absolute ${isLarge ? 'w-4 h-4' : 'w-[10px] h-[10px]'} bg-white rounded-full transition-all`}
                    style={{
                        top: `calc(50% - ${buttonSize / 2}px)`,
                        left: checked ? (isLarge ? '18px' : 'calc(100% - 12px)') : '2px',
                        boxShadow: '0px 2px 4px rgba(39, 39, 39, 0.1)'
                    }}
                />
            </label>
        </div>
    );
};
