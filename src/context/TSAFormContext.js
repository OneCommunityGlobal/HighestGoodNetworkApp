import { createContext, useContext, useState, useMemo, useEffect } from 'react';

// Create the context
const TSAFormContext = createContext();

// Custom hook to use context
export const useTSAForm = () => useContext(TSAFormContext);

// Provider component
export function TSAFormProvider({ children }) {
  const [submittedPages, setSubmittedPages] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('submittedPages');
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever submittedPages changes
  useEffect(() => {
    localStorage.setItem('submittedPages', JSON.stringify(submittedPages));
  }, [submittedPages]);

  const contextValue = useMemo(() => ({ submittedPages, setSubmittedPages }), [submittedPages]);

  return <TSAFormContext.Provider value={contextValue}>{children}</TSAFormContext.Provider>;
}
