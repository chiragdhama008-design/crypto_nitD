import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Layers,
  Network,
  MessageSquare,
  FileText,
  Shield,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  ExternalLink,
  Printer,
  Terminal
} from 'lucide-react';
import { api } from '../services/api';
import { InvestigationCase, CaseStatus } from '../types/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { LabelBadge } from '../components/common/LabelBadge';

export const CaseDetail: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const cId = parseInt(caseId || '0', 10);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRANSACTIONS' | 'NOTES' | 'REPORT'>('OVERVIEW');
  const [caseData, setCaseData] = useState<InvestigationCase | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Note state
  const [newNote, setNewNote] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Senior Investigator');
  const [addingNote, setAddingNote] = useState(false);

  // Add Tx state
  const [txInput, setTxInput] = useState('');
  const [addingTx, setAddingTx] = useState(false);

  const fetchCase = () => {
    if (!cId) return;
    setLoading(true);
    api.getCase(cId)
      .then((res) => {
        setCaseData(res);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCase();
  }, [cId]);

  const handleStatusChange = async (newStatus: CaseStatus) => {
    try {
      const updated = await api.updateCase(cId, { status: newStatus });
      setCaseData(updated);
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await api.addNoteToCase(cId, newNote.trim(), undefined, noteAuthor.trim());
      setNewNote('');
      fetchCase();
    } catch (err: any) {
      alert(`Failed to add note: ${err.message}`);
    } finally {
      setAddingNote(false);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(txInput.trim(), 10);
    if (isNaN(parsed) || parsed <= 0) return;
    setAddingTx(true);
    try {
      await api.addTransactionsToCase(cId, [parsed]);
      setTxInput('');
      fetchCase();
    } catch (err: any) {
      alert(`Failed to add transaction: ${err.message}`);
    } finally {
      setAddingTx(false);
    }
  };

  const loadReport = () => {
    setActiveTab('REPORT');
    api.getCaseReport(cId)
      .then(setReportData)
      .catch((err) => alert(`Error generating report: ${err.message}`));
  };

  if (loading) {
    return (
      <div className="p-5 space-y-4 max-w-7xl mx-auto font-mono">
        <div className="h-7 w-64 bg-[#262626] border border-[#333333] animate-pulse rounded"></div>
        <div className="h-32 bg-[#262626] border border-[#333333] animate-pulse rounded"></div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="p-5 max-w-7xl mx-auto font-mono">
        <div className="bg-[#262626] border border-[#ef4743]/50 rounded p-4 text-[#ef4743] text-xs">
          Investigation Case #{cId} not found or failed to load.
        </div>
      </div>
    );
  }

  const txs = caseData.transactions || [];
  const notes = caseData.notes || [];

  return (
    <div className="p-4 space-y-3.5 max-w-7xl mx-auto font-sans text-[#eff1f6]">
      {/* Top Bar */}
      <div className="flex items-center justify-between font-mono">
        <button
          onClick={() => navigate('/investigations')}
          className="text-xs text-[#8c8c8c] hover:text-[#eff1f6] flex items-center space-x-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>&lt; Cases Board</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Status Switcher */}
          <select
            value={caseData.status}
            onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
            className="text-xs py-1 px-2 bg-[#1a1a1a] border border-[#3e3e3e] rounded font-bold text-[#eff1f6] focus:outline-none focus:border-[#ffa116]"
          >
            <option value="OPEN">Status: OPEN</option>
            <option value="UNDER REVIEW">Status: UNDER REVIEW</option>
            <option value="CLOSED">Status: CLOSED</option>
          </select>

          <button
            onClick={loadReport}
            className="px-3 py-1 bg-[#ffa116] hover:bg-[#ffb84d] text-[#1a1a1a] rounded text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Case Dossier</span>
          </button>
        </div>
      </div>

      {/* Case Header Card - LeetCode Style */}
      <div className="bg-[#262626] p-3.5 rounded border border-[#333333] shadow-sm space-y-2.5 font-mono">
        <div className="flex items-center justify-between border-b border-[#333333] pb-2">
          <div>
            <div className="text-[10px] font-bold text-[#ffa116] uppercase">
              CASE #{caseData.id}
            </div>
            <h1 className="text-base font-bold text-[#eff1f6] mt-0.5">{caseData.case_name}</h1>
          </div>
          <div className="text-right text-xs text-[#8c8c8c]">
            <div>Created: {new Date(caseData.created_at).toLocaleDateString()}</div>
            <div>Updated: {new Date(caseData.updated_at).toLocaleTimeString()}</div>
          </div>
        </div>

        <p className="text-xs text-[#d1d5db] font-sans">
          {caseData.description || 'No description provided.'}
        </p>

        {/* Case Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-[#333333] text-xs pt-1">
          {[
            { id: 'OVERVIEW', label: `Overview (${txs.length})` },
            { id: 'TRANSACTIONS', label: `Transactions (${txs.length})` },
            { id: 'NOTES', label: `Forensic Log (${notes.length})` },
            { id: 'REPORT', label: 'Report Preview' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'REPORT') loadReport();
                else setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-[#ffa116] text-[#eff1f6] font-bold'
                  : 'border-transparent text-[#8c8c8c] hover:text-[#d1d5db]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENTS */}
      {/* 1. OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
          <div className="md:col-span-2 bg-[#262626] p-3.5 rounded border border-[#333333] shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6] border-b border-[#333333] pb-1.5">
              Case Profile Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 bg-[#1f1f1f] rounded border border-[#333333]">
                <div className="text-[10px] uppercase font-semibold text-[#8c8c8c]">Attached TXs</div>
                <div className="text-base font-bold text-[#eff1f6] mt-0.5">{txs.length}</div>
              </div>
              <div className="p-2.5 bg-[#1f1f1f] rounded border border-[#ef4743]/30">
                <div className="text-[10px] uppercase font-semibold text-[#ef4743]">Illicit Entities</div>
                <div className="text-base font-bold text-[#ef4743] mt-0.5">
                  {txs.filter((t) => t.known_label === 'ILLICIT' || t.prediction === 'ILLICIT').length}
                </div>
              </div>
              <div className="p-2.5 bg-[#1f1f1f] rounded border border-[#ffa116]/30">
                <div className="text-[10px] uppercase font-semibold text-[#ffa116]">Critical Risk</div>
                <div className="text-base font-bold text-[#ffa116] mt-0.5">
                  {txs.filter((t) => t.risk_level === 'CRITICAL').length}
                </div>
              </div>
              <div className="p-2.5 bg-[#1f1f1f] rounded border border-[#333333]">
                <div className="text-[10px] uppercase font-semibold text-[#8c8c8c]">Logged Notes</div>
                <div className="text-base font-bold text-[#eff1f6] mt-0.5">{notes.length}</div>
              </div>
            </div>

            {/* Attached entities preview */}
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-[#eff1f6] mb-2">Subject Transactions</h4>
              <div className="space-y-1.5">
                {txs.map((t) => (
                  <div
                    key={t.transaction_id}
                    onClick={() => navigate(`/transactions/${t.transaction_id}`)}
                    className="p-2 bg-[#1f1f1f] hover:bg-[#2e2e2e] rounded border border-[#333333] cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#eff1f6] hover:text-[#ffa116]">TX #{t.transaction_id}</span>
                      <LabelBadge label={t.known_label} />
                      {t.prediction && <LabelBadge label={t.prediction} isPrediction />}
                    </div>
                    <div className="flex items-center space-x-2">
                      <RiskBadge score={t.risk_score} level={t.risk_level} />
                      <ExternalLink className="w-3 h-3 text-[#8c8c8c]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Transaction Attacher */}
          <div className="bg-[#262626] p-3.5 rounded border border-[#333333] shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6] border-b border-[#333333] pb-1.5">
              Attach Transaction
            </h3>
            <form onSubmit={handleAddTransaction} className="space-y-2.5">
              <div>
                <label className="block text-xs text-[#8c8c8c] mb-1">Transaction ID</label>
                <input
                  type="text"
                  placeholder="e.g. 230425980"
                  value={txInput}
                  onChange={(e) => setTxInput(e.target.value)}
                  className="w-full text-xs p-1.5 bg-[#1a1a1a] border border-[#3e3e3e] rounded text-[#eff1f6] focus:outline-none focus:border-[#ffa116]"
                />
              </div>
              <button
                type="submit"
                disabled={addingTx || !txInput.trim()}
                className="w-full py-1.5 bg-[#ffa116] hover:bg-[#ffb84d] text-[#1a1a1a] rounded text-xs font-bold disabled:opacity-40 transition-colors"
              >
                {addingTx ? 'Adding...' : 'Attach to Case'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. TRANSACTIONS TAB */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="bg-[#262626] rounded border border-[#333333] shadow-sm overflow-hidden font-mono">
          <div className="overflow-x-auto">
            <table className="leetcode-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Step</th>
                  <th>Ground Truth</th>
                  <th>Model Prediction</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Notes</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {txs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-[#8c8c8c] text-xs">
                      No transactions attached to this case yet.
                    </td>
                  </tr>
                ) : (
                  txs.map((t) => (
                    <tr
                      key={t.transaction_id}
                      onClick={() => navigate(`/transactions/${t.transaction_id}`)}
                      className="cursor-pointer hover:bg-[#2e2e2e]"
                    >
                      <td className="font-bold text-[#eff1f6] hover:text-[#ffa116]">TX #{t.transaction_id}</td>
                      <td className="text-[#8c8c8c]">Step {t.time_step}</td>
                      <td><LabelBadge label={t.known_label} /></td>
                      <td>{t.prediction ? <LabelBadge label={t.prediction} isPrediction /> : <span className="text-[#6b7280]">—</span>}</td>
                      <td className="font-bold text-[#eff1f6]">{t.risk_score}</td>
                      <td><RiskBadge score={t.risk_score} level={t.risk_level} showScore={false} /></td>
                      <td className="text-[#d1d5db] text-xs max-w-xs truncate">{t.notes || '—'}</td>
                      <td className="text-right">
                        <span className="text-xs text-[#ffa116] hover:underline">Inspect Dossier →</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. NOTES TAB */}
      {activeTab === 'NOTES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
          <div className="md:col-span-2 space-y-3">
            <div className="bg-[#262626] p-3.5 rounded border border-[#333333] shadow-sm space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6] border-b border-[#333333] pb-1.5">
                Chain-of-Custody Forensic Log ({notes.length})
              </h3>
              <div className="space-y-2">
                {notes.length === 0 ? (
                  <div className="text-center py-6 text-[#8c8c8c] text-xs">
                    No notes recorded in this case log.
                  </div>
                ) : (
                  notes.map((n) => (
                    <div key={n.id} className="p-2.5 bg-[#1f1f1f] rounded border border-[#333333] space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[#8c8c8c] text-[10px]">
                        <span className="font-bold text-[#ffa116]">{n.author}</span>
                        <span>{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-[#eff1f6] font-sans leading-relaxed">{n.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Add Note Form */}
          <div className="bg-[#262626] p-3.5 rounded border border-[#333333] shadow-sm space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#eff1f6] border-b border-[#333333] pb-1.5">
              Log Forensic Entry
            </h3>
            <form onSubmit={handleAddNote} className="space-y-2">
              <div>
                <label className="block text-[10px] text-[#8c8c8c] uppercase mb-1">Author Title</label>
                <input
                  type="text"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  className="w-full text-xs p-1.5 bg-[#1a1a1a] border border-[#3e3e3e] rounded text-[#eff1f6] focus:outline-none focus:border-[#ffa116]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#8c8c8c] uppercase mb-1">Forensic Note *</label>
                <textarea
                  rows={4}
                  placeholder="Record observations, witness correlation, or off-chain intelligence..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full text-xs p-1.5 bg-[#1a1a1a] border border-[#3e3e3e] rounded text-[#eff1f6] focus:outline-none focus:border-[#ffa116]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={addingNote || !newNote.trim()}
                className="w-full py-1.5 bg-[#ffa116] hover:bg-[#ffb84d] text-[#1a1a1a] rounded text-xs font-bold disabled:opacity-40 transition-colors"
              >
                {addingNote ? 'Logging...' : 'Log Note'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. CASE DOSSIER REPORT */}
      {activeTab === 'REPORT' && (
        <div className="bg-[#262626] p-5 rounded border border-[#333333] shadow-sm space-y-4 print:border-none print:shadow-none font-mono">
          <div className="flex items-center justify-between border-b-2 border-[#ffa116] pb-2">
            <div>
              <div className="font-bold text-[10px] tracking-widest text-[#ffa116] uppercase">
                CHAIN-GUARD FORENSIC INTELLIGENCE DOSSIER
              </div>
              <h2 className="text-base font-bold text-[#eff1f6] mt-0.5">
                TRACE-X Forensic Investigation Report
              </h2>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1 bg-[#1a1a1a] border border-[#3e3e3e] hover:bg-[#333333] text-[#eff1f6] rounded text-xs font-bold flex items-center space-x-1.5 print:hidden transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
          </div>

          {reportData ? (
            <div className="space-y-3 text-xs text-[#eff1f6]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-[#1f1f1f] rounded border border-[#333333]">
                <div><span className="text-[#8c8c8c] block text-[10px]">CASE ID</span>#{reportData.case_id}</div>
                <div><span className="text-[#8c8c8c] block text-[10px]">STATUS</span>{reportData.status}</div>
                <div><span className="text-[#8c8c8c] block text-[10px]">ENTITIES</span>{reportData.risk_assessment_summary.total_investigated}</div>
                <div><span className="text-[#8c8c8c] block text-[10px]">AVG RISK</span>{reportData.risk_assessment_summary.average_risk_score} / 100</div>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-[#ffa116] text-[10px] mb-1">Executive Summary</h4>
                <p className="bg-[#1f1f1f] p-2.5 rounded border border-[#333333] text-[#d1d5db] leading-relaxed font-sans">
                  {reportData.executive_summary}
                </p>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-[#ffa116] text-[10px] mb-1">Network Topology Findings</h4>
                <p className="bg-[#1f1f1f] p-2.5 rounded border border-[#333333] text-[#d1d5db] leading-relaxed font-sans">
                  {reportData.network_findings.topology_summary}
                </p>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-[#ffa116] text-[10px] mb-1">Investigated Entities Registry</h4>
                <div className="overflow-x-auto border border-[#333333] rounded">
                  <table className="leetcode-table">
                    <thead>
                      <tr>
                        <th>TX ID</th>
                        <th>Step</th>
                        <th>Ground Truth</th>
                        <th>Prediction</th>
                        <th>Risk Score</th>
                        <th>Risk Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.investigated_transactions.map((t: any) => (
                        <tr key={t.transaction_id}>
                          <td className="font-bold text-[#eff1f6]">TX #{t.transaction_id}</td>
                          <td className="text-[#8c8c8c]">Step {t.time_step}</td>
                          <td><LabelBadge label={t.known_label} /></td>
                          <td>{t.prediction ? <LabelBadge label={t.prediction} isPrediction /> : '—'}</td>
                          <td className="font-bold text-[#eff1f6]">{t.risk_score}</td>
                          <td><RiskBadge score={t.risk_score} level={t.risk_level} showScore={false} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-2.5 bg-[#1f1f1f] border border-[#333333] rounded text-[10px] text-[#8c8c8c]">
                <strong className="text-[#ffa116]">Methodology & Limitations: </strong>
                {reportData.methodology_and_limitations}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[#8c8c8c]">Loading dossier data...</div>
          )}
        </div>
      )}
    </div>
  );
};
