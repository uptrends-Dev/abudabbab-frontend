"use client";

import { Provider } from 'react-redux';
import { persistor, store } from '@/app/store/store';
import { PersistGate } from 'redux-persist/integration/react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
export function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

// Sync <html> lang and dir with Redux language
export function LanguageHtml() {
  const lang = useSelector((s) => s.lang.code);
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      html.setAttribute('lang', lang);
    }
  }, [lang]);
  return null;
}