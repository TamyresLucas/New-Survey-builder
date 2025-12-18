import React from 'react';

export const ChoiceDropIndicator = () => (
    <div className="relative h-px w-full bg-primary my-1 ml-6">
        <div className="absolute left-0 top-1-2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
    </div>
);

export const TableDropIndicator: React.FC<{ colSpan: number }> = ({ colSpan }) => (
    <tr className="h-0 p-0 m-0">
        <td colSpan={colSpan} className="p-0 border-0 h-0 m-0 relative">
            <div className="absolute inset-x-0 top-[-1px] h-px bg-primary">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
        </td>
    </tr>
);
