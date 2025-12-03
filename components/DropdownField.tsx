import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './icons';

export interface DropdownOption {
    value: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    iconColor?: string; // e.g. 'text-primary', 'text-error'
    disabled?: boolean;
}

interface DropdownFieldProps {
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
    className?: string;
    disabled?: boolean;
}

export const DropdownField: React.FC<DropdownFieldProps> = ({
    value,
    options,
    onChange,
    className = '',
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: DropdownOption) => {
        if (option.disabled) return;
        onChange(option.value);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                onClick={() => !disabled && setIsOpen(prev => !prev)}
                disabled={disabled}
                className={`w-full h-[32px] flex items-center justify-between border rounded-md px-2 text-sm text-left transition-colors ${disabled
                    ? 'bg-surface-container-high border-input-border text-on-surface-variant/70 cursor-not-allowed'
                    : 'bg-transparent border-input-border text-on-surface hover:border-input-border-hover focus:outline-2 focus:outline-offset-2 focus:outline-primary'
                    }`}
            >
                <div className="flex items-center truncate">
                    {selectedOption?.icon && (
                        <div className="w-[19px] h-[19px] flex-shrink-0 flex items-center justify-center mr-2">
                            <selectedOption.icon className={`text-base ${selectedOption.iconColor || 'text-primary'}`} />
                        </div>
                    )}
                    <span className="truncate leading-[19px]">{selectedOption?.label || value}</span>
                </div>
                <ChevronDownIcon className="text-base text-on-surface-variant flex-shrink-0" />
            </button>
            {isOpen && (
                <ul className="absolute top-full left-0 right-0 mt-1 w-full max-h-60 overflow-y-auto bg-surface-container border border-outline-variant rounded-md shadow-lg z-20 py-1">
                    {options.map((option) => (
                        <li key={option.value}>
                            <button
                                onClick={() => handleSelect(option)}
                                disabled={option.disabled}
                                className={`w-full text-left px-2 py-2 text-sm flex items-center ${option.disabled
                                    ? 'text-on-surface-disabled cursor-not-allowed'
                                    : 'text-on-surface hover:bg-surface-container-high'
                                    }`}
                            >
                                {option.icon && (
                                    <div className="w-[19px] h-[19px] flex-shrink-0 flex items-center justify-center mr-2">
                                        <option.icon className={`text-base ${option.disabled ? 'text-on-surface-disabled' : (option.iconColor || 'text-primary')}`} />
                                    </div>
                                )}
                                <span className="truncate leading-[19px]">{option.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
