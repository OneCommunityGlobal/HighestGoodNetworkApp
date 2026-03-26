import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import Progress from '../questionpages/Progress';
import QuestionnaireInfo from '../questionpages/QuestionnaireInfo';
import GeneralQuestions from '../questionpages/GeneralQuestions';
<<<<<<< HEAD
import containerStyles from '../styles/hgnform.module.css';

function Page2() {
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
import styles from '../styles/hgnform.module.css';
import { useSelector } from 'react-redux';
import { getBoxStyling, getFontColor } from '../../../styles';

function Page2() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const headerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const darkClass = darkMode ? styles.bgOxfordBlue : '';

  return (
<<<<<<< HEAD
    <div className={`${styles.hgnform} ${darkMode ? 'bg-oxford-blue' : ''}`}>
>>>>>>> d9c2c36e0 (add dark mode styling to page2)
=======
    <div className={`${styles.hgnform} ${darkClass}`}>
>>>>>>> 35b30e481 (Refactor Page2 component for dark mode styling)
      <Banner />
      <QuestionnaireInfo />
      <Progress progressValue={16.67 * 2} />
      <GeneralQuestions />
    </div>
  );
}

export default Page2;
