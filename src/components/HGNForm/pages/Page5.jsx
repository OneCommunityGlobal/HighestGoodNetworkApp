import { useEffect, useRef } from 'react';
import Banner from '../questionpages/Banner';
import QuestionnaireHeader from '../questionpages/QuestionnaireHeader';
import FollowupQuestions from '../questionpages/FollowupQuestions';
import Progress from '../questionpages/Progress';
import { useSelector } from 'react-redux';
import styles from '../styles/hgnform.module.css';
import { getBoxStyling, getFontColor } from '../../../styles';

function Page5() {
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
      <FollowupQuestions />
      <Progress progressValue={16.67 * 5} />
    </div>
  );
}

export default Page5;
