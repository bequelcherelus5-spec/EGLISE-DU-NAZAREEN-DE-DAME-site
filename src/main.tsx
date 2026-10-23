import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept cross-origin third-party script errors (e.g. PayPal SDK in sandboxes/adblockers)
// to prevent "Script error." from bubbling up to window.onerror
window.addEventListener(
  'error',
  (event) => {
    const isCrossOriginScriptError =
      event.message === 'Script error.' ||
      !event.filename ||
      event.filename.includes('paypal.com') ||
      event.filename.includes('google');

    if (isCrossOriginScriptError) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('[Handled Third-Party Script Event]:', event.message);
      return true;
    }
  },
  true
);

window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event.reason?.message || event.reason || '');
  if (
    reasonStr.includes('paypal') ||
    reasonStr.includes('Script error') ||
    reasonStr.includes('cross-origin')
  ) {
    event.preventDefault();
    console.warn('[Handled Third-Party Unhandled Rejection]:', reasonStr);
  }
});

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[RootErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4">
            <h2 className="text-xl font-bold text-amber-400 font-serif">
              Église du Nazaréen de Damé
            </h2>
            <p className="text-xs text-slate-300">
              Une mise à jour est en cours d'application. Veuillez rafraîchir la page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
