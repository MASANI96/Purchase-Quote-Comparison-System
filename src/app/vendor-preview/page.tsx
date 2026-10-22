import React from 'react';
import { useAssessmentData } from '../../hooks/useAssessmentData';
import { Header } from '../../components/Header';
import { LineSimulator } from '../../components/LineSimulator';

export default function VendorPreviewPage({
  onSwitchToDashboard,
}: {
  onSwitchToDashboard?: () => void;
}) {
  const {
    cases,
    vendors,
    activeCaseId,
    resetToInitialData,
    submitVendorQuote,
    declineVendorQuote,
  } = useAssessmentData();

  const handleViewChange = (view: 'dashboard' | 'vendor-preview') => {
    if (view === 'dashboard') {
      if (onSwitchToDashboard) {
        onSwitchToDashboard();
      } else {
        const url = new URL(window.location.href);
        url.pathname = '/';
        url.searchParams.delete('view');
        window.location.href = url.toString();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      <Header
        currentView="vendor-preview"
        onViewChange={handleViewChange}
        onResetData={resetToInitialData}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center justify-center">
        <LineSimulator
          cases={cases}
          vendors={vendors}
          initialCaseId={activeCaseId || undefined}
          onSubmitQuote={submitVendorQuote}
          onDeclineQuote={declineVendorQuote}
        />
      </main>
    </div>
  );
}
