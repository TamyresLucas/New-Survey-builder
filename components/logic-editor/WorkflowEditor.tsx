import React, { memo } from 'react';
import type { Workflow, ActionLogic } from '../../types';
import { generateId } from '../../utils';
import { PlusIcon, XIcon } from '../icons';
import { ActionEditor } from './shared';

export const WorkflowSectionEditor: React.FC<{
    title: string;
    description: string;
    questionQid: string;
    workflows: Workflow[];
    onUpdateWorkflows: (workflows: Workflow[]) => void;
    onAddWorkflow: () => void;
}> = memo(({ title, description, questionQid, workflows, onUpdateWorkflows, onAddWorkflow }) => {

    const handleAddWorkflow = () => {
        const newWorkflow: Workflow = {
            id: generateId('wf'),
            wid: `${questionQid}-WF${workflows.length + 1}`,
            name: `New Workflow ${workflows.length + 1}`,
            actions: [],
        };
        onUpdateWorkflows([...workflows, newWorkflow]);
        onAddWorkflow();
    };

    const handleUpdateWorkflow = (workflowId: string, updates: Partial<Workflow>) => {
        onUpdateWorkflows(workflows.map(wf => wf.id === workflowId ? { ...wf, ...updates } : wf));
    };

    const handleRemoveWorkflow = (workflowId: string) => {
        onUpdateWorkflows(workflows.filter(wf => wf.id !== workflowId));
    };

    const handleAddAction = (workflowId: string) => {
        const workflow = workflows.find(wf => wf.id === workflowId);
        if (!workflow) return;
        const newAction: ActionLogic = { id: generateId('act'), type: '', isConfirmed: false, params: {} };
        const newActions = [...workflow.actions, newAction];
        handleUpdateWorkflow(workflowId, { actions: newActions });
    };

    const handleUpdateAction = (workflowId: string, actionId: string, updates: Partial<ActionLogic>) => {
        const workflow = workflows.find(wf => wf.id === workflowId);
        if (!workflow) return;
        const newActions = workflow.actions.map(act => act.id === actionId ? { ...act, ...updates, isConfirmed: false } : act);
        handleUpdateWorkflow(workflowId, { actions: newActions });
    };

    const handleRemoveAction = (workflowId: string, actionId: string) => {
        const workflow = workflows.find(wf => wf.id === workflowId);
        if (!workflow) return;
        const newActions = workflow.actions.filter(act => act.id !== actionId);
        handleUpdateWorkflow(workflowId, { actions: newActions });
    };

    const handleConfirmAction = (workflowId: string, actionId: string) => {
        const workflow = workflows.find(wf => wf.id === workflowId);
        if (!workflow) return;
        const newActions = workflow.actions.map(act => act.id === actionId ? { ...act, isConfirmed: true } : act);
        handleUpdateWorkflow(workflowId, { actions: newActions });
    };

    return (
        <div className="py-6 first:pt-0">
            <h3 className="text-sm font-medium text-on-surface">{title}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 mb-3">{description}</p>
            
            <div className="space-y-4">
                {workflows.map(workflow => (
                    <div key={workflow.id} className="p-3 border border-outline-variant rounded-md">
                        <div className="flex items-center justify-between mb-2">
                             <input type="text" value={workflow.name} onChange={e => handleUpdateWorkflow(workflow.id, { name: e.target.value })} className="font-semibold text-on-surface bg-transparent border-b border-transparent focus:border-primary focus:outline-none" />
                            <button onClick={() => handleRemoveWorkflow(workflow.id)} className="p-1 text-on-surface-variant hover:text-error"><XIcon/></button>
                        </div>
                        <div className="space-y-2">
                            {workflow.actions.map(action => (
                                <ActionEditor
                                    key={action.id}
                                    action={action}
                                    onUpdate={(updates: Partial<ActionLogic>) => handleUpdateAction(workflow.id, action.id, updates)}
                                    onRemove={() => handleRemoveAction(workflow.id, action.id)}
                                    onConfirm={() => handleConfirmAction(workflow.id, action.id)}
                                    isConfirmed={action.isConfirmed === true}
                                />
                            ))}
                        </div>
                         <button onClick={() => handleAddAction(workflow.id)} className="mt-3 flex items-center gap-1 text-sm font-button-text text-primary hover:underline">
                            <PlusIcon className="text-base" />
                            Add action
                        </button>
                    </div>
                ))}
            </div>

            <button onClick={handleAddWorkflow} className="mt-4 flex items-center gap-1 text-sm font-button-text text-primary hover:underline">
                <PlusIcon className="text-base" />
                Add workflow
            </button>
        </div>
    );
});
