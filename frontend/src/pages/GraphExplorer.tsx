import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Network,
  Search,
  ArrowRight,
  Shield,
  Layers,
  AlertTriangle,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { GraphResponse, GraphNode } from '../types/api';
import { CytoscapeCanvas } from '../components/graph/CytoscapeCanvas';
import { RiskBadge } from '../components/common/RiskBadge';
import { LabelBadge } from '../components/common/LabelBadge';

export const GraphExplorer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialTx = searchParams.get('tx') || '230425980';
  const initialDepth = parseInt(searchParams.get('depth') || '1', 10);

  const [inputTx, setInputTx] = useState(initialTx);
  const [centerTxId, setCenterTxId] = useState(parseInt(initialTx, 10));
  const [depth, setDepth] = useState<number>(initialDepth);
  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGraph = (txId: number, d: number) => {
    setLoading(true);
    setError(null);
    api.getTransactionGraph(txId, d)
      .then((res) => {
        setGraphData(res);
        const center = res.nodes.find((n) => n.is_center) || res.nodes[0] || null;
        setSelectedNode(center);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (centerTxId) {
      fetchGraph(centerTxId, depth);
    }
  }, [centerTxId, depth]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputTx.trim(), 10);
    if (!isNaN(parsed) && parsed > 0) {
      setCenterTxId(parsed);
      setSearchParams({ tx: parsed.toString(), depth: depth.toString() });
    }
  };

  const handleDepthChange = (newDepth: number) => {
    setDepth(newDepth);
    setSearchParams({ tx: centerTxId.toString(), depth: newDepth.toString() });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2.75rem)] overflow-hidden bg-[#1a1a1a] text-[#eff1f6] font-sans">
      {/* Explorer Top Toolbar - LeetCode Style */}
      <div className="h-10 bg-[#222222] border-b border-[#333333] px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-bold font-mono text-xs text-[#eff1f6]">
            <Network className="w-3.5 h-3.5 text-[#ffa116]" />
            <span>GRAPH EXPLORER</span>
          </div>

          {/* Quick Center Search */}
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-1">
            <input
              type="text"
              placeholder="Center TX ID..."
              value={inputTx}
              onChange={(e) => setInputTx(e.target.value)}
              className="w-36 text-xs px-2 py-0.5 bg-[#1a1a1a] border border-[#3e3e3e] rounded font-mono text-[#eff1f6] placeholder-[#6b7280] focus:outline-none focus:border-[#ffa116]"
            />
            <button
              type="submit"
              className="px-2 py-0.5 bg-[#2a2a2a] hover:bg-[#333333] text-[#eff1f6] border border-[#3e3e3e] text-xs rounded font-mono transition-colors"
            >
              Trace
            </button>
          </form>

          {/* Hop Controls */}
          <div className="flex items-center border border-[#3e3e3e] rounded overflow-hidden text-xs font-mono">
            <button
              onClick={() => handleDepthChange(1)}
              className={`px-2.5 py-0.5 font-medium transition-colors ${
                depth === 1 ? 'bg-[#ffa116] text-[#1a1a1a] font-bold' : 'bg-[#262626] text-[#8c8c8c] hover:bg-[#2d2d2d]'
              }`}
            >
              1 Hop
            </button>
            <button
              onClick={() => handleDepthChange(2)}
              className={`px-2.5 py-0.5 font-medium border-l border-[#3e3e3e] transition-colors ${
                depth === 2 ? 'bg-[#ffa116] text-[#1a1a1a] font-bold' : 'bg-[#262626] text-[#8c8c8c] hover:bg-[#2d2d2d]'
              }`}
            >
              2 Hops
            </button>
          </div>
        </div>

        {/* Graph Meta stats */}
        {graphData && (
          <div className="flex items-center space-x-3 text-xs text-[#8c8c8c] font-mono">
            <span>Nodes: <strong className="text-[#eff1f6]">{graphData.metadata.total_nodes}</strong></span>
            <span>Edges: <strong className="text-[#eff1f6]">{graphData.metadata.total_edges}</strong></span>
            <span className="text-[#ef4743]">Illicit: <strong>{graphData.metadata.illicit_count}</strong></span>
            {graphData.metadata.truncated && (
              <span className="text-[10px] bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30 px-1 py-0.2 rounded font-mono">
                Bounded (max 120)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Graph Area with Side Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas Area */}
        <div className="flex-1 h-full p-2 bg-[#1a1a1a]">
          {loading ? (
            <div className="w-full h-full bg-[#141414] border border-[#333333] rounded flex items-center justify-center space-y-2">
              <div className="text-center space-y-2">
                <div className="w-6 h-6 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="text-xs font-mono text-[#8c8c8c]">Traversing Bitcoin network graph...</div>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-full bg-[#141414] border border-[#333333] rounded flex items-center justify-center p-6">
              <div className="max-w-md bg-[#262626] p-4 border border-[#ef4743]/50 rounded shadow-lg text-xs space-y-2 font-mono">
                <div className="font-semibold text-[#ef4743] flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Graph Traversal Notice</span>
                </div>
                <p className="text-[#d1d5db]">{error}</p>
                <div className="pt-1">
                  <button
                    onClick={() => { setInputTx('230425980'); setCenterTxId(230425980); }}
                    className="text-[#ffa116] hover:underline font-mono"
                  >
                    Load Sample Transaction #230425980
                  </button>
                </div>
              </div>
            </div>
          ) : graphData ? (
            <CytoscapeCanvas
              nodes={graphData.nodes}
              edges={graphData.edges}
              centerTransactionId={centerTxId}
              onNodeClick={(node) => setSelectedNode(node)}
            />
          ) : null}
        </div>

        {/* Selected Node Side Inspector Panel - LeetCode Dark Style */}
        <div className="w-72 border-l border-[#333333] bg-[#262626] h-full overflow-y-auto p-3.5 space-y-3 flex-shrink-0 font-sans">
          <div className="border-b border-[#333333] pb-2 font-mono">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8c8c8c]">Node Inspector</div>
            <h2 className="text-xs font-bold text-[#eff1f6] mt-0.5">Selected Entity Attributes</h2>
          </div>

          {selectedNode ? (
            <div className="space-y-3 font-mono">
              <div className="space-y-1">
                <div className="text-[10px] text-[#8c8c8c]">Transaction ID</div>
                <div className="font-bold text-sm text-[#eff1f6] flex items-center space-x-1.5">
                  <span>TX #{selectedNode.transaction_id}</span>
                  {selectedNode.is_center && (
                    <span className="text-[9px] bg-[#ffa116]/20 text-[#ffa116] border border-[#ffa116]/30 px-1 py-0.2 rounded font-bold">
                      CENTER
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#333333]">
                  <span className="text-[#8c8c8c]">Hop Distance</span>
                  <span className="font-semibold text-[#eff1f6]">
                    {selectedNode.hop_level === 0 ? 'Origin (0)' : `${selectedNode.hop_level} Hop`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#333333]">
                  <span className="text-[#8c8c8c]">Time Step</span>
                  <span className="font-semibold text-[#eff1f6]">Step {selectedNode.time_step}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#333333]">
                  <span className="text-[#8c8c8c]">Ground Truth</span>
                  <LabelBadge label={selectedNode.label} />
                </div>
                <div className="flex justify-between py-1 border-b border-[#333333]">
                  <span className="text-[#8c8c8c]">Prediction</span>
                  {selectedNode.prediction ? (
                    <LabelBadge label={selectedNode.prediction} isPrediction />
                  ) : (
                    <span className="text-[#6b7280] text-xs">—</span>
                  )}
                </div>
                <div className="flex justify-between py-1 border-b border-[#333333]">
                  <span className="text-[#8c8c8c]">Probability</span>
                  <span className="font-semibold text-[#d1d5db]">
                    {selectedNode.probability !== null && selectedNode.probability !== undefined
                      ? `${(selectedNode.probability * 100).toFixed(1)}%`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#333333]">
                  <span className="text-[#8c8c8c]">Risk Assessment</span>
                  <RiskBadge score={selectedNode.risk_score} level={selectedNode.risk_level} />
                </div>
                <div className="flex justify-between py-1 border-b border-[#333333]">
                  <span className="text-[#8c8c8c]">Degree</span>
                  <span className="text-[#d1d5db] text-[11px]">
                    {selectedNode.in_degree}↓ {selectedNode.out_degree}↑
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-1.5">
                <button
                  onClick={() => navigate(`/transactions/${selectedNode.transaction_id}`)}
                  className="w-full py-1.5 bg-[#ffa116] hover:bg-[#ffb84d] text-[#1a1a1a] rounded text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                >
                  <span>Open Full Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                {!selectedNode.is_center && (
                  <button
                    onClick={() => {
                      setInputTx(selectedNode.transaction_id.toString());
                      setCenterTxId(selectedNode.transaction_id);
                      setSearchParams({ tx: selectedNode.transaction_id.toString(), depth: depth.toString() });
                    }}
                    className="w-full py-1.5 bg-[#2a2a2a] border border-[#3e3e3e] hover:bg-[#333333] text-[#eff1f6] rounded text-xs font-medium flex items-center justify-center space-x-1 transition-colors"
                  >
                    <span>Center Graph Here</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[#8c8c8c] text-xs font-mono">
              Click any node in the canvas to inspect its forensic properties.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
