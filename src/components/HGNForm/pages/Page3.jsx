import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import Progress from '../questionpages/Progress';
<<<<<<< HEAD
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
=======
import { useSelector } from 'react-redux';
import styles from '../styles/hgnform.module.css';


function Page3() {
  const headerRef = useRef(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
const darkClass = darkMode ? styles.bgOxfordBlue : ''; 

  return (
<<<<<<< HEAD
    <div className={`${styles.hgnform} ${darkMode ? 'bg-oxford-blue' : ''}`}>
>>>>>>> 611be96be (add dark mode styling to page3)
      <Banner />
      <QuestionnaireInfo />
=======
     <div className={`${styles.hgnform} ${darkClass}`}> 
   <Banner />
      <QuestionnaireHeader ref={headerRef} />
      <FrontendQuestions />
>>>>>>> d7fef0715 (Refactor dark mode class assignment in Page3)
      <Progress progressValue={16.67 * 3} />
      <FrontendQuestions />
    </div>
  );
}

export default Page3;
