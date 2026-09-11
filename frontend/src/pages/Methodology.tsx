import React from 'react';
import { BookOpen, Shield, Network, Cpu, AlertTriangle, Layers, ArrowRight, Terminal } from 'lucide-react';

export const Methodology: React.FC = () => {
  return (
    <div className="p-5 space-y-4 max-w-4xl mx-auto font-sans text-[#eff1f6]">
      {/* Header - LeetCode Style */}
      <div className="border-b border-[#333333] pb-3 font-mono">
        <div className="flex items-center space-x-2">
          <h1 className="text-base font-bold text-[#eff1f6] tracking-tight">System Specification & Methodology</h1>
          <span className="text-[10px] bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30 px-2 py-0.5 rounded font-bold">
            RFC SPEC
          </span>
        </div>
        <p className="text-xs text-[#8c8c8c] mt-0.5">
          Core architectural philosophy, algorithmic design, and investigative limitations
        </p>
      </div>

      {/* Principle Quote */}
      <div className="p-3.5 bg-[#262626] border-l-4 border-[#ffa116] rounded-r border-y border-r border-[#333333] font-mono">
        <div className="font-bold text-[#ffa116] text-sm">
          "Don't search for the crime. Let the network reveal it."
        </div>
        <p className="text-[#d1d5db] text-xs mt-1 font-sans">
          TRACE-X replaces traditional single-address keyword searches with end-to-end network flow topology,
          machine-learned behavioral anomaly detection, and multi-hop taint exposure analytics.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-3 font-mono">
        <section className="bg-[#262626] p-3.5 rounded border border-[#333333] shadow-xs space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6] flex items-center space-x-2">
            <span className="w-4 h-4 rounded bg-[#1f1f1f] text-[#ffa116] border border-[#3e3e3e] flex items-center justify-center text-[10px]">1</span>
            <span>Data Collection & Pluggable Ingestion</span>
          </h2>
          <p className="text-[#8c8c8c] text-xs leading-relaxed font-sans">
            The system is built on a pluggable data source abstraction (<code className="font-mono text-[#ffa116] bg-[#1a1a1a] px-1 py-0.5 rounded">BaseCryptoDataSource</code>).
            For the current production MVP, the engine operates on the Elliptic Bitcoin Transaction Graph (203,769 transactions, 234,355 directed edges,
            and 165 standardized features partitioned across 49 discrete bi-weekly time steps).
            The architecture is designed to integrate Ethereum, Sanctions lists, and exchange APIs without re-architecting data pipelines.
          </p>
        </section>

        <section className="bg-[#262626] p-3.5 rounded border border-[#333333] shadow-xs space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6] flex items-center space-x-2">
            <span className="w-4 h-4 rounded bg-[#1f1f1f] text-[#ffa116] border border-[#3e3e3e] flex items-center justify-center text-[10px]">2</span>
            <span>Graph Construction & Money Tree Topology</span>
          </h2>
          <p className="text-[#8c8c8c] text-xs leading-relaxed font-sans">
            Transactions represent directed graph nodes where edges designate fund flows from inputs to outputs.
            1-hop and 2-hop subgraphs are indexed using high-speed B-tree indices on both source and destination transaction identifiers,
            allowing bounded sub-5ms graph traversals with safety bounding (100–150 nodes) to maintain smooth browser visualization.
          </p>
        </section>

        <section className="bg-[#262626] p-3.5 rounded border border-[#333333] shadow-xs space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6] flex items-center space-x-2">
            <span className="w-4 h-4 rounded bg-[#1f1f1f] text-[#ffa116] border border-[#3e3e3e] flex items-center justify-center text-[10px]">3</span>
            <span>Feature Normalization & Dimensioning</span>
          </h2>
          <p className="text-[#8c8c8c] text-xs leading-relaxed font-sans">
            Each transaction contains 165 normalized features:
            <br />
            * <strong className="text-[#eff1f6]">Local Features (1 - 93):</strong> Direct transaction properties including fee rates, volume, input/output counts, and script structures.
            <br />
            * <strong className="text-[#eff1f6]">Neighborhood Aggregate Features (94 - 165):</strong> 1-hop aggregated metrics (mean, std, min, max) capturing behavioral patterns of immediate counterparties.
          </p>
        </section>

        <section className="bg-[#262626] p-3.5 rounded border border-[#333333] shadow-xs space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6] flex items-center space-x-2">
            <span className="w-4 h-4 rounded bg-[#1f1f1f] text-[#ffa116] border border-[#3e3e3e] flex items-center justify-center text-[10px]">4</span>
            <span>Machine Learning Anomaly Detection & Temporal Validation</span>
          </h2>
          <p className="text-[#8c8c8c] text-xs leading-relaxed font-sans">
            Standard random splits introduce future leakage into temporal cryptocurrency graphs. TRACE-X strictly adheres to chronological evaluation:
            Training (Steps 1–34), Validation (Steps 35–39), and Future Testing (Steps 40–49).
            Due to severe class imbalance (Illicit transactions constitute only 2.2% of the network), the optimization objective prioritizes
            <strong className="text-[#eff1f6]"> Illicit Precision, Illicit Recall, Illicit F1, and PR-AUC</strong> over conventional accuracy.
          </p>
        </section>

        <section className="bg-[#262626] p-3.5 rounded border border-[#333333] shadow-xs space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6] flex items-center space-x-2">
            <span className="w-4 h-4 rounded bg-[#1f1f1f] text-[#ffa116] border border-[#3e3e3e] flex items-center justify-center text-[10px]">5</span>
            <span>Deterministic Risk Scoring Engine</span>
          </h2>
          <p className="text-[#8c8c8c] text-xs leading-relaxed font-sans">
            Risk scores (0 - 100) are generated deterministically through a multi-factor composite formula:
            ML Probability Signal (55%), Graph Neighborhood Illicit Exposure (25%), Structural Degree Topology (10%), and Feature Outlier Deviations (10%).
            Scores map to 4 operational tiers: <span className="text-[#00b8a3] font-bold">LOW (0-30)</span>, <span className="text-[#ffc01e] font-bold">MEDIUM (31-60)</span>, <span className="text-[#ffa116] font-bold">HIGH (61-80)</span>, and <span className="text-[#ef4743] font-bold">CRITICAL (81-100)</span>.
          </p>
        </section>

        <section className="bg-[#262626] p-3.5 rounded border border-[#333333] shadow-xs space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6] flex items-center space-x-2">
            <span className="w-4 h-4 rounded bg-[#1f1f1f] text-[#ffa116] border border-[#3e3e3e] flex items-center justify-center text-[10px]">6</span>
            <span>Explainable Forensic Insights</span>
          </h2>
          <p className="text-[#8c8c8c] text-xs leading-relaxed font-sans">
            TRACE-X avoids hallucinated or fabricated natural language claims. All investigative signals are grounded in computed metrics:
            exact feature importance rankings, observed statistical deviations (|z| &gt; 2.5), degree fan-in/fan-out ratios, and direct contact with verified illicit clusters.
          </p>
        </section>
      </div>
    </div>
  );
};
