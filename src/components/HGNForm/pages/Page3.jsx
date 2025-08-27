import { useEffect, useRef } from 'react';
import Banner from '../questionpages/Banner';
import QuestionnaireHeader from '../questionpages/QuestionnaireHeader';
import FrontendQuestions from '../questionpages/FrontendQuestions';
import Progress from '../questionpages/Progress';

function Page3() {
  const headerRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, []);

  return (
    <div className="hgnform">
      <Banner />
      <QuestionnaireHeader ref={headerRef} />
      <FrontendQuestions />
      <Progress progressValue={16.67 * 3} />
    </div>
  );
}

export default Page3;
