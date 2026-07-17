import React from 'react';
import { SidebarProvider } from './SidebarContext';
import EvaluationResults from './EvaluationResults/EvaluationResults';

const EvaluationResultsWithSidebar = props => {
  return (
    <SidebarProvider>
      <EvaluationResults {...props} />
    </SidebarProvider>
  );
};

export default EvaluationResultsWithSidebar;
