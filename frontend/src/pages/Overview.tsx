import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Layers,
  Network,
  Activity,
  ArrowRight,
  TrendingUp,
  Cpu,
  AlertTriangle,
  FileSearch,
  Terminal
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';
import { DashboardOverview } from '../types/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { LabelBadge } from '../components/common/LabelBadge';

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getDashboard()
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-5 space-y-4 max-w-7xl mx-auto">
        <div className="h-6 w-48 bg-[#2a2a2a] animate-pulse rounded"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-18 bg-[#262626] border border-[#333333] animate-pulse rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-[#262626] border border-[#333333] animate-pulse rounded"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-5 max-w-7xl mx-auto">
        <div className="bg-[#262626] border border-[#ef4743]/50 rounded p-4 text-[#ef4743] text-xs space-y-2 font-mono">
          <div className="font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#ef4743]" />
            <span>Dashboard Initialization Error</span>
          </div>
          <p>{error || 'Unable to connect to backend forensic database.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto font-sans">
      {/* Page Title & Breadcrumb - LeetCode Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#333333] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-[#eff1f6] tracking-tight font-mono">
              Forensic Intelligence Dashboard
            </h1>
            <span className="text-[10px] font-mono bg-[#2a2a2a] text-[#00b8a3] border border-[#00b8a3]/30 px-1.5 py-0.5 rounded font-semibold">
              LIVE SYSTEM
            </span>
          </div>
          <p className="text-xs text-[#8c8c8c] font-mono mt-0.5">
            Elliptic Bitcoin Dataset | 49 Temporal Time Steps | Graph ML Pipeline
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/transactions')}
            className="px-3 py-1.5 bg-[#262626] border border-[#3e3e3e] hover:bg-[#333333] rounded text-xs font-mono font-medium text-[#eff1f6] shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            <FileSearch className="w-3.5 h-3.5 text-[#ffa116]" />
            <span>Problem Explorer</span>
          </button>
          <button
            onClick={() => navigate('/investigations')}
            className="px-3 py-1.5 bg-[#ffa116] hover:bg-[#ffb84d] text-[#1a1a1a] rounded text-xs font-mono font-bold shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            <span>Cases Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. Compact Summary Metric Row (LeetCode Stats Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <div className="bg-[#262626] p-2.5 rounded border border-[#333333] shadow-xs">
          <div className="text-[10px] font-mono font-medium text-[#8c8c8c] uppercase tracking-wider">Total Txs</div>
          <div className="text-base font-bold font-mono text-[#eff1f6] mt-0.5">
            {data.total_transactions.toLocaleString()}
          </div>
          <div className="text-[9px] text-[#6b7280] font-mono mt-0.5">Full Graph Set</div>
        </div>

        <div className="bg-[#262626] p-2.5 rounded border border-[#333333] shadow-xs">
          <div className="text-[10px] font-mono font-medium text-[#8c8c8c] uppercase tracking-wider">Known Labeled</div>
          <div className="text-base font-bold font-mono text-[#ffa116] mt-0.5">
            {data.known_transactions.toLocaleString()}
          </div>
          <div className="text-[9px] text-[#6b7280] font-mono mt-0.5">Ground Truth</div>
        </div>

        <div className="bg-[#262626] p-2.5 rounded border border-[#ef4743]/30 bg-[#ef4743]/5 shadow-xs">
          <div className="text-[10px] font-mono font-medium text-[#ef4743] uppercase tracking-wider">Illicit Txs</div>
          <div className="text-base font-bold font-mono text-[#ef4743] mt-0.5">
            {data.illicit_transactions.toLocaleString()}
          </div>
          <div className="text-[9px] text-[#ef4743]/80 font-mono mt-0.5">Hard / Criminal</div>
        </div>

        <div className="bg-[#262626] p-2.5 rounded border border-[#00b8a3]/30 bg-[#00b8a3]/5 shadow-xs">
          <div className="text-[10px] font-mono font-medium text-[#00b8a3] uppercase tracking-wider">Licit Txs</div>
          <div className="text-base font-bold font-mono text-[#00b8a3] mt-0.5">
            {data.licit_transactions.toLocaleString()}
          </div>
          <div className="text-[9px] text-[#00b8a3]/80 font-mono mt-0.5">Easy / Verified</div>
        </div>

        <div className="bg-[#262626] p-2.5 rounded border border-[#ffc01e]/30 bg-[#ffc01e]/5 shadow-xs">
          <div className="text-[10px] font-mono font-medium text-[#ffc01e] uppercase tracking-wider">Unknown Txs</div>
          <div className="text-base font-bold font-mono text-[#ffc01e] mt-0.5">
            {data.unknown_transactions.toLocaleString()}
          </div>
          <div className="text-[9px] text-[#ffc01e]/80 font-mono mt-0.5">Medium / Unlabeled</div>
        </div>

        <div className="bg-[#262626] p-2.5 rounded border border-[#333333] shadow-xs">
          <div className="text-[10px] font-mono font-medium text-[#8c8c8c] uppercase tracking-wider">Flow Edges</div>
          <div className="text-base font-bold font-mono text-[#eff1f6] mt-0.5">
            {data.total_edges.toLocaleString()}
          </div>
          <div className="text-[9px] text-[#6b7280] font-mono mt-0.5">Directed Graph</div>
        </div>

        <div className="bg-[#262626] p-2.5 rounded border border-[#333333] shadow-xs">
          <div className="text-[10px] font-mono font-medium text-[#8c8c8c] uppercase tracking-wider">Active ML</div>
          <div className="text-xs font-bold font-mono text-[#ffa116] mt-1 truncate">
            {data.active_model.replace('_', ' ').toUpperCase()}
          </div>
          <div className="text-[9px] text-[#00b8a3] font-mono mt-1">96.16% ACC / 0.81 F1</div>
        </div>
      </div>

      {/* 2. Charts & Distributions Section - LeetCode Dark View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Transaction & Illicit Activity Over Time */}
        <div className="lg:col-span-2 bg-[#262626] p-3.5 rounded border border-[#333333] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#333333] pb-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6] font-mono">
                Transaction & Illicit Flow Activity (49 Temporal Steps)
              </h2>
              <p className="text-[10px] text-[#8c8c8c] font-mono">
                Network progression and detected criminal activity bursts over time
              </p>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-mono">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#ffa116]"></span>
                <span className="text-[#d1d5db]">Total Volume</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4743]"></span>
                <span className="text-[#d1d5db]">Illicit Activity</span>
              </span>
            </div>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.time_series} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffa116" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ffa116" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="illicitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4743" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ef4743" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="time_step" tick={{ fontSize: 10, fill: '#8c8c8c' }} />
                <YAxis tick={{ fontSize: 10, fill: '#8c8c8c' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '4px',
                    color: '#eff1f6',
                    fontSize: '11px',
                    border: '1px solid #3e3e3e',
                    fontFamily: 'monospace'
                  }}
                />
                <Area type="monotone" dataKey="total_txs" name="Total Volume" stroke="#ffa116" fill="url(#totalGrad)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="illicit_txs" name="Illicit Volume" stroke="#ef4743" fill="url(#illicitGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Breakdown - LeetCode Difficulty Card */}
        <div className="bg-[#262626] p-3.5 rounded border border-[#333333] shadow-xs space-y-2.5">
          <div className="border-b border-[#333333] pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6] font-mono">
              Risk Tier Distribution
            </h2>
            <p className="text-[10px] text-[#8c8c8c] font-mono">
              Composite forensic scoring categories across dataset
            </p>
          </div>

          <div className="space-y-2 pt-1 font-mono">
            {[
              { level: 'CRITICAL', range: '81 - 100', count: data.risk_distribution.CRITICAL, barColor: 'bg-[#ef4743]', textColor: 'text-[#ef4743]' },
              { level: 'HIGH', range: '61 - 80', count: data.risk_distribution.HIGH, barColor: 'bg-[#ffa116]', textColor: 'text-[#ffa116]' },
              { level: 'MEDIUM', range: '31 - 60', count: data.risk_distribution.MEDIUM, barColor: 'bg-[#ffc01e]', textColor: 'text-[#ffc01e]' },
              { level: 'LOW', range: '0 - 30', count: data.risk_distribution.LOW, barColor: 'bg-[#00b8a3]', textColor: 'text-[#00b8a3]' },
            ].map((tier) => {
              const pct = data.total_transactions > 0
                ? ((tier.count / data.total_transactions) * 100).toFixed(1)
                : '0';
              return (
                <div key={tier.level} className="p-2 rounded border border-[#333333] bg-[#1e1e1e] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${tier.textColor}`}>{tier.level}</span>
                    <span className="text-[#d1d5db] font-semibold">{tier.count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#2a2a2a] h-1.5 rounded-full overflow-hidden">
                    <div className={`${tier.barColor} h-1.5 rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-[10px] text-[#8c8c8c] border-t border-[#333333] flex items-center justify-between font-mono">
            <span>Model: Gradient Boosting</span>
            <button onClick={() => navigate('/models')} className="text-[#ffa116] hover:underline font-semibold">
              View Metrics →
            </button>
          </div>
        </div>
      </div>

      {/* 3. High-Risk Transactions Table */}
      <div className="bg-[#262626] rounded border border-[#333333] shadow-xs overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#333333] flex items-center justify-between bg-[#222222]">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6] font-mono">
              High-Risk Priority Queue
            </h2>
            <p className="text-[10px] text-[#8c8c8c] font-mono">
              Transactions flagged with critical anomaly or illicit neighborhood exposure
            </p>
          </div>
          <button
            onClick={() => navigate('/risk')}
            className="text-xs text-[#ffa116] hover:text-[#ffb84d] font-mono font-semibold flex items-center space-x-1"
          >
            <span>View All Alerts ({data.risk_distribution.CRITICAL + data.risk_distribution.HIGH})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="leetcode-table">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Step</th>
                <th>Ground Truth</th>
                <th>Prediction</th>
                <th>Probability</th>
                <th>Risk Score</th>
                <th>Degree</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.high_risk_preview.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-[#8c8c8c] font-mono text-xs">
                    No high-risk transactions recorded.
                  </td>
                </tr>
              ) : (
                data.high_risk_preview.map((tx) => (
                  <tr
                    key={tx.transaction_id}
                    onClick={() => navigate(`/transactions/${tx.transaction_id}`)}
                    className="cursor-pointer hover:bg-[#2e2e2e] transition-colors"
                  >
                    <td className="font-mono font-bold text-[#eff1f6] hover:text-[#ffa116]">
                      #{tx.transaction_id}
                    </td>
                    <td className="font-mono text-[#8c8c8c]">
                      {tx.time_step}
                    </td>
                    <td>
                      <LabelBadge label={tx.known_label} />
                    </td>
                    <td>
                      {tx.prediction ? (
                        <LabelBadge label={tx.prediction} isPrediction />
                      ) : (
                        <span className="text-[#6b7280] text-xs font-mono">—</span>
                      )}
                    </td>
                    <td className="font-mono text-[#d1d5db]">
                      {tx.prediction_probability !== null && tx.prediction_probability !== undefined
                        ? `${(tx.prediction_probability * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                    <td>
                      <RiskBadge score={tx.risk_score} level={tx.risk_level} />
                    </td>
                    <td className="font-mono text-[#8c8c8c] text-[11px]">
                      {tx.total_degree} edges ({tx.in_degree}↓ {tx.out_degree}↑)
                    </td>
                    <td className="text-right">
                      <span className="text-xs text-[#ffa116] hover:text-[#ffb84d] font-mono font-medium inline-flex items-center space-x-1">
                        <span>Investigate</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
