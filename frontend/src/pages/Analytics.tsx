import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, Network, PieChart as PieIcon, Terminal } from 'lucide-react';
import { api } from '../services/api';

export const Analytics: React.FC = () => {
  const [overview, setOverview] = useState<any | null>(null);
  const [timeSeries, setTimeSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getAnalyticsOverview(),
      api.getTimeSeries()
    ])
      .then(([ov, ts]) => {
        setOverview(ov);
        setTimeSeries(ts);
      })
      .catch((err) => console.warn(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !overview) {
    return (
      <div className="p-5 space-y-4 max-w-7xl mx-auto font-mono">
        <div className="h-6 w-48 bg-[#262626] border border-[#333333] animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-[#262626] border border-[#333333] animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const classData = [
    { name: 'Illicit (Hard)', value: overview.illicit_transactions, color: '#ef4743' },
    { name: 'Licit (Easy)', value: overview.licit_transactions, color: '#00b8a3' },
    { name: 'Unknown (Medium)', value: overview.unknown_transactions, color: '#8c8c8c' },
  ];

  const riskData = Object.entries(overview.risk_distribution || {}).map(([k, v]) => ({
    name: k,
    count: v,
    color: k === 'CRITICAL' ? '#ef4743' : k === 'HIGH' ? '#ffa116' : k === 'MEDIUM' ? '#ffc01e' : '#00b8a3'
  }));

  const degreeData = Object.entries(overview.degree_distribution || {}).map(([k, v]) => ({
    bucket: `${k} flows`,
    count: v
  }));

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto font-sans text-[#eff1f6]">
      {/* Header - LeetCode Style */}
      <div className="border-b border-[#333333] pb-3 font-mono">
        <div className="flex items-center space-x-2">
          <h1 className="text-base font-bold text-[#eff1f6] tracking-tight">Macro Forensic Analytics</h1>
          <span className="text-[10px] bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30 px-2 py-0.5 rounded font-bold">
            DATASET METRICS
          </span>
        </div>
        <p className="text-xs text-[#8c8c8c] mt-0.5">
          Global class distributions, degree power laws, and temporal progression across Bitcoin network transactions
        </p>
      </div>

      {/* Grid of Analytical Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
        {/* 1. Temporal Volumes Breakdown */}
        <div className="bg-[#262626] p-3.5 rounded border border-[#333333] shadow-xs space-y-2.5">
          <div className="border-b border-[#333333] pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6]">
              Temporal Flow Composition (49 Time Steps)
            </h2>
            <p className="text-[10px] text-[#8c8c8c]">
              Stacked distribution of licit, illicit, and unknown transactions per snapshot
            </p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="time_step" tick={{ fontSize: 10, fill: '#8c8c8c' }} />
                <YAxis tick={{ fontSize: 10, fill: '#8c8c8c' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '4px', color: '#eff1f6', fontSize: '11px', border: '1px solid #3e3e3e', fontFamily: 'monospace' }}
                />
                <Bar dataKey="illicit" name="Illicit" stackId="a" fill="#ef4743" />
                <Bar dataKey="licit" name="Licit" stackId="a" fill="#00b8a3" />
                <Bar dataKey="unknown" name="Unknown" stackId="a" fill="#555555" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Class Imbalance Breakdown */}
        <div className="bg-[#262626] p-3.5 rounded border border-[#333333] shadow-xs space-y-2.5">
          <div className="border-b border-[#333333] pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6]">
              Ground-Truth Class Ratio (Imbalance Profile)
            </h2>
            <p className="text-[10px] text-[#8c8c8c]">
              Extreme class imbalance in Bitcoin transaction networks (96.7% non-illicit)
            </p>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(1)}%`}
                >
                  {classData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '4px', color: '#eff1f6', fontSize: '11px', border: '1px solid #3e3e3e', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Graph Degree Distribution */}
        <div className="bg-[#262626] p-3.5 rounded border border-[#333333] shadow-xs space-y-2.5">
          <div className="border-b border-[#333333] pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6]">
              Network Degree Distribution (Power Law)
            </h2>
            <p className="text-[10px] text-[#8c8c8c]">
              Degree frequencies showing heavy-tailed aggregation hubs versus standard transfer nodes
            </p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={degreeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#8c8c8c' }} />
                <YAxis tick={{ fontSize: 10, fill: '#8c8c8c' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '4px', color: '#eff1f6', fontSize: '11px', border: '1px solid #3e3e3e', fontFamily: 'monospace' }}
                />
                <Bar dataKey="count" name="Entities" fill="#ffa116" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Risk Tiers Distribution */}
        <div className="bg-[#262626] p-3.5 rounded border border-[#333333] shadow-xs space-y-2.5">
          <div className="border-b border-[#333333] pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6]">
              Composite Risk Score Distribution
            </h2>
            <p className="text-[10px] text-[#8c8c8c]">
              Quantified composite triage scores across all ingested transactions
            </p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8c8c8c' }} />
                <YAxis tick={{ fontSize: 10, fill: '#8c8c8c' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '4px', color: '#eff1f6', fontSize: '11px', border: '1px solid #3e3e3e', fontFamily: 'monospace' }}
                />
                <Bar dataKey="count" name="Transactions" fill="#00b8a3" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
