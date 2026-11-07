import React from 'react';
import { useQuestionnaire } from '../context/QuestionnaireContext';
import QuestionnaireReminder from './QuestionnaireReminder';

const QuestionnaireGuard = ({ children }) => {
  const { completed, loading } = useQuestionnaire();

  if (loading || completed === null) {
    return <div>Loading...</div>;
  }

  if (!completed) {
    return <QuestionnaireReminder onComplete={() => window.location.assign('/hgnform')} />;
  }

  return children;
};

export default QuestionnaireGuard;
