import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import Progress from '../questionpages/Progress';
import QuestionnaireInfo from '../questionpages/QuestionnaireInfo';
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
      <QuestionnaireInfo ref={headerRef} />
      <Progress progressValue={16.67 * 2} />
      <GeneralQuestions />
    </div>
  );
}

export default Page2;
