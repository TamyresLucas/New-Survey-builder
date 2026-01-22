import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  cn
} from '@voxco/design-system';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldAdapterProps {
  label?: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const SelectFieldAdapter: React.FC<SelectFieldAdapterProps> = ({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  error,
  disabled,
  className,
  id
}) => {
  const generatedId = React.useId();
  const selectId = id || generatedId;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={selectId} className={cn(error && "text-destructive")}>
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={selectId} className={cn("border-input border rounded-md", error && "border-destructive focus:ring-destructive")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};