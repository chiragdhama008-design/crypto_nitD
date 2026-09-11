import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { LabelBadge } from '../components/common/LabelBadge';

export const RiskAlerts: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const levelFilter = searchParams.get('level') || 'CRITICAL';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [alerts, setAlerts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ critical: 0, high: 0, medium: 0, low: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = () => {
    setLoading(true);
    api.getHighRiskQueue({
      level: levelFilter || undefined,
      page,
      limit: 25,
    })
      .then((res) => {
        setAlerts(res.transactions);
        setTotal(res.total);
        setCounts({
          critical: res.critical_count,
          high: res.high_count,
          medium: res.medium_count,
          low: res.low_count,
        });
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, [levelFilter, page]);

  const handleLevelChange = (lvl: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('level', lvl);
    next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="p-4 space-y-3.5 max-w-7xl mx-auto font-sans text-[#eff1f6]">
      {/* Header - LeetCode Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#333333] pb-3 font-mono">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-[#eff1f6] tracking-tight">
              Risk & Alert Triage Queue
            </h1>
            <span className="text-[10px] font-semibold bg-[#ef4743]/15 text-[#ef4743] border border-[#ef4743]/30 px-2 py-0.5 rounded">
              ANOMALY ENGINE
            </span>
          </div>
          <p className="text-xs text-[#8c8c8c] mt-0.5">
            Priority investigation queue flagged by ML probabilities, illicit exposure, and topology
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="px-3 py-1.5 bg-[#262626] border border-[#3e3e3e] hover:bg-[#333333] rounded text-xs font-medium text-[#eff1f6] shadow-sm flex items-center space-x-1.5 self-start transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#ffa116] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Severity Filter Tabs - LeetCode Difficulty Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
        {[
          { key: 'CRITICAL', label: 'Critical Risk', count: counts.critical, color: 'text-[#ef4743]', activeBorder: 'border-[#ef4743] bg-[#ef4743]/10' },
          { key: 'HIGH', label: 'High Risk', count: counts.high, color: 'text-[#ffa116]', activeBorder: 'border-[#ffa116] bg-[#ffa116]/10' },
          { key: 'MEDIUM', label: 'Medium Risk', count: counts.medium, color: 'text-[#ffc01e]', activeBorder: 'border-[#ffc01e] bg-[#ffc01e]/10' },
          { key: 'LOW', label: 'Low Risk', count: counts.low, color: 'text-[#00b8a3]', activeBorder: 'border-[#00b8a3] bg-[#00b8a3]/10' },
        ].map((tab) => {
          const isActive = levelFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleLevelChange(tab.key)}
              className={`p-2.5 rounded border text-left transition-all ${
                isActive
                  ? `${tab.activeBorder} shadow-sm`
                  : 'bg-[#262626] border-[#333333] hover:bg-[#2c2c2c]'
              }`}
            >
              <div className="text-[10px] text-[#8c8c8c] uppercase font-semibold">{tab.label}</div>
              <div className={`text-base font-bold font-mono mt-0.5 ${tab.color}`}>
                {tab.count.toLocaleString()}
              </div>
            </button>
          );
        })}
      </div>

      {/* Table Container */}
      <div className="bg-[#262626] rounded border border-[#333333] shadow-sm overflow-hidden font-mono">
        <div className="overflow-x-auto">
          <table className="leetcode-table">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Step</th>
                <th>Ground Truth</th>
                <th>Model Prediction</th>
                <th>Probability</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Degree</th>
                <th className="text-right">Inspect</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="py-2.5 px-4">
                      <div className="h-4 bg-[#333333] rounded animate-pulse w-full"></div>
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#ef4743] text-xs">
                    Error loading alerts: {error}
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#8c8c8c] text-xs">
                    No transactions matching risk tier "{levelFilter}".
                  </td>
                </tr>
              ) : (
                alerts.map((tx) => (
                  <tr
                    key={tx.transaction_id}
                    onClick={() => navigate(`/transactions/${tx.transaction_id}`)}
                    className="cursor-pointer hover:bg-[#2e2e2e] transition-colors"
                  >
                    <td className="font-bold text-[#eff1f6] hover:text-[#ffa116]">
                      #{tx.transaction_id}
                    </td>
                    <td className="text-[#8c8c8c]">
                      {tx.time_step}
                    </td>
                    <td>
                      <LabelBadge label={tx.known_label} />
                    </td>
                    <td>
                      {tx.prediction ? (
                        <LabelBadge label={tx.prediction} isPrediction />
                      ) : (
                        <span className="text-[#6b7280] text-xs">—</span>
                      )}
                    </td>
                    <td className="text-[#d1d5db]">
                      {tx.prediction_probability !== null && tx.prediction_probability !== undefined
                        ? `${(tx.prediction_probability * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                    <td>
                      <span className="font-bold text-[#eff1f6]">{tx.risk_score}</span>
                      <span className="text-[#6b7280] text-[10px]">/100</span>
                    </td>
                    <td>
                      <RiskBadge score={tx.risk_score} level={tx.risk_level} showScore={false} />
                    </td>
                    <td className="text-[#8c8c8c] text-[11px]">
                      {tx.total_degree} edges ({tx.in_degree}↓ {tx.out_degree}↑)
                    </td>
                    <td className="text-right">
                      <span className="text-xs text-[#ffa116] hover:text-[#ffb84d] font-medium inline-flex items-center space-x-1">
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

        {/* Pagination Bar */}
        <div className="px-4 py-2 bg-[#202020] border-t border-[#333333] flex items-center justify-between text-xs text-[#8c8c8c]">
          <div>
            Showing <span className="text-[#eff1f6] font-semibold">{alerts.length > 0 ? (page - 1) * 25 + 1 : 0}</span> to{' '}
            <span className="text-[#eff1f6] font-semibold">{Math.min(page * 25, total)}</span> of{' '}
            <span className="text-[#eff1f6] font-semibold">{total.toLocaleString()}</span> entries
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set('page', Math.max(1, page - 1).toString());
                setSearchParams(next);
              }}
              disabled={page <= 1 || loading}
              className="px-2.5 py-1 bg-[#2a2a2a] border border-[#3e3e3e] rounded text-[#eff1f6] disabled:opacity-30 hover:bg-[#333333] flex items-center space-x-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <span className="text-[#ffa116] font-bold">
              Page {page}
            </span>
            <button
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set('page', (page + 1).toString());
                setSearchParams(next);
              }}
              disabled={alerts.length < 25 || loading}
              className="px-2.5 py-1 bg-[#2a2a2a] border border-[#3e3e3e] rounded text-[#eff1f6] disabled:opacity-30 hover:bg-[#333333] flex items-center space-x-1 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
