import type { Node, NodeProps } from '@xyflow/react';

// Base data interface for all diagram nodes
export interface BaseNodeData extends Record<string, unknown> {
    label?: string;
    highlightInputHandle?: boolean;
    highlightSourceHandles?: boolean;
}

// Start node data
export interface StartNodeData extends BaseNodeData {
    label: string;
}

// End node data
export interface EndNodeData extends BaseNodeData {
    label: string;
}

// Multiple choice node data
export interface MultipleChoiceNodeData extends BaseNodeData {
    variableName: string;
    question: string;
    subtype: 'radio' | 'checkbox';
    options: Array<{
        id: string;
        text: string;
        variableName?: string;
    }>;
}

// Text entry node data
export interface TextEntryNodeData extends BaseNodeData {
    variableName: string;
    question: string;
}

// Description node data
export interface DescriptionNodeData extends BaseNodeData {
    question: string;
}

// Node type definitions
export type StartNode = Node<StartNodeData, 'start'>;
export type EndNode = Node<EndNodeData, 'end'>;
export type MultipleChoiceNode = Node<MultipleChoiceNodeData, 'multipleChoice'>;
export type TextEntryNode = Node<TextEntryNodeData, 'textEntry'>;
export type DescriptionNode = Node<DescriptionNodeData, 'description'>;

// Union type for all diagram nodes
export type DiagramNode =
    | StartNode
    | EndNode
    | MultipleChoiceNode
    | TextEntryNode
    | DescriptionNode;

// Props types for node components
export type StartNodeProps = NodeProps<StartNode>;
export type EndNodeProps = NodeProps<EndNode>;
export type MultipleChoiceNodeProps = NodeProps<MultipleChoiceNode>;
export type TextEntryNodeProps = NodeProps<TextEntryNode>;
export type DescriptionNodeProps = NodeProps<DescriptionNode>;
