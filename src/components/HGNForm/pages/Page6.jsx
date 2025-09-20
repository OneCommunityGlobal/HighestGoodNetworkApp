import { useEffect } from 'react';
import Banner from '../questionpages/Banner';
import ThankYou from '../questionpages/ThankYou';
import Progress from '../questionpages/Progress';
import { useSelector } from 'react-redux';
import styles from '../styles/hgnform.module.css';
import { getBoxStyling, getFontColor } from '../../../styles';

function Page6() {
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`${styles.hgnform} ${darkMode ? 'bg-oxford-blue' : ''}`}>
      <Banner />
      <ThankYou />
      <Progress progressValue={100} />
    </div>
  );
}

export default Page6;
