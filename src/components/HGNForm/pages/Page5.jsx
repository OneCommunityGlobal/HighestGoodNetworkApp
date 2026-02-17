import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import QuestionnaireHeader from '../questionpages/QuestionnaireHeader';
import FollowupQuestions from '../questionpages/FollowupQuestions';
import Progress from '../questionpages/Progress';
import containerStyles from '../styles/hgnform.module.css';

function Page5() {
  const headerRef = useRef(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, []);

  return (
    <div
      className={`${containerStyles['container-hgnform-wrapper']} ${
        darkMode ? 'bg-oxford-blue' : ''
      }`}
    >
      <Banner />
      <QuestionnaireHeader ref={headerRef} />
      <FollowupQuestions />
      <Progress progressValue={16.67 * 5} />
    </div>
  );
}

export default Page5;
