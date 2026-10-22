import React, { useState } from 'react';
import { useAssessmentData } from '../hooks/useAssessmentData';
import { Header } from '../components/Header';
import { SummaryCards } from '../components/SummaryCards';
import { CaseList } from '../components/CaseList';
import { ComparisonTable } from '../components/ComparisonTable';
import { NewCaseModal } from '../components/NewCaseModal';
import { LineSimulator } from '../components/LineSimulator';
import { CaseStatus } from '../types';

export default function DashboardPage() {
  const {
    cases,
    vendors,
    activeCaseId,
    activeCase,
    setActiveCaseId,
    resetToInitialData,
    addCase,
    sendLineBatchRequest,
    submitVendorQuote,
    declineVendorQuote,
    selectWinningVendor,
    completeCase,
  } = useAssessmentData();

  const [currentView, setCurrentView] = useState<'dashboard' | 'vendor-preview'>('dashboard');
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [simulatorVendorId, setSimulatorVendorId] = useState<string | undefined>(undefined);
  const [simulatorCaseId, setSimulatorCaseId] = useState<string | undefined>(undefined);

  const handleOpenVendorSimulator = (vendorId: string, caseId: string) => {
    setSimulatorVendorId(vendorId);
    setSimulatorCaseId(caseId);
    setCurrentView('vendor-preview');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Global Header */}
      <Header
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        onResetData={resetToInitialData}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'dashboard' ? (
          <div>
            {/* Status Summary KPI Cards */}
            <SummaryCards
              cases={cases}
              selectedStatusFilter={selectedStatusFilter}
              onSelectStatusFilter={setSelectedStatusFilter}
            />

            {/* Main 2-Column Split: Case List (Left) + Multi-Quote Comparison Table (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Case List (4 of 12 cols on desktop) */}
              <div className="lg:col-span-5 xl:col-span-4">
                <CaseList
                  cases={cases}
                  activeCaseId={activeCaseId}
                  onSelectCase={(id) => setActiveCaseId(id)}
                  onOpenNewCaseModal={() => setIsNewCaseModalOpen(true)}
                  selectedStatusFilter={selectedStatusFilter}
                  onSelectStatusFilter={setSelectedStatusFilter}
                />
              </div>

              {/* Right Column: Multi-Quote Comparison (7 or 8 of 12 cols on desktop) */}
              <div className="lg:col-span-7 xl:col-span-8">
                <ComparisonTable
                  assessmentCase={activeCase}
                  vendors={vendors}
                  onSendBatchRequest={sendLineBatchRequest}
                  onSelectWinningVendor={selectWinningVendor}
                  onOpenVendorSimulator={handleOpenVendorSimulator}
                  onCompleteCase={completeCase}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Vendor Preview in-app mode */
          <div className="py-2">
            <LineSimulator
              cases={cases}
              vendors={vendors}
              initialVendorId={simulatorVendorId}
              initialCaseId={simulatorCaseId || activeCaseId || undefined}
              onSubmitQuote={submitVendorQuote}
              onDeclineQuote={declineVendorQuote}
            />
          </div>
        )}
      </main>

      {/* New Case Registration Modal */}
      <NewCaseModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
        onAddCase={addCase}
      />
    </div>
  );
}
