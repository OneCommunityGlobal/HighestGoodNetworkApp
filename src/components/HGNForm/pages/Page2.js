import { useEffect, useRef } from 'react';
import Banner from '../questionpages/Banner';
import Progress from '../questionpages/Progress';
import QuestionnaireHeader from '../questionpages/QuestionnaireHeader';
import GeneralQuestions from '../questionpages/GeneralQuestions';

function Page2() {
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
      <GeneralQuestions />
      <Progress progressValue={16.67 * 2} />
    </div>
  );
}

export default Page2;
