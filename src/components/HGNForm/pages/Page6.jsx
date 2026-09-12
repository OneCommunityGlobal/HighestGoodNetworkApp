import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import ThankYou from '../questionpages/ThankYou';
import Progress from '../questionpages/Progress';
import containerStyles from '../styles/hgnform.module.css';

function Page6() {
  const darkMode = useSelector(state => state.theme.darkMode);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className={`${containerStyles['container-hgnform-wrapper']} ${
        darkMode ? 'bg-oxford-blue' : ''
      }`}
    >
      <Banner />
      <ThankYou />
      <Progress progressValue={100} />
    </div>
  );
}

export default Page6;
