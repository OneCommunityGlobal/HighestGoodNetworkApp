import { useEffect, useRef } from 'react';
import Banner from '../questionpages/Banner';
import QuestionnaireHeader from '../questionpages/QuestionnaireHeader';
import FrontendQuestions from '../questionpages/FrontendQuestions';
import Progress from '../questionpages/Progress';
import { useSelector } from 'react-redux';
import styles from '../styles/hgnform.module.css';
import { getBoxStyling, getFontColor } from '../../../styles';

function Page3() {
  const headerRef = useRef(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
const darkClass = darkMode ? styles.bgOxfordBlue : ''; 

  return (
     <div className={`${styles.hgnform} ${darkClass}`}> 
   <Banner />
      <QuestionnaireHeader ref={headerRef} />
      <FrontendQuestions />
      <Progress progressValue={16.67 * 3} />
    </div>
  );
}

export default Page3;
