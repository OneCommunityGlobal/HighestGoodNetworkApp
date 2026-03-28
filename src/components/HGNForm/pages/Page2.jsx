import { useEffect, useRef } from 'react';
import Banner from '../questionpages/Banner';
import Progress from '../questionpages/Progress';
import QuestionnaireHeader from '../questionpages/QuestionnaireHeader';
import GeneralQuestions from '../questionpages/GeneralQuestions';
import styles from '../styles/hgnform.module.css';
import { useSelector } from 'react-redux';


function Page2() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const headerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const darkClass = darkMode ? styles.bgOxfordBlue : '';

  return (
    <div className={`${styles.hgnform} ${darkClass}`}>
      <Banner />
      <QuestionnaireHeader ref={headerRef} />
      <GeneralQuestions />
      <Progress progressValue={16.67 * 2} />
    </div>
  );
}

export default Page2;
