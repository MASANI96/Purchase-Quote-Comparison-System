import { useState, useEffect, useCallback } from 'react';
import { AssessmentCase, Vendor, Quote } from '../types';
import { INITIAL_CASES, INITIAL_VENDORS } from '../data/mockData';

const STORAGE_KEY_CASES = 'kaitori_assessment_cases_v2';
const STORAGE_KEY_VENDORS = 'kaitori_assessment_vendors_v2';
const EVENT_CUSTOM_UPDATE = 'kaitori_data_updated';

function getStoredData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error('Error reading localStorage key:', key, e);
    return defaultValue;
  }
}

function setStoredData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for same-tab instant reactivity
    window.dispatchEvent(new CustomEvent(EVENT_CUSTOM_UPDATE, { detail: { key } }));
  } catch (e) {
    console.error('Error saving to localStorage key:', key, e);
  }
}

export function useAssessmentData() {
  const [cases, setCases] = useState<AssessmentCase[]>(() => {
    const stored = getStoredData<AssessmentCase[] | null>(STORAGE_KEY_CASES, null);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      setStoredData(STORAGE_KEY_CASES, INITIAL_CASES);
      return INITIAL_CASES;
    }
    return stored;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const stored = getStoredData<Vendor[] | null>(STORAGE_KEY_VENDORS, null);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      setStoredData(STORAGE_KEY_VENDORS, INITIAL_VENDORS);
      return INITIAL_VENDORS;
    }
    return stored;
  });

  const [activeCaseId, setActiveCaseId] = useState<string | null>(() => {
    return cases.length > 0 ? cases[0].id : null;
  });

  // Reload data from localStorage
  const reloadData = useCallback(() => {
    const loadedCases = getStoredData<AssessmentCase[]>(STORAGE_KEY_CASES, INITIAL_CASES);
    const loadedVendors = getStoredData<Vendor[]>(STORAGE_KEY_VENDORS, INITIAL_VENDORS);
    setCases(loadedCases);
    setVendors(loadedVendors);
  }, []);

  // Sync across tabs and within same window
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_CASES || e.key === STORAGE_KEY_VENDORS || !e.key) {
        reloadData();
      }
    };

    const handleCustomChange = () => {
      reloadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(EVENT_CUSTOM_UPDATE, handleCustomChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(EVENT_CUSTOM_UPDATE, handleCustomChange);
    };
  }, [reloadData]);

  // Keep activeCaseId valid if cases change
  useEffect(() => {
    if (cases.length > 0) {
      if (!activeCaseId || !cases.some((c) => c.id === activeCaseId)) {
        setActiveCaseId(cases[0].id);
      }
    }
  }, [cases, activeCaseId]);

  // Reset to initial mock data
  const resetToInitialData = useCallback(() => {
    setStoredData(STORAGE_KEY_CASES, INITIAL_CASES);
    setStoredData(STORAGE_KEY_VENDORS, INITIAL_VENDORS);
    setCases(INITIAL_CASES);
    setVendors(INITIAL_VENDORS);
    setActiveCaseId(INITIAL_CASES[0]?.id || null);
  }, []);

  // Add new case
  const addCase = useCallback(
    (
      newCaseData: Omit<AssessmentCase, 'id' | 'caseNumber' | 'createdAt' | 'quotes' | 'status'> &
        Partial<AssessmentCase>
    ) => {
      const nextNum = cases.length + 1;
      const caseNumber = `CASE-2026-${String(nextNum).padStart(3, '0')}`;
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Initialize quotes for all vendors as not_sent
      const initialQuotes: Quote[] = vendors.map((v) => ({
        vendorId: v.id,
        status: 'not_sent',
      }));

      const newCase: AssessmentCase = {
        id: `case-${Date.now()}`,
        caseNumber,
        createdAt: formattedDate,
        status: 'draft',
        quotes: initialQuotes,
        ...newCaseData,
      };

      const updated = [newCase, ...cases];
      setCases(updated);
      setStoredData(STORAGE_KEY_CASES, updated);
      setActiveCaseId(newCase.id);
      return newCase;
    },
    [cases, vendors]
  );

  // Update existing case
  const updateCase = useCallback(
    (updatedCase: AssessmentCase) => {
      const updated = cases.map((c) => (c.id === updatedCase.id ? updatedCase : c));
      setCases(updated);
      setStoredData(STORAGE_KEY_CASES, updated);
    },
    [cases]
  );

  // Delete case
  const deleteCase = useCallback(
    (caseId: string) => {
      const updated = cases.filter((c) => c.id !== caseId);
      setCases(updated);
      setStoredData(STORAGE_KEY_CASES, updated);
      if (activeCaseId === caseId) {
        setActiveCaseId(updated[0]?.id || null);
      }
    },
    [cases, activeCaseId]
  );

  // Send LINE batch assessment request
  const sendLineBatchRequest = useCallback(
    (caseId: string, targetVendorIds?: string[]) => {
      const targetCase = cases.find((c) => c.id === caseId);
      if (!targetCase) return;

      const updatedQuotes: Quote[] = targetCase.quotes.map((q) => {
        // If specific vendors specified, only update those. Otherwise update all not_sent or pending
        const shouldUpdate =
          !targetVendorIds || targetVendorIds.includes(q.vendorId);
        if (shouldUpdate && (q.status === 'not_sent' || q.status === 'pending')) {
          return {
            ...q,
            status: 'pending',
          };
        }
        return q;
      });

      const updatedCase: AssessmentCase = {
        ...targetCase,
        status: 'requesting',
        quotes: updatedQuotes,
      };

      const updated = cases.map((c) => (c.id === caseId ? updatedCase : c));
      setCases(updated);
      setStoredData(STORAGE_KEY_CASES, updated);
    },
    [cases]
  );

  // Vendor answers quote
  const submitVendorQuote = useCallback(
    (
      caseId: string,
      vendorId: string,
      quoteData: {
        price: number;
        shippingPaidBy: 'vendor' | 'client';
        validUntil: string;
        conditions: string;
      }
    ) => {
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const targetCase = cases.find((c) => c.id === caseId);
      if (!targetCase) return;

      const updatedQuotes: Quote[] = targetCase.quotes.map((q) => {
        if (q.vendorId === vendorId) {
          return {
            ...q,
            status: 'quoted' as const,
            price: quoteData.price,
            shippingPaidBy: quoteData.shippingPaidBy,
            validUntil: quoteData.validUntil,
            conditions: quoteData.conditions,
            updatedAt: formattedDate,
          };
        }
        return q;
      });

      // Status updates to 'assessed' if not already ordered or completed
      let nextStatus = targetCase.status;
      if (nextStatus === 'requesting' || nextStatus === 'draft') {
        nextStatus = 'assessed';
      }

      const updatedCase: AssessmentCase = {
        ...targetCase,
        status: nextStatus,
        quotes: updatedQuotes,
      };

      const updated = cases.map((c) => (c.id === caseId ? updatedCase : c));
      setCases(updated);
      setStoredData(STORAGE_KEY_CASES, updated);
    },
    [cases]
  );

  // Vendor declines
  const declineVendorQuote = useCallback(
    (caseId: string, vendorId: string, conditions?: string) => {
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const targetCase = cases.find((c) => c.id === caseId);
      if (!targetCase) return;

      const updatedQuotes: Quote[] = targetCase.quotes.map((q) => {
        if (q.vendorId === vendorId) {
          return {
            ...q,
            status: 'declined' as const,
            conditions: conditions || '取扱対象外または在庫過多のため辞退',
            updatedAt: formattedDate,
          };
        }
        return q;
      });

      const updatedCase: AssessmentCase = {
        ...targetCase,
        quotes: updatedQuotes,
      };

      const updated = cases.map((c) => (c.id === caseId ? updatedCase : c));
      setCases(updated);
      setStoredData(STORAGE_KEY_CASES, updated);
    },
    [cases]
  );

  // Select winning vendor
  const selectWinningVendor = useCallback(
    (caseId: string, vendorId: string) => {
      const targetCase = cases.find((c) => c.id === caseId);
      if (!targetCase) return;

      const updatedCase: AssessmentCase = {
        ...targetCase,
        status: 'ordered',
        selectedVendorId: vendorId,
      };

      const updated = cases.map((c) => (c.id === caseId ? updatedCase : c));
      setCases(updated);
      setStoredData(STORAGE_KEY_CASES, updated);
    },
    [cases]
  );

  // Complete case
  const completeCase = useCallback(
    (caseId: string) => {
      const targetCase = cases.find((c) => c.id === caseId);
      if (!targetCase) return;

      const updatedCase: AssessmentCase = {
        ...targetCase,
        status: 'completed',
      };

      const updated = cases.map((c) => (c.id === caseId ? updatedCase : c));
      setCases(updated);
      setStoredData(STORAGE_KEY_CASES, updated);
    },
    [cases]
  );

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0] || null;

  return {
    cases,
    vendors,
    activeCaseId,
    activeCase,
    setActiveCaseId,
    resetToInitialData,
    addCase,
    updateCase,
    deleteCase,
    sendLineBatchRequest,
    submitVendorQuote,
    declineVendorQuote,
    selectWinningVendor,
    completeCase,
    reload: reloadData,
  };
}
