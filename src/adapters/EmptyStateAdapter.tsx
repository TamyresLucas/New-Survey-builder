import React from 'react';
import { cn } from '@voxco/design-system';

interface EmptyStateAdapterProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyStateAdapter: React.FC<EmptyStateAdapterProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center space-y-4 border-2 border-dashed rounded-lg bg-muted/50", className)}>
      {icon && (
        <div className="bg-background p-3 rounded-full shadow-sm text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground text-pretty">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  );
};