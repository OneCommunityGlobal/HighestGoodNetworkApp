import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import BackendQuestions from '../questionpages/BackendQuestions';
import Progress from '../questionpages/Progress';
<<<<<<< HEAD
import containerStyles from '../styles/hgnform.module.css';

function Page4() {
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

function Page4() {
  const headerRef = useRef(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`${styles.hgnform} ${darkMode ? 'bg-oxford-blue' : ''}`}>
>>>>>>> 85f9e9e48 (add dark mode styling to page 4)
      <Banner />
      <BackendQuestions />
      <Progress progressValue={16.67 * 4} />
    </div>
  );
}

export default Page4;
