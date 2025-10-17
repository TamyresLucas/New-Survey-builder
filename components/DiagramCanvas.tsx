import React, { useState, useCallback, useMemo, useRef, memo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Connection,
  NodeTypes,
  EdgeTypes,
  addEdge,
} from '@xyflow/react';

import type { Node, Edge, Option } from '../types';
import { generateId } from '../utils';

import StartNodeComponent from './diagram/nodes/StartNodeComponent';
import MultipleChoiceNodeComponent from './diagram/nodes/MultipleChoiceNodeComponent';
import TextEntryNodeComponent from './diagram/nodes/TextEntryNodeComponent';
import LogicNodeComponent from './diagram/nodes/LogicNodeComponent';
import DiagramToolbar from './diagram/DiagramToolbar';
import PropertiesPanel from './diagram/PropertiesPanel';

const initialNodes: Node[] = [
  {
    id: 'start-node',
    variableName: 'START',
    type: 'start',
    position: { x: 100, y: 200 },
    data: { label: 'Start' },
    width: 180,
    height: 60,
  },
  {
    id: 'q1-mc',
    variableName: 'Q1',
    type: 'multiple_choice',
    position: { x: 400, y: 150 },
    data: { 
        question: 'What is your favorite color?',
        subtype: 'radio',
        options: [
            { id: 'q1-opt1', text: 'Red', variableName: 'Q1_1' },
            { id: 'q1-opt2', text: 'Blue', variableName: 'Q1_2' },
            { id: 'q1-opt3', text: 'Green', variableName: 'Q1_3' },
        ]
     },
    width: 320,
    height: 196,
  },
  {
    id: 'q2-text',
    variableName: 'Q2',
    type: 'text_entry',
    position: { x: 800, y: 200 },
    data: { 
        question: 'Why is it your favorite color?'
    },
    width: 320,
    height: 120,
  }
];

const initialEdges: Edge[] = [
    {
        id: 'e-start-q1',
        source: 'start-node',
        sourceHandle: 'output',
        target: 'q1-mc',
        targetHandle: 'input',
    },
    {
        id: 'e-q1-q2',
        source: 'q1-mc',
        sourceHandle: 'output',
        target: 'q2-text',
        targetHandle: 'input',
    }
];

const nodeTypes: NodeTypes = {
  start: StartNodeComponent,
  multiple_choice: MultipleChoiceNodeComponent,
  text_entry: TextEntryNodeComponent,
  logic: LogicNodeComponent,
};

const DiagramCanvasContent: React.FC = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const reactFlowInstance = useReactFlow();
    const questionCounter = useRef(3); // Starts after our two initial questions

    const onConnect = useCallback(
        (connection: Connection) => {
            const newEdge = { ...connection, id: generateId('edge') } as Edge;
            setEdges((eds) => addEdge(newEdge, eds));
        },
        [setEdges]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
    }, []);

    const addNode = useCallback((type: 'multiple_choice' | 'text_entry' | 'logic') => {
        const { x, y } = reactFlowInstance.screenToFlowPosition({ 
            x: window.innerWidth / 2, 
            y: window.innerHeight / 2 
        });
        
        const qid = `Q${questionCounter.current++}`;
        let newNode: Node;

        if (type === 'multiple_choice') {
            newNode = {
                id: generateId('q-mc'),
                variableName: qid,
                type: 'multiple_choice',
                position: { x, y },
                data: {
                    question: `Click to edit question ${qid}`,
                    subtype: 'radio',
                    options: [
                        { id: generateId('opt'), text: 'Option 1', variableName: `${qid}_1` },
                        { id: generateId('opt'), text: 'Option 2', variableName: `${qid}_2` },
                    ]
                },
                width: 320,
                height: 164,
            };
        } else { // text_entry
            newNode = {
                id: generateId('q-text'),
                variableName: qid,
                type: 'text_entry',
                position: { x, y },
                data: {
                    question: `Click to edit question ${qid}`,
                },
                width: 320,
                height: 120,
            };
        }
        
        setNodes((nds) => nds.concat(newNode));
    }, [reactFlowInstance, setNodes]);

    const updateNode = useCallback((nodeId: string, data: any) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, ...data } }
                    : node
            )
        );
    }, [setNodes]);

    const selectedNode = useMemo(() => {
        if (!selectedNodeId) return null;
        return nodes.find(n => n.id === selectedNodeId) || null;
    }, [selectedNodeId, nodes]);

    return (
        <div className="w-full h-full">
            <DiagramToolbar onAddNode={addNode} />
            {selectedNode && (
                <PropertiesPanel
                    key={selectedNode.id}
                    node={selectedNode}
                    onUpdateNode={updateNode}
                    onClose={() => setSelectedNodeId(null)}
                />
            )}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={() => setSelectedNodeId(null)}
                nodeTypes={nodeTypes}
                fitView
                className="bg-surface"
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    className="bg-surface"
                />
                <Controls className="bg-surface-container rounded-lg shadow-md border border-outline-variant" />
            </ReactFlow>
        </div>
    );
};


const DiagramCanvas: React.FC = memo(() => {
    return (
        <ReactFlowProvider>
            <DiagramCanvasContent />
        </ReactFlowProvider>
    );
});

export default DiagramCanvas;