'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  Handle,
  Position,
  ReactFlow,
  getBezierPath,
  type Edge,
  type EdgeProps,
  type EdgeTypes,
  type Node,
  type NodeProps,
  type NodeTypes,
  type ReactFlowInstance,
} from '@xyflow/react';
import { cn } from '@/lib/utils';

import '@xyflow/react/dist/style.css';

export type AtlasNodeId =
  | 'intake'
  | 'normalize'
  | 'confidence-router'
  | 'auto-path'
  | 'human-checkpoint'
  | 'decision-receipt'
  | 'eval-loop'
  | 'context-layers';

type ActivateNode = (id: AtlasNodeId) => void;

type AtlasProcessNodeData = {
  id: Exclude<AtlasNodeId, 'context-layers'>;
  index: string;
  title: string;
  signal: string;
  active: boolean;
  emphasis?: boolean;
  router?: boolean;
  onActivate: ActivateNode;
};

type AtlasContextNodeData = {
  id: 'context-layers';
  index: string;
  title: string;
  signal: string;
  layers: readonly string[];
  active: boolean;
  onActivate: ActivateNode;
};

type AtlasProcessFlowNode = Node<AtlasProcessNodeData, 'atlasProcess'>;
type AtlasContextFlowNode = Node<AtlasContextNodeData, 'atlasContext'>;
type AtlasFlowNode = AtlasProcessFlowNode | AtlasContextFlowNode;

type AtlasEdgeData = {
  delay: number;
  label?: string;
};

type AtlasFlowEdge = Edge<AtlasEdgeData, 'atlasEdge'>;

interface AtlasNodeButtonProps {
  id: AtlasNodeId;
  title: string;
  signal: string;
  active: boolean;
  onActivate: ActivateNode;
  className?: string;
  children: React.ReactNode;
}

function AtlasNodeButton({
  id,
  title,
  signal,
  active,
  onActivate,
  className,
  children,
}: AtlasNodeButtonProps) {
  return (
    <button
      type="button"
      className={cn('atlas-node-shell group', className)}
      data-active={active ? 'true' : 'false'}
      data-atlas-node={id}
      data-cursor="interactive"
      aria-label={`${title}. ${signal}. Show production rule.`}
      aria-pressed={active}
      aria-controls="atlas-detail-panel"
      onClick={() => onActivate(id)}
      onFocus={() => onActivate(id)}
      onMouseEnter={() => onActivate(id)}
    >
      <span className="atlas-node-scroll-signal" aria-hidden />
      {children}
    </button>
  );
}

function AtlasProcessNode({ data }: NodeProps<AtlasProcessFlowNode>) {
  return (
    <>
      <Handle id="input" type="target" position={Position.Left} />
      {data.router ? (
        <>
          <Handle id="context" type="target" position={Position.Top} />
          <Handle id="eval" type="target" position={Position.Bottom} />
        </>
      ) : null}

      <AtlasNodeButton
        id={data.id}
        title={data.title}
        signal={data.signal}
        active={data.active}
        onActivate={data.onActivate}
        className={cn(data.emphasis && 'atlas-node-shell-emphasis')}
      >
        <span className="atlas-node-meta">
          <span>{data.index}</span>
          <span className="atlas-node-state">{data.active ? 'Inspecting' : 'Live'}</span>
        </span>
        <span className="atlas-node-title">{data.title}</span>
        <span className="atlas-node-signal">{data.signal}</span>
      </AtlasNodeButton>

      <Handle id="output" type="source" position={Position.Right} />
    </>
  );
}

function AtlasContextNode({ data }: NodeProps<AtlasContextFlowNode>) {
  return (
    <>
      <AtlasNodeButton
        id={data.id}
        title={data.title}
        signal={data.signal}
        active={data.active}
        onActivate={data.onActivate}
        className="atlas-node-shell-context"
      >
        <span className="atlas-node-meta">
          <span>{data.index}</span>
          <span className="atlas-node-state">Bounded</span>
        </span>
        <span className="atlas-node-title atlas-node-title-context">{data.title}</span>
        <span className="atlas-node-signal">{data.signal}</span>
        <span className="atlas-context-stack" aria-label={data.layers.join(', ')}>
          {data.layers.map((layer, index) => (
            <span key={layer}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {layer}
            </span>
          ))}
        </span>
      </AtlasNodeButton>
      <Handle id="context-output" type="source" position={Position.Bottom} />
    </>
  );
}

function AtlasEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
}: EdgeProps<AtlasFlowEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.34,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        className="atlas-edge-path"
        style={{ animationDelay: `-${data?.delay ?? 0}s` }}
      />
      {data?.label ? (
        <EdgeLabelRenderer>
          <span
            className="atlas-edge-label"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {data.label}
          </span>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

const atlasNodeTypes = {
  atlasProcess: AtlasProcessNode,
  atlasContext: AtlasContextNode,
} satisfies NodeTypes;

const atlasEdgeTypes = {
  atlasEdge: AtlasEdge,
} satisfies EdgeTypes;

interface ProcessBlueprint {
  id: AtlasProcessNodeData['id'];
  index: string;
  title: string;
  signal: string;
  emphasis?: boolean;
  router?: boolean;
  desktop: { x: number; y: number };
  compact: { x: number; y: number };
}

const PROCESS_BLUEPRINTS: readonly ProcessBlueprint[] = [
  {
    id: 'intake',
    index: 'N–01',
    title: 'Intake',
    signal: 'Evidence enters',
    desktop: { x: 0, y: 330 },
    compact: { x: 70, y: 245 },
  },
  {
    id: 'normalize',
    index: 'N–02',
    title: 'Normalize',
    signal: 'Shape before inference',
    desktop: { x: 205, y: 330 },
    compact: { x: 70, y: 425 },
  },
  {
    id: 'confidence-router',
    index: 'N–03',
    title: 'Confidence Router',
    signal: 'Threshold every branch',
    emphasis: true,
    router: true,
    desktop: { x: 415, y: 300 },
    compact: { x: 70, y: 605 },
  },
  {
    id: 'auto-path',
    index: 'N–04A',
    title: 'Auto Path',
    signal: 'Clear cases only',
    desktop: { x: 635, y: 180 },
    compact: { x: -10, y: 810 },
  },
  {
    id: 'human-checkpoint',
    index: 'N–04B',
    title: 'Human Checkpoint',
    signal: 'Judgment stays human',
    desktop: { x: 635, y: 430 },
    compact: { x: 160, y: 810 },
  },
  {
    id: 'decision-receipt',
    index: 'N–05',
    title: 'Decision Receipt',
    signal: 'Every action reconstructable',
    emphasis: true,
    desktop: { x: 860, y: 300 },
    compact: { x: 70, y: 1015 },
  },
  {
    id: 'eval-loop',
    index: 'N–06',
    title: 'Eval Loop',
    signal: 'Score, diagnose, rerun',
    desktop: { x: 850, y: 555 },
    compact: { x: 70, y: 1195 },
  },
];

const CONTEXT_LAYERS = ['System', 'Task', 'Tool', 'Memory', 'Routing'] as const;

const EDGE_BLUEPRINTS: AtlasFlowEdge[] = [
  {
    id: 'intake-normalize',
    source: 'intake',
    sourceHandle: 'output',
    target: 'normalize',
    targetHandle: 'input',
    type: 'atlasEdge',
    data: { delay: 0 },
  },
  {
    id: 'normalize-router',
    source: 'normalize',
    sourceHandle: 'output',
    target: 'confidence-router',
    targetHandle: 'input',
    type: 'atlasEdge',
    data: { delay: 0.2 },
  },
  {
    id: 'context-router',
    source: 'context-layers',
    sourceHandle: 'context-output',
    target: 'confidence-router',
    targetHandle: 'context',
    type: 'atlasEdge',
    data: { delay: 0.45, label: 'bounded context' },
  },
  {
    id: 'router-auto',
    source: 'confidence-router',
    sourceHandle: 'output',
    target: 'auto-path',
    targetHandle: 'input',
    type: 'atlasEdge',
    data: { delay: 0.65, label: 'high confidence' },
  },
  {
    id: 'router-human',
    source: 'confidence-router',
    sourceHandle: 'output',
    target: 'human-checkpoint',
    targetHandle: 'input',
    type: 'atlasEdge',
    data: { delay: 0.8, label: 'ambiguity' },
  },
  {
    id: 'auto-receipt',
    source: 'auto-path',
    sourceHandle: 'output',
    target: 'decision-receipt',
    targetHandle: 'input',
    type: 'atlasEdge',
    data: { delay: 1 },
  },
  {
    id: 'human-receipt',
    source: 'human-checkpoint',
    sourceHandle: 'output',
    target: 'decision-receipt',
    targetHandle: 'input',
    type: 'atlasEdge',
    data: { delay: 1.15 },
  },
  {
    id: 'receipt-eval',
    source: 'decision-receipt',
    sourceHandle: 'output',
    target: 'eval-loop',
    targetHandle: 'input',
    type: 'atlasEdge',
    data: { delay: 1.35, label: 'outcomes' },
  },
  {
    id: 'eval-router',
    source: 'eval-loop',
    sourceHandle: 'output',
    target: 'confidence-router',
    targetHandle: 'eval',
    type: 'atlasEdge',
    data: { delay: 1.55, label: 'calibrate' },
  },
];

interface AtlasFlowCanvasProps {
  activeId: AtlasNodeId;
  onActivate: ActivateNode;
  onReady?: () => void;
}

export function AtlasFlowCanvas({ activeId, onActivate, onReady }: AtlasFlowCanvasProps) {
  const [compact, setCompact] = useState(false);
  const [flow, setFlow] =
    useState<ReactFlowInstance<AtlasFlowNode, AtlasFlowEdge> | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setCompact(query.matches);

    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const nodes = useMemo<AtlasFlowNode[]>(() => {
    const processNodes: AtlasProcessFlowNode[] = PROCESS_BLUEPRINTS.map((blueprint) => ({
      id: blueprint.id,
      type: 'atlasProcess',
      position: compact ? blueprint.compact : blueprint.desktop,
      data: {
        id: blueprint.id,
        index: blueprint.index,
        title: blueprint.title,
        signal: blueprint.signal,
        active: activeId === blueprint.id,
        emphasis: blueprint.emphasis,
        router: blueprint.router,
        onActivate,
      },
      draggable: false,
      selectable: false,
    }));

    const contextNode: AtlasContextFlowNode = {
      id: 'context-layers',
      type: 'atlasContext',
      position: compact ? { x: 25, y: 0 } : { x: 355, y: 0 },
      data: {
        id: 'context-layers',
        index: 'C–05',
        title: 'Context Layers',
        signal: 'Load only what the decision needs',
        layers: CONTEXT_LAYERS,
        active: activeId === 'context-layers',
        onActivate,
      },
      draggable: false,
      selectable: false,
    };

    return [...processNodes, contextNode];
  }, [activeId, compact, onActivate]);

  useEffect(() => {
    if (!flow) return;

    const frame = window.requestAnimationFrame(() => {
      void flow.fitView({
        padding: compact ? 0.12 : 0.09,
        minZoom: compact ? 0.45 : 0.4,
        maxZoom: compact ? 0.68 : 0.9,
        duration: 0,
      });
      onReady?.();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [compact, flow, onReady]);

  return (
    <ReactFlow<AtlasFlowNode, AtlasFlowEdge>
      className="atlas-flow"
      nodes={nodes}
      edges={EDGE_BLUEPRINTS}
      nodeTypes={atlasNodeTypes}
      edgeTypes={atlasEdgeTypes}
      onInit={setFlow}
      onNodeClick={(_, node) => onActivate(node.id as AtlasNodeId)}
      onNodeMouseEnter={(_, node) => onActivate(node.id as AtlasNodeId)}
      fitView
      fitViewOptions={{ padding: 0.09, minZoom: 0.4, maxZoom: 0.9 }}
      minZoom={0.4}
      maxZoom={1.2}
      nodesDraggable={false}
      nodesConnectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      elementsSelectable={false}
      zoomOnScroll={false}
      zoomOnDoubleClick={false}
      zoomOnPinch
      panOnScroll={false}
      panOnDrag
      preventScrolling={false}
      proOptions={{ hideAttribution: true }}
    />
  );
}
