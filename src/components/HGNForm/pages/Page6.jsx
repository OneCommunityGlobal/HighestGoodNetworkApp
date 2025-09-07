import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import ThankYou from '../questionpages/ThankYou';
import Progress from '../questionpages/Progress';
<<<<<<< HEAD
import containerStyles from '../styles/hgnform.module.css';

function Page6() {
  const darkMode = useSelector(state => state.theme.darkMode);
=======
import { useSelector } from 'react-redux';
import styles from '../styles/hgnform.module.css';
import { getBoxStyling, getFontColor } from '../../../styles';

function Page6() {
  const darkMode = useSelector(state => state.theme.darkMode);

>>>>>>> 8b0d5c684 (add dark mode styling to page6)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
<<<<<<< HEAD
    <div
      className={`${containerStyles['container-hgnform-wrapper']} ${
        darkMode ? 'bg-oxford-blue' : ''
      }`}
    >
=======
    <div className={`${styles.hgnform} ${darkMode ? 'bg-oxford-blue' : ''}`}>
>>>>>>> 8b0d5c684 (add dark mode styling to page6)
      <Banner />
      <ThankYou />
      <Progress progressValue={100} />
    </div>
  );
}

export default Page6;
