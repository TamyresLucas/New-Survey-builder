import React from 'react';

export const DropIndicator = ({ small = false }: { small?: boolean }) => (
    <div className={`px-4 ${small ? 'my-0' : 'my-1'}`}>
        <div className="relative h-px w-full bg-primary">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
        </div>
    </div>
);
