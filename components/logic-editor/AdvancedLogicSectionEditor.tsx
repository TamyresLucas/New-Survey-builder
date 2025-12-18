import React, { memo } from 'react';
import type { AdvancedLogic, ActionLogic } from '../../types';
import { generateId } from '../../utils';
import { PlusIcon, XIcon } from '../icons';
import { ActionEditor } from './shared';
import { Button } from '@/components/Button';
import { EditableText } from '@/components/EditableText';

export const AdvancedLogicSectionEditor: React.FC<{
    title: string;
    description: string;
    questionQid: string;
    advancedLogics: AdvancedLogic[];
    onUpdateAdvancedLogics: (advancedLogics: AdvancedLogic[]) => void;
    onAddAdvancedLogic: () => void;
}> = memo(({ title, description, questionQid, advancedLogics, onUpdateAdvancedLogics, onAddAdvancedLogic }) => {

    const handleAddAdvancedLogic = () => {
        const newLogic: AdvancedLogic = {
            id: generateId('wf'),
            wid: `${questionQid}-AL${advancedLogics.length + 1}`,
            name: `New Advanced Logic ${advancedLogics.length + 1}`,
            actions: [],
        };
        onUpdateAdvancedLogics([...advancedLogics, newLogic]);
        onAddAdvancedLogic();
    };

    const handleUpdateAdvancedLogic = (logicId: string, updates: Partial<AdvancedLogic>) => {
        onUpdateAdvancedLogics(advancedLogics.map(al => al.id === logicId ? { ...al, ...updates } : al));
    };

    const handleRemoveAdvancedLogic = (logicId: string) => {
        onUpdateAdvancedLogics(advancedLogics.filter(al => al.id !== logicId));
    };

    const handleAddAction = (logicId: string) => {
        const logic = advancedLogics.find(al => al.id === logicId);
        if (!logic) return;
        const newAction: ActionLogic = { id: generateId('act'), type: '', isConfirmed: false, params: {} };
        const newActions = [...logic.actions, newAction];
        handleUpdateAdvancedLogic(logicId, { actions: newActions });
    };

    const handleUpdateAction = (logicId: string, actionId: string, updates: Partial<ActionLogic>) => {
        const logic = advancedLogics.find(al => al.id === logicId);
        if (!logic) return;
        const newActions = logic.actions.map(act => act.id === actionId ? { ...act, ...updates, isConfirmed: false } : act);
        handleUpdateAdvancedLogic(logicId, { actions: newActions });
    };

    const handleRemoveAction = (logicId: string, actionId: string) => {
        const logic = advancedLogics.find(al => al.id === logicId);
        if (!logic) return;
        const newActions = logic.actions.filter(act => act.id !== actionId);
        handleUpdateAdvancedLogic(logicId, { actions: newActions });
    };

    const handleConfirmAction = (logicId: string, actionId: string) => {
        const logic = advancedLogics.find(al => al.id === logicId);
        if (!logic) return;
        const newActions = logic.actions.map(act => act.id === actionId ? { ...act, isConfirmed: true } : act);
        handleUpdateAdvancedLogic(logicId, { actions: newActions });
    };

    return (
        <div className="py-6 first:pt-0">
            <h3 className="text-sm font-medium text-on-surface">{title}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 mb-3">{description}</p>

            <div className="space-y-4">
                {advancedLogics.map(logic => (
                    <div key={logic.id} className="p-3 border border-outline-variant rounded-md">
                        <div className="flex items-center justify-between mb-2">
                            <EditableText html={logic.name} onChange={val => handleUpdateAdvancedLogic(logic.id, { name: val })} className="font-semibold text-on-surface" />
                            <Button variant="danger" iconOnly size="small" onClick={() => handleRemoveAdvancedLogic(logic.id)}><XIcon /></Button>
                        </div>
                        <div className="space-y-2">
                            {logic.actions.map(action => (
                                <ActionEditor
                                    key={action.id}
                                    action={action}
                                    onUpdate={(updates: Partial<ActionLogic>) => handleUpdateAction(logic.id, action.id, updates)}
                                    onRemove={() => handleRemoveAction(logic.id, action.id)}
                                    onConfirm={() => handleConfirmAction(logic.id, action.id)}
                                    isConfirmed={action.isConfirmed === true}
                                />
                            ))}
                        </div>
                        <Button variant="tertiary-primary" size="small" onClick={() => handleAddAction(logic.id)} className="mt-3">
                            <PlusIcon className="text-lg mr-1" />
                            Add action
                        </Button>
                    </div>
                ))}
            </div>

            <Button variant="tertiary-primary" size="large" onClick={handleAddAdvancedLogic} className="mt-4">
                <PlusIcon className="text-xl mr-2" />
                Add advanced logic
            </Button>
        </div>
    );
});
