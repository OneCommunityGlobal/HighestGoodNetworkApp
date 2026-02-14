import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getUserProfileBasicInfo } from '~/actions/userManagement';
import httpService from '~/services/httpService';
import Banner from '../questionpages/Banner';
import QuestionnaireInfo from '../questionpages/QuestionnaireInfo';
import InfoForm from '../questionpages/InfoForm';
import Progress from '../questionpages/Progress';
import styles from '../styles/hgnform.module.css';

export default function Page1(/* existing props */) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const user = useSelector(state => state.auth.user);
  const history = useHistory();
  const userProfile = useSelector(state => state?.userProfile?.profile);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    if (user?.userid) {
      dispatch(getUserProfileBasicInfo({ userId: user.userid }));
    }
  }, [dispatch, user?.userid]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function checkExisting() {
      try {
        const userId = userProfile?._id;
        const email = userProfile?.email;
        if (!userId && !email) return;
        // Prefer server-side filter by user_id; fallback to list + filter
        const res = await httpService.get('/api/hgnformresponses', {
          params: userId ? { user_id: userId } : undefined,
        });
        const rows = Array.isArray(res?.data) ? res.data : [];
        const exists = rows.some(
          r =>
            (userId && (r?.user_id === userId || r?.userInfo?._id === userId)) ||
            (email && r?.userInfo?.email?.toLowerCase() === email?.toLowerCase()),
        );
        if (mounted && exists) {
          // Redirect to Skills page or the appropriate destination for submitted users
          history.replace('/hgndashboard/skills');
          return;
        }
      } catch {
        // Fail open: allow user to fill the form if the check fails
      } finally {
        mounted && setCheckingExisting(false);
      }
    }
    checkExisting();
    return () => {
      mounted = false;
    };
  }, [userProfile, history]);

  if (checkingExisting) {
    // Keep it minimal to avoid layout shift
    return <div style={{ padding: 12 }}>Checking your previous response…</div>;
  }

  return (
    <div className={`${styles['container-hgnform-wrapper']} ${darkMode ? 'bg-oxford-blue' : ''}`}>
      <Banner />
      <QuestionnaireInfo />
      <InfoForm />
      <Progress progressValue={16.67 * 1} />
    </div>
  );
}
