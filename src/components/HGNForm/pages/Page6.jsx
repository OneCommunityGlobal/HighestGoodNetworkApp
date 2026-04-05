import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import ThankYou from '../questionpages/ThankYou';
import Progress from '../questionpages/Progress';
import containerStyles from '../styles/hgnform.module.css';

export default function Page6() {
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const darkClass = darkMode ? containerStyles.bgOxfordBlue : '';

  return (
    <div className={`${containerStyles.hgnform} ${darkClass}`}>
      <Banner />
      <ThankYou />
      <Progress progressValue={100} />
    </div>
  );
}