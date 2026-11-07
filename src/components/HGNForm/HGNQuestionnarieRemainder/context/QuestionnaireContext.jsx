import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getQuestionnaireStatus } from '../services/questionnaireService';

const QuestionnaireContext = createContext(null);

export const QuestionnaireProvider = ({ children }) => {
  const [completed, setCompleted] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refreshQuestionnaireStatus = async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await getQuestionnaireStatus();
      setCompleted(data.completed);
    } catch {
      setCompleted(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshQuestionnaireStatus();
  }, []);

  const contextValue = useMemo(
    () => ({
      completed,
      loading,
      error,
      refreshQuestionnaireStatus,
    }),
    [completed, loading, error],
  );

  return (
    <QuestionnaireContext.Provider value={contextValue}>{children}</QuestionnaireContext.Provider>
  );
};

export const useQuestionnaire = () => {
  const context = useContext(QuestionnaireContext);

  if (!context) {
    throw new Error('useQuestionnaire must be used within QuestionnaireProvider');
  }

  return context;
};
