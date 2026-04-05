import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import Progress from '../questionpages/Progress';
import ThankYou from '../questionpages/ThankYou';
import containerStyles from '../styles/hgnform.module.css';
import useScrollTop from '~/hooks/useScrollTop';

export default function Page6() {
  const darkMode = useSelector(state => state.theme.darkMode);
  useScrollTop();

  return (
    <div className={`${containerStyles.hgnform} ${darkMode ? containerStyles.bgOxfordBlue : ''}`}>
      <Banner />
      <ThankYou />
      <Progress progressValue={100} />
    </div>
  );
}