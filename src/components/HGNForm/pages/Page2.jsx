
import { useSelector } from 'react-redux';
import Banner from '../questionpages/Banner';
import Progress from '../questionpages/Progress';
import QuestionnaireInfo from '../questionpages/QuestionnaireInfo';
import GeneralQuestions from '../questionpages/GeneralQuestions';
import containerStyles from '../styles/hgnform.module.css';

export default function Page2() {
  const darkMode = useSelector(state => state.theme.darkMode);
 

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const darkClass = darkMode ? containerStyles.bgOxfordBlue : '';

  return (
    <div className={`${containerStyles.hgnform} ${darkClass}`}>
      <Banner />
      <QuestionnaireInfo />
      <Progress progressValue={16.67 * 2} />
      <GeneralQuestions />
    </div>
  );
}
