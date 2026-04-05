import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import Progress from '../questionpages/Progress';
import FollowupQuestions from '../questionpages/FollowupQuestions';
import containerStyles from '../styles/hgnform.module.css';
import useScrollTop from '~/hooks/useScrollTop';

export default function Page5() {
  const darkMode = useSelector(state => state.theme.darkMode);
  useScrollTop();

  return (
    <div className={`${containerStyles.hgnform} ${darkMode ? containerStyles.bgOxfordBlue : ''}`}>
      <Banner />
      <FollowupQuestions />
      <Progress progressValue={16.67 * 5} />
    </div>
  );
}