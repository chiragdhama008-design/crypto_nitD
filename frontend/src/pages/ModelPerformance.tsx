import React, { useEffect, useState } from 'react';
import {
  Cpu,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BarChart2,
  Terminal
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';
import { ModelMetrics } from '../types/api';

export const ModelPerformance: React.FC = () => {
  const [activeModel, setActiveModel] = useState<string>('gradient_boosting');
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availableModels = [
    { id: 'gradient_boosting', name: 'Gradient Boosting', badge: 'Active Default' },
    { id: 'random_forest', name: 'Random Forest', badge: 'High Precision' },
    { id: 'logistic_regression', name: 'Logistic Regression', badge: 'Baseline' },
  ];

  useEffect(() => {
    setLoading(true);
    api.getModelMetrics(activeModel)
      .then((res) => {
        setMetrics(res);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeModel]);

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto font-sans text-[#eff1f6]">
      {/* Header - LeetCode Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#333333] pb-3 font-mono">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-[#eff1f6] tracking-tight">
              ML Model Benchmark & Evaluation
            </h1>
            <span className="text-[10px] bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30 px-2 py-0.5 rounded font-bold">
              TEMPORAL SPLIT
            </span>
          </div>
          <p className="text-xs text-[#8c8c8c] mt-0.5">
            Strict temporal validation (Train: Steps 1-34 | Val: 35-39 | Test: 40-49)
          </p>
        </div>

        {/* Model Architecture Selector - LeetCode Tabs */}
        <div className="flex items-center space-x-1 bg-[#1f1f1f] p-1 rounded border border-[#333333]">
          {availableModels.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModel(m.id)}
              className={`px-3 py-1 text-xs rounded font-medium transition-all ${
                activeModel === m.id
                  ? 'bg-[#ffa116] text-[#1a1a1a] font-bold'
                  : 'text-[#8c8c8c] hover:text-[#eff1f6]'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 font-mono">
          <div className="h-16 bg-[#262626] border border-[#333333] animate-pulse rounded"></div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-[#262626] border border-[#333333] animate-pulse rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-[#262626] border border-[#333333] animate-pulse rounded"></div>
        </div>
      ) : error || !metrics ? (
        <div className="p-4 bg-[#262626] border border-[#ef4743]/50 rounded text-xs text-[#ef4743] space-y-2 font-mono">
          <div className="font-semibold flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Model Metrics Not Found</span>
          </div>
          <p className="text-[#d1d5db]">{error || 'Please run model training to generate evaluation artifacts.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Evaluation Strategy Banner */}
          <div className="p-2.5 bg-[#262626] border border-[#333333] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#8c8c8c]">Protocol:</span>
              <span className="text-[#eff1f6]">{metrics.evaluation_strategy}</span>
            </div>
            <div className="flex items-center space-x-3 text-[#8c8c8c] text-[11px]">
              <span>Train: <strong className="text-[#ffa116]">{metrics.training_period}</strong></span>
              <span>Test: <strong className="text-[#00b8a3]">{metrics.testing_period}</strong></span>
            </div>
          </div>

          {/* PRIMARY FORENSIC METRICS SPOTLIGHT */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#8c8c8c] mb-2 flex items-center space-x-1.5 font-mono">
              <Award className="w-3.5 h-3.5 text-[#ffa116]" />
              <span>Minority Illicit Class Anomaly Metrics</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono">
              <div className="bg-[#262626] p-2.5 rounded border border-[#ef4743]/30 bg-[#ef4743]/5">
                <div className="text-[10px] font-semibold text-[#ef4743] uppercase tracking-wider">Illicit Precision</div>
                <div className="text-xl font-bold text-[#ef4743] mt-0.5">
                  {(metrics.illicit_precision * 100).toFixed(1)}%
                </div>
                <div className="text-[9px] text-[#8c8c8c] mt-0.5">True illicit / Flags</div>
              </div>

              <div className="bg-[#262626] p-2.5 rounded border border-[#ef4743]/30 bg-[#ef4743]/5">
                <div className="text-[10px] font-semibold text-[#ef4743] uppercase tracking-wider">Illicit Recall</div>
                <div className="text-xl font-bold text-[#ef4743] mt-0.5">
                  {(metrics.illicit_recall * 100).toFixed(1)}%
                </div>
                <div className="text-[9px] text-[#8c8c8c] mt-0.5">Catch rate</div>
              </div>

              <div className="bg-[#262626] p-2.5 rounded border border-[#ef4743]/30 bg-[#ef4743]/5">
                <div className="text-[10px] font-semibold text-[#ef4743] uppercase tracking-wider">Illicit F1 Score</div>
                <div className="text-xl font-bold text-[#ef4743] mt-0.5">
                  {(metrics.illicit_f1 * 100).toFixed(1)}%
                </div>
                <div className="text-[9px] text-[#8c8c8c] mt-0.5">Harmonic balance</div>
              </div>

              <div className="bg-[#262626] p-2.5 rounded border border-[#333333]">
                <div className="text-[10px] font-semibold text-[#8c8c8c] uppercase tracking-wider">PR-AUC</div>
                <div className="text-xl font-bold text-[#ffa116] mt-0.5">
                  {metrics.pr_auc.toFixed(4)}
                </div>
                <div className="text-[9px] text-[#6b7280] mt-0.5">Precision-Recall Area</div>
              </div>

              <div className="bg-[#262626] p-2.5 rounded border border-[#333333]">
                <div className="text-[10px] font-semibold text-[#8c8c8c] uppercase tracking-wider">ROC-AUC</div>
                <div className="text-xl font-bold text-[#00b8a3] mt-0.5">
                  {metrics.roc_auc.toFixed(4)}
                </div>
                <div className="text-[9px] text-[#6b7280] mt-0.5">Discrimination power</div>
              </div>

              <div className="bg-[#262626] p-2.5 rounded border border-[#333333]">
                <div className="text-[10px] font-semibold text-[#8c8c8c] uppercase tracking-wider">Accuracy</div>
                <div className="text-xl font-bold text-[#eff1f6] mt-0.5">
                  {(metrics.accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-[9px] text-[#6b7280] mt-0.5">Global correctness</div>
              </div>
            </div>
          </div>

          {/* CHARTS: ROC Curve & PR Curve */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
            {/* PR Curve */}
            <div className="bg-[#262626] p-3 rounded border border-[#333333] space-y-2">
              <div className="flex items-center justify-between border-b border-[#333333] pb-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6]">
                  Precision-Recall Curve (PR-AUC: {metrics.pr_auc.toFixed(3)})
                </h3>
                <span className="text-[10px] text-[#ffa116]">Benchmark: 5.7%</span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.pr_curve} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                    <XAxis dataKey="recall" domain={[0, 1]} tick={{ fontSize: 10, fill: '#8c8c8c' }} label={{ value: 'Recall', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: '#8c8c8c' }} label={{ value: 'Precision', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '4px', color: '#eff1f6', fontSize: '11px', border: '1px solid #3e3e3e', fontFamily: 'monospace' }}
                    />
                    <Line type="monotone" dataKey="precision" stroke="#ef4743" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ROC Curve */}
            <div className="bg-[#262626] p-3 rounded border border-[#333333] space-y-2">
              <div className="flex items-center justify-between border-b border-[#333333] pb-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6]">
                  ROC Curve (ROC-AUC: {metrics.roc_auc.toFixed(3)})
                </h3>
                <span className="text-[10px] text-[#00b8a3]">TPR vs FPR</span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.roc_curve} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                    <XAxis dataKey="fpr" domain={[0, 1]} tick={{ fontSize: 10, fill: '#8c8c8c' }} label={{ value: 'FPR', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: '#8c8c8c' }} label={{ value: 'TPR', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '4px', color: '#eff1f6', fontSize: '11px', border: '1px solid #3e3e3e', fontFamily: 'monospace' }}
                    />
                    <Line type="monotone" dataKey="tpr" stroke="#ffa116" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* CONFUSION MATRIX & TOP FEATURE IMPORTANCES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
            {/* Confusion Matrix */}
            <div className="bg-[#262626] p-3 rounded border border-[#333333] space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6] border-b border-[#333333] pb-1.5">
                Test Confusion Matrix
              </h3>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 bg-[#1f1f1f] rounded border border-[#00b8a3]/30">
                  <div className="text-[10px] text-[#00b8a3] uppercase font-semibold">True Negatives</div>
                  <div className="text-base font-bold text-[#00b8a3] mt-0.5">
                    {metrics.confusion_matrix.true_negative.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-[#8c8c8c]">Licit As Licit</div>
                </div>

                <div className="p-2.5 bg-[#1f1f1f] rounded border border-[#ffc01e]/30">
                  <div className="text-[10px] text-[#ffc01e] uppercase font-semibold">False Positives</div>
                  <div className="text-base font-bold text-[#ffc01e] mt-0.5">
                    {metrics.confusion_matrix.false_positive.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-[#8c8c8c]">Licit Flagged</div>
                </div>

                <div className="p-2.5 bg-[#1f1f1f] rounded border border-[#ef4743]/30">
                  <div className="text-[10px] text-[#ef4743] uppercase font-semibold">False Negatives</div>
                  <div className="text-base font-bold text-[#ef4743] mt-0.5">
                    {metrics.confusion_matrix.false_negative.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-[#8c8c8c]">Missed Illicit</div>
                </div>

                <div className="p-2.5 bg-[#1f1f1f] rounded border border-[#00b8a3]/30">
                  <div className="text-[10px] text-[#00b8a3] uppercase font-semibold">True Positives</div>
                  <div className="text-base font-bold text-[#00b8a3] mt-0.5">
                    {metrics.confusion_matrix.true_positive.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-[#8c8c8c]">Caught Illicit</div>
                </div>
              </div>
            </div>

            {/* Feature Importances */}
            <div className="md:col-span-2 bg-[#262626] p-3 rounded border border-[#333333] space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6] border-b border-[#333333] pb-1.5">
                Top Contributing Feature Weights ({metrics.model_name})
              </h3>
              <div className="overflow-y-auto max-h-56 space-y-1 pr-1">
                {metrics.feature_importances.slice(0, 10).map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-[#1e1e1e] rounded border border-[#333333]">
                    <div className="flex items-center space-x-2">
                      <span className="text-[#8c8c8c] text-[10px]">#{i + 1}</span>
                      <span className="font-semibold text-[#eff1f6]">{f.feature_name}</span>
                      <span className="text-[10px] text-[#8c8c8c]">({f.category})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-[#2a2a2a] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#ffa116] h-1.5 rounded-full"
                          style={{ width: `${(f.importance / (metrics.feature_importances[0]?.importance || 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[#d1d5db] font-bold w-12 text-right">
                        {(f.importance * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
