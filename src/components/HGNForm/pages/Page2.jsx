import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import Progress from '../questionpages/Progress';
import QuestionnaireHeader from '../questionpages/QuestionnaireHeader';
import GeneralQuestions from '../questionpages/GeneralQuestions';
import containerStyles from '../styles/hgnform.module.css';

function Page2() {
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
      <GeneralQuestions />
      <Progress progressValue={16.67 * 2} />
    </div>
  );
}

export default Page2;
