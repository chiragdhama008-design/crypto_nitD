import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Database, Cpu, ArrowRight, Shield, Terminal } from 'lucide-react';
import { api } from '../../services/api';
import { SystemHealth } from '../../types/api';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch((err) => console.warn('Health fetch error:', err));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.searchTransactions(searchQuery.trim());
        setSearchResults(results);
        setShowDropdown(true);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to dismiss search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTransaction = (txId: number) => {
    setShowDropdown(false);
    setSearchQuery('');
    navigate(`/transactions/${txId}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-11 bg-[#222222] border-b border-[#333333] px-4 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
      {/* Global Transaction Search - LeetCode Style */}
      <div className="relative w-80 lg:w-96" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-[#8a8a8a] pointer-events-none" />
          <input
            type="text"
            placeholder="Search transaction (e.g. 230425980)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            className="w-full pl-8 pr-8 py-1 text-xs bg-[#1a1a1a] border border-[#3e3e3e] rounded text-[#eff1f6] placeholder-[#6b7280] focus:outline-none focus:border-[#ffa116] font-mono transition-colors"
          />
          <span className="absolute right-2 text-[10px] font-mono bg-[#2a2a2a] text-[#8c8c8c] px-1 py-0.5 rounded border border-[#3e3e3e] pointer-events-none">
            /
          </span>
          {isSearching && (
            <div className="absolute right-7 top-2">
              <div className="w-2.5 h-2.5 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </form>

        {/* Auto-suggest dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#262626] border border-[#3e3e3e] rounded shadow-2xl max-h-72 overflow-y-auto z-50">
            <div className="px-2.5 py-1 text-[10px] font-mono font-semibold text-[#8c8c8c] uppercase tracking-wider bg-[#1f1f1f] border-b border-[#333333]">
              Matching Transactions ({searchResults.length})
            </div>
            {searchResults.map((tx) => (
              <div
                key={tx.transaction_id}
                onClick={() => handleSelectTransaction(tx.transaction_id)}
                className="px-3 py-2 border-b border-[#2d2d2d] hover:bg-[#303030] cursor-pointer flex items-center justify-between group transition-colors"
              >
                <div>
                  <div className="text-xs font-mono font-medium text-[#eff1f6] group-hover:text-[#ffa116] flex items-center space-x-1.5">
                    <span>TX #{tx.transaction_id}</span>
                    <span className="text-[10px] text-[#8c8c8c] font-sans">Step {tx.time_step}</span>
                  </div>
                  <div className="text-[10px] text-[#9ca3af] flex items-center space-x-2 mt-0.5 font-mono">
                    <span>Label: {tx.known_label}</span>
                    {tx.prediction && <span>| Model: {tx.prediction}</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                    tx.risk_level === 'CRITICAL' ? 'bg-[#ef4743]/20 text-[#ef4743] border border-[#ef4743]/40' :
                    tx.risk_level === 'HIGH' ? 'bg-[#ffa116]/20 text-[#ffa116] border border-[#ffa116]/40' :
                    tx.risk_level === 'MEDIUM' ? 'bg-[#ffc01e]/20 text-[#ffc01e] border border-[#ffc01e]/40' :
                    'bg-[#00b8a3]/20 text-[#00b8a3] border border-[#00b8a3]/40'
                  }`}>
                    Risk {tx.risk_score}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#6b7280] group-hover:text-[#ffa116] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Side: System Status Indicators */}
      <div className="flex items-center space-x-2 text-xs">
        {/* Database Status */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#1a1a1a] border border-[#333333] font-mono">
          <Database className="w-3 h-3 text-[#8c8c8c]" />
          <span className="text-[10px] text-[#d1d5db]">
            {health?.database.provider === 'Local Developer Storage' ? 'SQLite (Local)' : health?.database.provider || 'PostgreSQL'}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${health?.database.connected ? 'bg-[#00b8a3]' : 'bg-[#ffc01e]'}`}></span>
        </div>

        {/* Active ML Model */}
        <div className="hidden md:flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#1a1a1a] border border-[#333333] font-mono">
          <Cpu className="w-3 h-3 text-[#8c8c8c]" />
          <span className="text-[10px] text-[#d1d5db] capitalize">
            {health?.active_model ? health.active_model.replace('_', ' ') : 'Gradient Boosting'}
          </span>
          <span className="text-[9px] text-[#ffa116] font-semibold uppercase bg-[#ffa116]/10 px-1 rounded">Active</span>
        </div>

        {/* LeetCode Forensic Console Badge */}
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#2cbb5d]/15 text-[#2cbb5d] border border-[#2cbb5d]/30 font-mono text-[10px] font-semibold">
          <Terminal className="w-3 h-3" />
          <span>CONSOLE v1.0</span>
        </div>
      </div>
    </header>
  );
};
