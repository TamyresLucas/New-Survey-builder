import React from 'react';
import { Label, Input } from '@voxco/design-system';
import { cn } from '@voxco/design-system';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const FormFieldAdapter = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, className, containerClassName, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        <Label htmlFor={inputId} className={cn(error && "text-destructive")}>
          {label}
        </Label>
        <Input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormFieldAdapter.displayName = 'FormFieldAdapter';