import { useEffect } from 'react';

const logErrorAPI = (errorMsg: string) => {
  fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: errorMsg }),
  }).catch(console.error); // Avoid infinite loops if the logging API itself fails
};

export function useGlobalErrorHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleError = (event: ErrorEvent) => {
      const errorMsg = `[${new Date().toISOString()}] JS Error: ${event.message}
Source: ${event.filename}
Line: ${event.lineno}, Col: ${event.colno}
Stack: ${event.error?.stack || 'N/A'}
---
`;
      logErrorAPI(errorMsg);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const errorMsg = `[${new Date().toISOString()}] Unhandled Promise Rejection: ${event.reason?.message || event.reason}
Stack: ${event.reason?.stack || 'N/A'}
---
`;
      logErrorAPI(errorMsg);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);
}