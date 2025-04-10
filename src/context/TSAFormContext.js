import { createContext, useContext, useState, useMemo, useEffect } from 'react';

const TSAFormContext = createContext();

export const useTSAForm = () => useContext(TSAFormContext);

export function TSAFormProvider({ children }) {
  const [submittedPages, setSubmittedPages] = useState(() => {
    const saved = localStorage.getItem('submittedPages');
    return saved ? JSON.parse(saved) : {};
  });

  const [formLocked, setFormLocked] = useState(() => {
    return localStorage.getItem('formLocked') === 'true';
  });

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('formData');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('submittedPages', JSON.stringify(submittedPages));
  }, [submittedPages]);

  useEffect(() => {
    localStorage.setItem('formLocked', formLocked);
  }, [formLocked]);

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  const contextValue = useMemo(
    () => ({
      submittedPages,
      setSubmittedPages,
      formLocked,
      setFormLocked,
      formData,
      setFormData,
    }),
    [submittedPages, formLocked, formData],
  );

  return <TSAFormContext.Provider value={contextValue}>{children}</TSAFormContext.Provider>;
}
