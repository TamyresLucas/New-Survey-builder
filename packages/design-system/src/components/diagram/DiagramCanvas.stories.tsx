import type { Meta, StoryObj } from '@storybook/react';
import { MarkerType } from '@xyflow/react';
import { DiagramCanvas } from './DiagramCanvas';
import type { Node, Edge } from '@xyflow/react';

const meta: Meta<typeof DiagramCanvas> = {
    title: 'Components/DiagramCanvas',
    component: DiagramCanvas,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
A React Flow-based diagram canvas for visualizing survey flows.

## Features
- **Start Node**: Represents the beginning of a survey
- **End Node**: Represents the end of a survey  
- **Multiple Choice Node**: Radio or checkbox questions with per-choice output handles
- **Text Entry Node**: Open-ended text questions
- **Description Node**: Informational content blocks

## Styling
All components use Shadcn design tokens for consistent theming:
- \`--primary\` for selection highlights
- \`--card\` for node backgrounds
- \`--border\` for edges and outlines
- \`--success\` for start/end node borders
        `,
            },
        },
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{ width: '100%', height: '600px' }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof DiagramCanvas>;

// Sample nodes for the demo
const sampleNodes: Node[] = [
    {
        id: 'start',
        type: 'start',
        position: { x: 0, y: 150 },
        data: { label: 'Start of Survey' },
    },
    {
        id: 'q1',
        type: 'multipleChoice',
        position: { x: 250, y: 50 },
        data: {
            variableName: 'Q1',
            question: 'How satisfied are you with our service?',
            subtype: 'radio',
            options: [
                { id: 'opt1', text: 'Very Satisfied' },
                { id: 'opt2', text: 'Satisfied' },
                { id: 'opt3', text: 'Neutral' },
                { id: 'opt4', text: 'Dissatisfied' },
            ],
        },
    },
    {
        id: 'q2',
        type: 'textEntry',
        position: { x: 650, y: 0 },
        data: {
            variableName: 'Q2',
            question: 'What could we improve?',
        },
    },
    {
        id: 'desc1',
        type: 'description',
        position: { x: 650, y: 180 },
        data: {
            question: 'Thank you for your positive feedback! We appreciate your support.',
        },
    },
    {
        id: 'q3',
        type: 'multipleChoice',
        position: { x: 650, y: 350 },
        data: {
            variableName: 'Q3',
            question: 'Would you recommend us?',
            subtype: 'checkbox',
            options: [
                { id: 'rec1', text: 'To friends' },
                { id: 'rec2', text: 'To family' },
                { id: 'rec3', text: 'To colleagues' },
            ],
        },
    },
    {
        id: 'end',
        type: 'end',
        position: { x: 1050, y: 200 },
        data: { label: 'End of Survey' },
    },
];

// Sample edges connecting the nodes
const sampleEdges: Edge[] = [
    {
        id: 'e-start-q1',
        source: 'start',
        sourceHandle: 'output',
        target: 'q1',
        targetHandle: 'input',
        markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
        id: 'e-q1-opt1-desc1',
        source: 'q1',
        sourceHandle: 'opt1',
        target: 'desc1',
        targetHandle: 'input',
        label: 'Very Satisfied',
        markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
        id: 'e-q1-opt2-desc1',
        source: 'q1',
        sourceHandle: 'opt2',
        target: 'desc1',
        targetHandle: 'input',
        markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
        id: 'e-q1-opt3-q2',
        source: 'q1',
        sourceHandle: 'opt3',
        target: 'q2',
        targetHandle: 'input',
        label: 'Neutral',
        style: { strokeDasharray: '5, 5' },
        markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
        id: 'e-q1-opt4-q2',
        source: 'q1',
        sourceHandle: 'opt4',
        target: 'q2',
        targetHandle: 'input',
        label: 'Dissatisfied',
        style: { strokeDasharray: '5, 5' },
        markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
        id: 'e-desc1-q3',
        source: 'desc1',
        sourceHandle: 'output',
        target: 'q3',
        targetHandle: 'input',
        markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
        id: 'e-q2-end',
        source: 'q2',
        sourceHandle: 'output',
        target: 'end',
        targetHandle: 'input',
        markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
        id: 'e-q3-rec1-end',
        source: 'q3',
        sourceHandle: 'rec1',
        target: 'end',
        targetHandle: 'input',
        markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
        id: 'e-q3-rec2-end',
        source: 'q3',
        sourceHandle: 'rec2',
        target: 'end',
        targetHandle: 'input',
        markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
        id: 'e-q3-rec3-end',
        source: 'q3',
        sourceHandle: 'rec3',
        target: 'end',
        targetHandle: 'input',
        markerEnd: { type: MarkerType.ArrowClosed },
    },
];

/**
 * Default survey flow diagram showing all node types and edge connections.
 */
export const Default: Story = {
    args: {
        nodes: sampleNodes,
        edges: sampleEdges,
        showControls: true,
        showBackground: true,
        fitView: true,
    },
};

/**
 * Diagram without controls panel - useful for read-only displays.
 */
export const WithoutControls: Story = {
    args: {
        nodes: sampleNodes,
        edges: sampleEdges,
        showControls: false,
        showBackground: true,
        fitView: true,
    },
};

/**
 * Diagram without background - clean look for presentations.
 */
export const WithoutBackground: Story = {
    args: {
        nodes: sampleNodes,
        edges: sampleEdges,
        showControls: true,
        showBackground: false,
        fitView: true,
    },
};

// Simple linear flow for basic demonstrations
const simpleNodes: Node[] = [
    {
        id: 'start',
        type: 'start',
        position: { x: 0, y: 100 },
        data: { label: 'Start' },
    },
    {
        id: 'q1',
        type: 'textEntry',
        position: { x: 250, y: 80 },
        data: {
            variableName: 'Name',
            question: "What's your name?",
        },
    },
    {
        id: 'q2',
        type: 'textEntry',
        position: { x: 550, y: 80 },
        data: {
            variableName: 'Email',
            question: "What's your email?",
        },
    },
    {
        id: 'end',
        type: 'end',
        position: { x: 850, y: 100 },
        data: { label: 'Complete' },
    },
];

const simpleEdges: Edge[] = [
    {
        id: 'e1',
        source: 'start',
        sourceHandle: 'output',
        target: 'q1',
        targetHandle: 'input',
        markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
        id: 'e2',
        source: 'q1',
        sourceHandle: 'output',
        target: 'q2',
        targetHandle: 'input',
        markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
        id: 'e3',
        source: 'q2',
        sourceHandle: 'output',
        target: 'end',
        targetHandle: 'input',
        markerEnd: { type: MarkerType.ArrowClosed },
    },
];

/**
 * A simple linear survey flow with text entry questions only.
 */
export const SimpleLinearFlow: Story = {
    args: {
        nodes: simpleNodes,
        edges: simpleEdges,
        showControls: true,
        showBackground: true,
        fitView: true,
    },
};
