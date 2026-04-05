import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getUserProfileBasicInfo } from '~/actions/userManagement';
import httpService from '~/services/httpService';
import { ENDPOINTS } from '~/utils/URL';
import Banner from '../questionpages/Banner';
import QuestionnaireInfo from '../questionpages/QuestionnaireInfo';
import InfoForm from '../questionpages/InfoForm';
import Progress from '../questionpages/Progress';
import containerStyles from '../styles/hgnform.module.css';
import useScrollTop from '~/hooks/useScrollTop';

export default function Page1() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const authUser = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const [checkingExisting, setCheckingExisting] = useState(true);

  useScrollTop();

  useEffect(() => {
    if (authUser?.userid) {
      dispatch(getUserProfileBasicInfo({ userId: authUser.userid }));
    }
  }, [dispatch, authUser?.userid]);

  useEffect(() => {
    let mounted = true;
    async function checkExistingResponse() {
      try {
        const userId = authUser?.userid;
        if (!userId) {
          if (mounted) setCheckingExisting(false);
          return;
        }
        const res = await httpService.get(ENDPOINTS.SKILLS_PROFILE(userId));
        if (mounted && res?.status === 200 && res?.data?.skillInfo) {
          history.replace('/hgn/profile/skills');
        }
      } catch {}
      finally { if (mounted) setCheckingExisting(false); }
    }
    checkExistingResponse();
    return () => { mounted = false; };
  }, [authUser?.userid, history]);

  if (checkingExisting) {
    return (
      <div className={`${containerStyles.hgnform} ${darkMode ? containerStyles.bgOxfordBlue : ''}`} style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'50vh' }}>
        <p>Checking your previous response…</p>
      </div>
    );
  }

  return (
    <div className={`${containerStyles.hgnform} ${darkMode ? containerStyles.bgOxfordBlue : ''}`}>
      <Banner />
      <QuestionnaireInfo />
      <InfoForm />
      <Progress progressValue={16.67} />
    </div>
  );
}