import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';

// Pages
import { Overview } from './pages/Overview';
import { Investigations } from './pages/Investigations';
import { CaseDetail } from './pages/CaseDetail';
import { Transactions } from './pages/Transactions';
import { TransactionInvestigation } from './pages/TransactionInvestigation';
import { GraphExplorer } from './pages/GraphExplorer';
import { RiskAlerts } from './pages/RiskAlerts';
import { ModelPerformance } from './pages/ModelPerformance';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Dataset } from './pages/Dataset';
import { Methodology } from './pages/Methodology';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="flex h-screen w-screen overflow-hidden bg-[#1a1a1a] text-[#eff1f6] font-sans">
        {/* Left LeetCode Sidebar */}
        <Sidebar />

        {/* Right Main Body */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Bar */}
          <TopBar />

          {/* Scrollable Page Content */}
          <main className="flex-1 overflow-y-auto bg-[#1a1a1a] text-[#eff1f6]">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/investigations" element={<Investigations />} />
              <Route path="/cases/:caseId" element={<CaseDetail />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/transactions/:transactionId" element={<TransactionInvestigation />} />
              <Route path="/graph" element={<GraphExplorer />} />
              <Route path="/risk" element={<RiskAlerts />} />
              <Route path="/models" element={<ModelPerformance />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/dataset" element={<Dataset />} />
              <Route path="/methodology" element={<Methodology />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
