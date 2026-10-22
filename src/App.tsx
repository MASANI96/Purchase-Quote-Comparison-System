/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import DashboardPage from './app/page';
import VendorPreviewPage from './app/vendor-preview/page';

export default function App() {
  const [route, setRoute] = useState<'dashboard' | 'vendor-preview'>(() => {
    if (typeof window === 'undefined') return 'dashboard';
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    if (path.includes('vendor-preview') || params.get('view') === 'vendor-preview') {
      return 'vendor-preview';
    }
    return 'dashboard';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      if (path.includes('vendor-preview') || params.get('view') === 'vendor-preview') {
        setRoute('vendor-preview');
      } else {
        setRoute('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToDashboard = () => {
    setRoute('dashboard');
    const url = new URL(window.location.href);
    url.pathname = '/';
    url.searchParams.delete('view');
    window.history.pushState({}, '', url.toString());
  };

  if (route === 'vendor-preview') {
    return <VendorPreviewPage onSwitchToDashboard={navigateToDashboard} />;
  }

  return <DashboardPage />;
}
