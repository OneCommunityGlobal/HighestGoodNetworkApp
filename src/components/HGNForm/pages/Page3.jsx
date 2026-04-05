import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import Progress from '../questionpages/Progress';
import FrontendQuestions from '../questionpages/FrontendQuestions';
import containerStyles from '../styles/hgnform.module.css';

export default function Page3() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const headerRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const darkClass = darkMode ? containerStyles.bgOxfordBlue : '';

  return (
    <div className={`${containerStyles.hgnform} ${darkClass}`}>
      <Banner />
      <FrontendQuestions ref={headerRef} />
      <Progress progressValue={16.67 * 3} />
    </div>
  );
}