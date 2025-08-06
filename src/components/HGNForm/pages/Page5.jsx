import { useEffect, useRef } from 'react';
import Banner from '../questionpages/Banner';
import QuestionnaireHeader from '../questionpages/QuestionnaireHeader';
import FollowupQuestions from '../questionpages/FollowupQuestions';
import Progress from '../questionpages/Progress';

function Page5() {
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
      <FollowupQuestions />
      <Progress progressValue={16.67 * 5} />
    </div>
  );
}

export default Page5;
