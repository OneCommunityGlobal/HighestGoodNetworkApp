import React from 'react';
import QuestionPage  from './QuestionPage';
import { ENDPOINTS } from '~/utils/URL';

 const fieldNameMapFrontend = [
   'frontend_Overall', 
   'frontend_HTML', 
   'frontend_Bootstrap', 
   'frontend_CSS', 
   'frontend_React', 
   'frontend_Redux', 
   'frontend_WebSocketCom', 
   'frontend_ResponsiveUI', 
   'frontend_UnitTest', 
   'frontend_Documentation', 
   'frontend_UIUXTools', 

  ];
 function FrontendQuestions(){
  return (
    <QuestionPage
      pageNumber={3}
      title="Frontend"
      fieldNameMap={fieldNameMapFrontend}
      nextPage="/hgnForm/page4"
      backpage="/hgnForm/page2"
      ENDPOINTS={ENDPOINTS}
    />
  );
 }
export default FrontendQuestions;
