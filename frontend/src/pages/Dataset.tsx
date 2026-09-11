import React, { useEffect, useState } from 'react';
import { Database, CheckCircle, Clock, HardDrive, ArrowRight, RefreshCw, AlertCircle, Terminal } from 'lucide-react';
import { api } from '../services/api';

export const Dataset: React.FC = () => {
  const [status, setStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = () => {
    setLoading(true);
    api.getDatasetStatus()
      .then(setStatus)
      .catch((err) => console.warn(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto font-sans text-[#eff1f6]">
      {/* Header - LeetCode Style */}
      <div className="flex items-center justify-between border-b border-[#333333] pb-3 font-mono">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-[#eff1f6] tracking-tight">Dataset Schema & Telemetry</h1>
            <span className="text-[10px] bg-[#00b8a3]/15 text-[#00b8a3] border border-[#00b8a3]/30 px-2 py-0.5 rounded font-bold">
              VERIFIED
            </span>
          </div>
          <p className="text-xs text-[#8c8c8c] mt-0.5">
            Elliptic Bitcoin Transaction Graph ground-truth data sources and database ingestion telemetry
          </p>
        </div>
        <button
          onClick={fetchStatus}
          className="px-3 py-1 bg-[#262626] border border-[#3e3e3e] hover:bg-[#333333] rounded text-xs font-mono font-medium text-[#eff1f6] shadow-sm flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#ffa116] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {loading ? (
        <div className="h-44 bg-[#262626] border border-[#333333] rounded animate-pulse"></div>
      ) : !status ? (
        <div className="p-4 bg-[#262626] border border-[#ef4743]/50 text-[#ef4743] rounded text-xs font-mono">Failed to load dataset status.</div>
      ) : (
        <div className="space-y-4 font-mono">
          {/* Dataset Profile Card */}
          <div className="bg-[#262626] p-4 rounded border border-[#333333] shadow-sm space-y-3">
            <div className="flex items-center space-x-2 border-b border-[#333333] pb-2">
              <Database className="w-4 h-4 text-[#ffa116]" />
              <div>
                <h2 className="text-xs font-bold text-[#eff1f6]">{status.dataset_name}</h2>
                <div className="text-[10px] text-[#8c8c8c]">Path: {status.dataset_path}</div>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-[#1f1f1f] rounded border border-[#333333]">
                <div className="text-[10px] uppercase font-semibold text-[#8c8c8c]">Total Transactions</div>
                <div className="text-base font-bold text-[#eff1f6] mt-0.5">
                  {status.metadata.total_transactions.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 bg-[#1f1f1f] rounded border border-[#333333]">
                <div className="text-[10px] uppercase font-semibold text-[#8c8c8c]">Directed Edges</div>
                <div className="text-base font-bold text-[#eff1f6] mt-0.5">
                  {status.metadata.total_edges.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 bg-[#1f1f1f] rounded border border-[#333333]">
                <div className="text-[10px] uppercase font-semibold text-[#8c8c8c]">Feature Dimensions</div>
                <div className="text-base font-bold text-[#ffa116] mt-0.5">
                  {status.metadata.features_count} dims
                </div>
              </div>

              <div className="p-2.5 bg-[#1f1f1f] rounded border border-[#333333]">
                <div className="text-[10px] uppercase font-semibold text-[#8c8c8c]">Time Steps</div>
                <div className="text-base font-bold text-[#00b8a3] mt-0.5">
                  {status.metadata.time_steps_count} snapshots
                </div>
              </div>
            </div>

            {/* Class Breakdown */}
            <div className="p-3 bg-[#1f1f1f] rounded border border-[#333333] space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#eff1f6]">
                Ground-Truth Class Breakdown
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-[#262626] rounded border border-[#ef4743]/30">
                  <div className="text-[10px] uppercase font-bold text-[#ef4743]">Known Illicit (Class 1)</div>
                  <div className="text-base font-bold text-[#ef4743] mt-0.5">
                    {status.metadata.known_illicit.toLocaleString()} (2.23%)
                  </div>
                  <div className="text-[9px] text-[#8c8c8c] mt-0.5">Ransomware, malware, darknet</div>
                </div>

                <div className="p-2.5 bg-[#262626] rounded border border-[#00b8a3]/30">
                  <div className="text-[10px] uppercase font-bold text-[#00b8a3]">Known Licit (Class 2)</div>
                  <div className="text-base font-bold text-[#00b8a3] mt-0.5">
                    {status.metadata.known_licit.toLocaleString()} (20.62%)
                  </div>
                  <div className="text-[9px] text-[#8c8c8c] mt-0.5">Exchanges, miners, wallets</div>
                </div>

                <div className="p-2.5 bg-[#262626] rounded border border-[#ffc01e]/30">
                  <div className="text-[10px] uppercase font-bold text-[#ffc01e]">Unknown (Unlabeled)</div>
                  <div className="text-base font-bold text-[#ffc01e] mt-0.5">
                    {status.metadata.unknown.toLocaleString()} (77.15%)
                  </div>
                  <div className="text-[9px] text-[#8c8c8c] mt-0.5">Target entities for ML inference</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
