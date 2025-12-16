import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import QuestionnaireHeader from '../questionpages/QuestionnaireHeader';
import FrontendQuestions from '../questionpages/FrontendQuestions';
import Progress from '../questionpages/Progress';
import containerStyles from '../styles/hgnform.module.css';

function Page3() {
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
      <FrontendQuestions />
      <Progress progressValue={16.67 * 3} />
    </div>
  );
}

export default Page3;
