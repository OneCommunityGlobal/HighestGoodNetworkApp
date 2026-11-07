import React, { createContext, useContext, useEffect, useState } from 'react';
import { getQuestionnaireStatus } from '../services/questionnaireService';

const QuestionnaireContext = createContext(null);

export const QuestionnaireProvider = ({ children }) => {
  const [completed, setCompleted] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshQuestionnaireStatus = async () => {
    setLoading(true);

    try {
      const data = await getQuestionnaireStatus();
      setCompleted(data.completed);
    } catch (error) {
      console.error('Unable to retrieve questionnaire status:', error);
      setCompleted(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshQuestionnaireStatus();
  }, []);

  return (
    <QuestionnaireContext.Provider
      value={{
        completed,
        loading,
        refreshQuestionnaireStatus,
      }}
    >
      {children}
    </QuestionnaireContext.Provider>
  );
};

export const useQuestionnaire = () => {
  const context = useContext(QuestionnaireContext);

  if (!context) {
    throw new Error('useQuestionnaire must be used within QuestionnaireProvider');
  }

  return context;
};
