import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  FolderOpen,
  Calendar,
  Clock,
  ArrowRight,
  Shield,
  FileText,
  AlertCircle,
  Terminal
} from 'lucide-react';
import { api } from '../services/api';
import { InvestigationCase } from '../types/api';

export const Investigations: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Case Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [caseName, setCaseName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchCases = () => {
    setLoading(true);
    api.getCases()
      .then((res) => {
        setCases(res);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseName.trim()) return;
    setCreating(true);
    try {
      const created = await api.createCase({
        case_name: caseName.trim(),
        description: description.trim(),
      });
      setIsModalOpen(false);
      setCaseName('');
      setDescription('');
      navigate(`/cases/${created.id}`);
    } catch (err: any) {
      alert(`Failed to create case: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto font-sans text-[#eff1f6]">
      {/* Header - LeetCode Style */}
      <div className="flex items-center justify-between border-b border-[#333333] pb-3 font-mono">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-[#eff1f6] tracking-tight">Investigation Dossiers</h1>
            <span className="text-[10px] bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30 px-2 py-0.5 rounded font-bold">
              {cases.length} ACTIVE CASES
            </span>
          </div>
          <p className="text-xs text-[#8c8c8c] mt-0.5">
            Forensic dossiers, evidence collation, and multi-transaction chain of custody tracking
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 bg-[#ffa116] hover:bg-[#ffb84d] text-[#1a1a1a] rounded text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Case</span>
        </button>
      </div>

      {/* Case List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 font-mono">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-[#262626] border border-[#333333] animate-pulse rounded"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-[#262626] border border-[#ef4743]/50 rounded text-xs text-[#ef4743] font-mono">
          Error loading cases: {error}
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-[#262626] border border-[#333333] rounded p-8 text-center space-y-3 font-mono">
          <Briefcase className="w-8 h-8 text-[#8c8c8c] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[#eff1f6]">No active investigation cases</h3>
          <p className="text-xs text-[#8c8c8c] max-w-sm mx-auto font-sans">
            Start a new case to organize tagged suspicious transactions, compile evidence, and export forensic dossiers.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-[#ffa116] hover:bg-[#ffb84d] text-[#1a1a1a] text-xs font-bold rounded"
          >
            Create First Case
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 font-sans">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/cases/${c.id}`)}
              className="bg-[#262626] border border-[#333333] hover:border-[#ffa116] rounded p-3.5 space-y-2.5 cursor-pointer transition-all group shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#ffa116]">CASE #{c.id}</span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      c.status === 'OPEN'
                        ? 'bg-[#00b8a3]/20 text-[#00b8a3] border border-[#00b8a3]/40'
                        : c.status === 'UNDER REVIEW'
                        ? 'bg-[#ffa116]/20 text-[#ffa116] border border-[#ffa116]/40'
                        : 'bg-[#333333] text-[#8c8c8c] border border-[#444444]'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#eff1f6] group-hover:text-[#ffa116] transition-colors font-mono">
                  {c.case_name}
                </h3>
                <p className="text-[11px] text-[#8c8c8c] line-clamp-2">
                  {c.description || 'No case description entered.'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#333333] flex items-center justify-between text-[10px] text-[#8c8c8c] font-mono">
                <span className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-[#ffa116]" />
                  <span>{c.transaction_count} transactions tagged</span>
                </span>
                <span className="text-[#ffa116] group-hover:translate-x-0.5 transition-transform flex items-center space-x-0.5">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Case Modal - LeetCode Dark Style */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-mono">
          <div className="bg-[#262626] border border-[#3e3e3e] rounded max-w-md w-full p-4 space-y-3 shadow-2xl">
            <div className="border-b border-[#333333] pb-2">
              <h2 className="text-xs font-bold text-[#eff1f6] uppercase tracking-wider">Initialize Investigation Case</h2>
              <p className="text-[10px] text-[#8c8c8c]">Create a new forensic dossier workspace</p>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-[#d1d5db] uppercase mb-1">
                  Case Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operation SilkFlow Cluster 104"
                  value={caseName}
                  onChange={(e) => setCaseName(e.target.value)}
                  className="w-full text-xs p-1.5 bg-[#1a1a1a] border border-[#3e3e3e] rounded text-[#eff1f6] focus:outline-none focus:border-[#ffa116]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#d1d5db] uppercase mb-1">
                  Case Synopsis
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the investigative thesis, cluster traits, and targets..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-1.5 bg-[#1a1a1a] border border-[#3e3e3e] rounded text-[#eff1f6] focus:outline-none focus:border-[#ffa116]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#333333]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1 bg-[#1a1a1a] border border-[#3e3e3e] rounded text-xs text-[#8c8c8c] hover:text-[#eff1f6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !caseName.trim()}
                  className="px-3 py-1 bg-[#ffa116] hover:bg-[#ffb84d] text-[#1a1a1a] text-xs font-bold rounded disabled:opacity-40"
                >
                  {creating ? 'Initializing...' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
