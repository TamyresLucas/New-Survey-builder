import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ChoiceGridNode } from '../../../types';
import { ChoiceGridIcon, RadioButtonUncheckedIcon } from '../../icons';
import { InputHandle } from './CustomNodeHandles';

const choiceHandleStyle = {
    width: 10,
    height: 10,
    background: 'var(--background--surface-bg-def)',
    border: '2px solid var(--diagram-edge-def)',
    zIndex: 50,
};

const ChoiceGridNodeComponent: React.FC<NodeProps<ChoiceGridNode>> = ({ data, selected }) => {
    return (
        <div className={`w-[450px] bg-surface-container border rounded-lg shadow-lg transition-all ${selected ? 'border-primary shadow-2xl' : 'border-outline'
            }`}>
            <header className="p-3 border-b border-outline bg-surface-container-high rounded-t-lg">
                <div className="flex items-center gap-2 min-w-0">
                    <ChoiceGridIcon className="text-lg text-on-surface-variant flex-shrink-0" />
                    <span className="font-bold text-sm text-on-surface flex-shrink-0 mr-1">{data.variableName}</span>
                    <p className="text-sm text-on-surface-variant truncate">
                        {data.question}
                    </p>
                </div>
            </header>
            <div className="relative p-3">
                <InputHandle highlighted={data.highlightInputHandle} />

                {data.description && (
                    <div className="mb-3 text-sm text-on-surface-variant italic">
                        {data.description}
                    </div>
                )}

                <div className="border border-outline rounded-md">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline">
                                <th className="p-2 text-left font-medium text-on-surface-variant w-1/3"></th>
                                {data.columns.map(col => (
                                    <th key={col.id} className="p-2 text-center font-medium text-on-surface-variant text-xs break-words max-w-[80px]">
                                        {col.text}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.map(row => (
                                <tr key={row.id} className="border-b border-outline last:border-0 hover:bg-surface-container-highest transition-colors relative">
                                    <td className="p-2 font-medium text-on-surface relative">
                                        {row.text}
                                    </td>
                                    {data.columns.map((col, colIndex) => (
                                        <td key={`${row.id}-${col.id}`} className="p-2 text-center relative">
                                            <RadioButtonUncheckedIcon className="inline-block text-lg text-input-border opacity-50" />
                                            {/* Output handle for each row, placed in the last column */}
                                            {colIndex === data.columns.length - 1 && (
                                                <Handle
                                                    type="source"
                                                    position={Position.Right}
                                                    id={row.id}
                                                    style={{
                                                        ...choiceHandleStyle,
                                                        borderColor: data.highlightSourceHandles ? 'var(--semantic-pri)' : 'var(--diagram-edge-def)',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        right: '-17px' // Aligns center with the card border (12px padding + 5px half-width)
                                                    }}
                                                />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default memo(ChoiceGridNodeComponent);
