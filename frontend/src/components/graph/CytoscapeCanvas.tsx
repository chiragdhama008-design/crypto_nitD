import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { GraphNode, GraphEdge } from '../../types/api';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface CytoscapeCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  centerTransactionId: number;
  onNodeClick: (node: GraphNode) => void;
}

export const CytoscapeCanvas: React.FC<CytoscapeCanvasProps> = ({
  nodes,
  edges,
  centerTransactionId,
  onNodeClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements: cytoscape.ElementDefinition[] = [];

    // Transform nodes with LeetCode difficulty colors
    nodes.forEach((n) => {
      let bgColor = '#8c8c8c'; // UNKNOWN (LeetCode neutral)
      let borderColor = '#555555';

      if (n.label === 'ILLICIT' || n.prediction === 'ILLICIT') {
        bgColor = '#ef4743'; // Hard / Illicit (LeetCode Red)
        borderColor = '#f87171';
      } else if (n.label === 'LICIT') {
        bgColor = '#00b8a3'; // Easy / Licit (LeetCode Green)
        borderColor = '#2dd4bf';
      }

      elements.push({
        group: 'nodes',
        data: {
          id: n.id,
          label: n.id,
          txData: n,
          isCenter: n.is_center,
          bgColor,
          borderColor,
          size: n.is_center ? 36 : 24,
        },
      });
    });

    // Transform edges
    edges.forEach((e) => {
      elements.push({
        group: 'edges',
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
        },
      });
    });

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(bgColor)',
            'border-color': 'data(borderColor)',
            'border-width': 2,
            'label': 'data(label)',
            'color': '#eff1f6',
            'font-family': 'monospace',
            'font-size': '9px',
            'text-valign': 'bottom',
            'text-margin-y': 4,
            'width': 'data(size)',
            'height': 'data(size)',
          },
        },
        {
          selector: 'node[?isCenter]',
          style: {
            'border-width': 4,
            'border-color': '#ffa116', // LeetCode Gold Accent
            'border-style': 'solid',
            'font-weight': 'bold',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#4a4a4a',
            'target-arrow-color': '#ffa116',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.8,
          },
        },
        {
          selector: ':selected',
          style: {
            'border-color': '#ffa116',
            'border-width': 4,
          },
        },
      ],
      layout: {
        name: 'concentric',
        concentric: (node: any) => (node.data('isCenter') ? 2 : 1),
        levelWidth: () => 1,
        minNodeSpacing: 55,
        animate: false,
      },
      minZoom: 0.2,
      maxZoom: 3.5,
    });

    cy.on('tap', 'node', (evt) => {
      const nodeData = evt.target.data('txData') as GraphNode;
      if (nodeData) {
        onNodeClick(nodeData);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [nodes, edges, centerTransactionId]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 30);
  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.reset();
      cyRef.current.fit(undefined, 30);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#141414] overflow-hidden border border-[#333333] rounded">
      {/* Graph Toolbar - LeetCode Dark Style */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 bg-[#262626] border border-[#3e3e3e] rounded shadow-lg p-1">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 hover:bg-[#333333] rounded text-[#eff1f6] transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 hover:bg-[#333333] rounded text-[#eff1f6] transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleFit}
          title="Fit Canvas"
          className="p-1.5 hover:bg-[#333333] rounded text-[#eff1f6] transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleReset}
          title="Reset View"
          className="p-1.5 hover:bg-[#333333] rounded text-[#eff1f6] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
