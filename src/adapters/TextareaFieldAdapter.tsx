import React from 'react';
import { Label, Textarea } from '@voxco/design-system';
import { cn } from '@voxco/design-system';

interface TextareaFieldAdapterProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCount?: boolean;
  maxLength?: number;
  containerClassName?: string;
  helperText?: string;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}

export const TextareaFieldAdapter = React.forwardRef<HTMLTextAreaElement, TextareaFieldAdapterProps>(
  ({ label, error, showCount, maxLength, className, containerClassName, helperText, value, id, onPaste, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        <div className="flex justify-between items-center">
            {label && (
                <Label htmlFor={inputId} className={cn(error && "text-destructive")}>
                  {label}
                </Label>
            )}
            {showCount && (
                <span className={cn("text-xs text-muted-foreground", currentLength > (maxLength || 0) && "text-destructive")}>
                    {currentLength} {maxLength ? `/ ${maxLength}` : 'chars'}
                </span>
            )}
        </div>
        <Textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          onPaste={onPaste}
          className={cn(
            "border-input border rounded-md",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-sm text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

TextareaFieldAdapter.displayName = 'TextareaFieldAdapter';