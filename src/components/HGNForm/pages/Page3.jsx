import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import Progress from '../questionpages/Progress';
import QuestionnaireInfo from '../questionpages/QuestionnaireInfo';
import FrontendQuestions from '../questionpages/FrontendQuestions';
import containerStyles from '../styles/hgnform.module.css';

function Page3() {
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div
      className={`${containerStyles['container-hgnform-wrapper']} ${
        darkMode ? 'bg-oxford-blue' : ''
      }`}
    >
      <Banner />
      <QuestionnaireInfo />
      <Progress progressValue={16.67 * 3} />
      <FrontendQuestions />
    </div>
  );
}

export default Page3;
