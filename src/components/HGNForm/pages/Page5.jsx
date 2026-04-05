import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import FollowupQuestions from '../questionpages/FollowupQuestions';
import Progress from '../questionpages/Progress';
import containerStyles from '../styles/hgnform.module.css';

export default function Page5() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const headerRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const darkClass = darkMode ? containerStyles.bgOxfordBlue : '';

  return (
    <div className={`${containerStyles.hgnform} ${darkClass}`}>
      <Banner />
      <FollowupQuestions ref={headerRef} />
      <Progress progressValue={16.67 * 5} />
    </div>
  );
}