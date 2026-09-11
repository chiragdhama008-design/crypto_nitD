import React, { useEffect, useState } from 'react';
import { FileText, Printer, Briefcase, Download, Shield } from 'lucide-react';
import { api } from '../services/api';
import { InvestigationCase } from '../types/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { LabelBadge } from '../components/common/LabelBadge';

export const Reports: React.FC = () => {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    api.getCases()
      .then((res) => {
        setCases(res);
        if (res.length > 0) {
          setSelectedCaseId(res[0].id);
        }
      })
      .catch((err) => console.warn(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      setReportLoading(true);
      api.getCaseReport(selectedCaseId)
        .then(setReport)
        .catch((err) => console.warn(err))
        .finally(() => setReportLoading(false));
    }
  }, [selectedCaseId]);

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto font-sans text-[#eff1f6]">
      {/* Header - LeetCode Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#333333] pb-3 print:hidden font-mono">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-[#eff1f6] tracking-tight">Forensic Intelligence Reports</h1>
            <span className="text-[10px] bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30 px-2 py-0.5 rounded font-bold">
              AUDIT READY
            </span>
          </div>
          <p className="text-xs text-[#8c8c8c] mt-0.5">
            Case-ready intelligence dossiers for law enforcement support, regulatory inquiries, and internal audits
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {cases.length > 0 && (
            <select
              value={selectedCaseId || ''}
              onChange={(e) => setSelectedCaseId(Number(e.target.value))}
              className="text-xs py-1 px-2 bg-[#1a1a1a] border border-[#3e3e3e] rounded font-mono font-bold text-[#eff1f6] focus:outline-none focus:border-[#ffa116]"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  Case #{c.id}: {c.case_name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => window.print()}
            disabled={!report}
            className="px-3 py-1 bg-[#ffa116] hover:bg-[#ffb84d] text-[#1a1a1a] rounded text-xs font-mono font-bold shadow-sm flex items-center space-x-1.5 disabled:opacity-40 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {loading || reportLoading ? (
        <div className="p-8 bg-[#262626] rounded border border-[#333333] text-center text-xs text-[#8c8c8c] font-mono">
          Generating forensic dossier...
        </div>
      ) : !report ? (
        <div className="p-8 bg-[#262626] rounded border border-[#333333] text-center text-xs text-[#8c8c8c] font-mono">
          No case report available. Please create or select an investigation case.
        </div>
      ) : (
        /* PRINTABLE FORENSIC DOSSIER */
        <div className="bg-[#262626] p-6 rounded border border-[#333333] shadow-sm space-y-5 print:bg-white print:text-black print:border-none print:shadow-none print:p-0 font-mono">
          {/* Header */}
          <div className="border-b-2 border-[#ffa116] pb-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#ffa116]">
                CHAINGUARD FORENSIC INTELLIGENCE DOSSIER
              </div>
              <h2 className="text-lg font-bold text-[#eff1f6] print:text-black mt-0.5">TRACE-X Investigation Report</h2>
              <div className="text-xs text-[#8c8c8c] print:text-gray-600 mt-1">
                Generated: {new Date(report.generated_at).toUTCString()} | Reference: {report.investigator}
              </div>
            </div>
            <div className="w-8 h-8 rounded bg-[#1f1f1f] border border-[#3e3e3e] text-[#ffa116] flex items-center justify-center font-bold text-xs tracking-wider">
              TX
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-[#1f1f1f] print:bg-gray-100 rounded border border-[#333333] print:border-gray-300 text-xs">
            <div><span className="text-[#8c8c8c] print:text-gray-500 block text-[10px]">CASE ID</span>#{report.case_id}</div>
            <div><span className="text-[#8c8c8c] print:text-gray-500 block text-[10px]">STATUS</span>{report.status}</div>
            <div><span className="text-[#8c8c8c] print:text-gray-500 block text-[10px]">ENTITIES</span>{report.risk_assessment_summary.total_investigated}</div>
            <div><span className="text-[#8c8c8c] print:text-gray-500 block text-[10px]">AVG RISK</span>{report.risk_assessment_summary.average_risk_score} / 100</div>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#ffa116] text-[11px] mb-1">Executive Summary</h4>
            <p className="bg-[#1f1f1f] print:bg-gray-50 p-3 rounded border border-[#333333] print:border-gray-200 text-[#d1d5db] print:text-black text-xs leading-relaxed font-sans">
              {report.executive_summary}
            </p>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#ffa116] text-[11px] mb-1">Network Topology Findings</h4>
            <p className="bg-[#1f1f1f] print:bg-gray-50 p-3 rounded border border-[#333333] print:border-gray-200 text-[#d1d5db] print:text-black text-xs leading-relaxed font-sans">
              {report.network_findings.topology_summary}
            </p>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#ffa116] text-[11px] mb-1">Investigated Entities Registry</h4>
            <div className="overflow-x-auto border border-[#333333] print:border-gray-300 rounded">
              <table className="leetcode-table print:text-black">
                <thead>
                  <tr>
                    <th>TX ID</th>
                    <th>Step</th>
                    <th>Ground Truth</th>
                    <th>Model Prediction</th>
                    <th>Risk Score</th>
                    <th>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {report.investigated_transactions.map((t: any) => (
                    <tr key={t.transaction_id}>
                      <td className="font-bold text-[#eff1f6] print:text-black">TX #{t.transaction_id}</td>
                      <td className="text-[#8c8c8c] print:text-gray-600">Step {t.time_step}</td>
                      <td><LabelBadge label={t.known_label} /></td>
                      <td>{t.prediction ? <LabelBadge label={t.prediction} isPrediction /> : '—'}</td>
                      <td className="font-bold text-[#eff1f6] print:text-black">{t.risk_score}</td>
                      <td><RiskBadge score={t.risk_score} level={t.risk_level} showScore={false} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-[#1f1f1f] print:bg-amber-50 border border-[#333333] print:border-amber-200 rounded text-[11px] text-[#8c8c8c] print:text-amber-900">
            <strong className="text-[#ffa116]">Methodology & Limitations: </strong>
            {report.methodology_and_limitations}
          </div>
        </div>
      )}
    </div>
  );
};
