import { useEffect, useRef } from 'react';
import Banner from '../questionpages/Banner';
import QuestionnaireHeader from '../questionpages/QuestionnaireHeader';
import BackendQuestions from '../questionpages/BackendQuestions';
import Progress from '../questionpages/Progress';

function Page4() {
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
      <BackendQuestions />
      <Progress progressValue={16.67 * 4} />
    </div>
  );
}

export default Page4;
