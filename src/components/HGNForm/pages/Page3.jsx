import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import Progress from '../questionpages/Progress';
import FrontendQuestions from '../questionpages/FrontendQuestions';
import containerStyles from '../styles/hgnform.module.css';
import useScrollTop from '~/hooks/useScrollTop';

export default function Page3() {
  const darkMode = useSelector(state => state.theme.darkMode);
  useScrollTop();

  return (
    <div className={`${containerStyles.hgnform} ${darkMode ? containerStyles.bgOxfordBlue : ''}`}>
      <Banner />
      <Progress progressValue={16.67 * 3} />
      <FrontendQuestions />
    </div>
  );
}