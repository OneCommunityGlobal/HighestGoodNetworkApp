import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getUserProfileBasicInfo } from 'actions/userManagement';
import Banner from '../questionpages/Banner';
import QuestionnaireInfo from '../questionpages/QuestionnaireInfo';
import InfoForm from '../questionpages/InfoForm';
import Progress from '../questionpages/Progress';
import '../styles/hgnform.css';

function Page1() {
  const dispatch = useDispatch();
  dispatch(getUserProfileBasicInfo());
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="hgnform">
      <Banner />
      <QuestionnaireInfo />
      <InfoForm />
      <Progress progressValue={16.67 * 1} />
    </div>
  );
}

export default Page1;
