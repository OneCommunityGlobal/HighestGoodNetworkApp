import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import FollowupQuestions from '../questionpages/FollowupQuestions';
import Progress from '../questionpages/Progress';
<<<<<<< HEAD
import containerStyles from '../styles/hgnform.module.css';

function Page5() {
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
import { getBoxStyling, getFontColor } from '../../../styles';

function Page5() {
  const headerRef = useRef(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const darkClass = darkMode ? styles.bgOxfordBlue : '';
  return (
<<<<<<< HEAD
    <div className={`${styles.hgnform} ${darkMode ? 'bg-oxford-blue' : ''}`}>
>>>>>>> 9e2264a47 (add dark mode styling to page 5)
=======
   <div className={`${styles.hgnform} ${darkClass}`}> 
>>>>>>> 21ac975cb (Refactor dark mode class assignment in Page5)
      <Banner />
      <FollowupQuestions />
      <Progress progressValue={16.67 * 5} />
    </div>
  );
}

export default Page5;
