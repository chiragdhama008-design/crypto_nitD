import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Check, X } from 'lucide-react';
import { api } from '../../services/api';
import { InvestigationCase } from '../../types/api';

interface AddToCaseModalProps {
  transactionId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddToCaseModal: React.FC<AddToCaseModalProps> = ({
  transactionId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCaseName, setNewCaseName] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
      api.getCases()
        .then((data) => {
          setCases(data);
          if (data.length > 0) setSelectedCaseId(data[0].id);
        })
        .catch((err) => setError(err.message));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isCreatingNew) {
        if (!newCaseName.trim()) {
          throw new Error('Please provide a case name.');
        }
        const created = await api.createCase({
          case_name: newCaseName.trim(),
          description: newCaseDesc.trim(),
          initial_transactions: [transactionId],
        });
        if (note.trim()) {
          await api.addNoteToCase(created.id, note.trim(), transactionId);
        }
      } else {
        if (!selectedCaseId) {
          throw new Error('Please select an investigation case.');
        }
        await api.addTransactionsToCase(selectedCaseId, [transactionId], note.trim());
      }
      setSuccessMsg('Transaction successfully added to investigation case.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-md border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Add Transaction to Case</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">Transaction to Attach:</span>
            <span className="font-mono text-xs font-semibold text-slate-900">TX #{transactionId}</span>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700 flex items-center space-x-1.5">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex items-center space-x-4 text-xs font-medium border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className={`pb-1 ${!isCreatingNew ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-slate-500'}`}
            >
              Existing Case ({cases.length})
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className={`pb-1 ${isCreatingNew ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-slate-500'}`}
            >
              + Create New Case
            </button>
          </div>

          {!isCreatingNew ? (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Case</label>
              {cases.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">
                  No cases found. Click "Create New Case" above.
                </div>
              ) : (
                <select
                  value={selectedCaseId || ''}
                  onChange={(e) => setSelectedCaseId(Number(e.target.value))}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      Case #{c.id}: {c.case_name} ({c.status})
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Case Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Operation Silk Peel Investigation"
                  value={newCaseName}
                  onChange={(e) => setNewCaseName(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief synopsis of investigation scope..."
                  value={newCaseDesc}
                  onChange={(e) => setNewCaseDesc(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Investigator Note (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Record forensic observation, reason for tagging, or chain of custody note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!isCreatingNew && !selectedCaseId)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm disabled:opacity-50 flex items-center space-x-1.5"
            >
              {loading ? 'Attaching...' : 'Attach to Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
