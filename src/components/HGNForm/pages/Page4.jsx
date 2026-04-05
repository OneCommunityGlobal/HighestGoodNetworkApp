import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import BackendQuestions from '../questionpages/BackendQuestions';
import Progress from '../questionpages/Progress';
import containerStyles from '../styles/hgnform.module.css';

export default function Page4() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const headerRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const darkClass = darkMode ? containerStyles.bgOxfordBlue : '';

  return (
    <div className={`${containerStyles.hgnform} ${darkClass}`}>
      <Banner />
      <BackendQuestions ref={headerRef} />
      <Progress progressValue={16.67 * 4} />
    </div>
  );
}