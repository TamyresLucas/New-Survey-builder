import React from 'react';

export interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    id?: string;
    disabled?: boolean;
    className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
    checked,
    onChange,
    label,
    id,
    disabled = false,
    className = '',
}) => {
    return (
        <label className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            {label && <span className="text-sm font-medium text-on-surface mr-3">{label}</span>}
            <div className="relative">
                <input
                    type="checkbox"
                    id={id}
                    className="sr-only peer"
                    checked={checked}
                    onChange={(e) => !disabled && onChange(e.target.checked)}
                    disabled={disabled}
                />
                <div className="w-10 h-6 bg-outline rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1"></div>
            </div>
        </label>
    );
};
