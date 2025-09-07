import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfileBasicInfo } from '~/actions/userManagement';
import Banner from '../questionpages/Banner';
import QuestionnaireInfo from '../questionpages/QuestionnaireInfo';
import InfoForm from '../questionpages/InfoForm';
import Progress from '../questionpages/Progress';
import styles from '../styles/hgnform.module.css';

function Page1() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    if (user?.userid) {
      dispatch(getUserProfileBasicInfo(user.userid));
    }
  }, [dispatch, user?.userid]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`${styles['container-hgnform-wrapper']} ${darkMode ? 'bg-oxford-blue' : ''}`}>
      <Banner />
      <QuestionnaireInfo />
      <InfoForm />
      <Progress progressValue={16.67 * 1} />
    </div>
  );
}

export default Page1;
