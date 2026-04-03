<<<<<<< HEAD
<<<<<<< HEAD
import { useEffect, useState } from 'react';
=======
import { use, useEffect } from 'react';
>>>>>>> a2dce1bdb (add dark mode for questionnaire)
=======
import { useEffect } from 'react';
>>>>>>> 47c2f6ce9 (fix accidental code additions)
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getUserProfileBasicInfo } from '~/actions/userManagement';
import httpService from '~/services/httpService';
import { ENDPOINTS } from '~/utils/URL';
import Banner from '../questionpages/Banner';
import QuestionnaireInfo from '../questionpages/QuestionnaireInfo';
import InfoForm from '../questionpages/InfoForm';
import Progress from '../questionpages/Progress';
import styles from '../styles/hgnform.module.css';

<<<<<<< HEAD
export default function Page1() {
=======
function Page1() {
  const user = useSelector(state => state.auth.user);
  const darkMode = useSelector(state => state.theme.darkMode);
>>>>>>> a2dce1bdb (add dark mode for questionnaire)
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const authUser = useSelector(state => state.auth.user);
  const history = useHistory();
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    if (authUser?.userid) {
      dispatch(getUserProfileBasicInfo({ userId: authUser.userid }));
    }
  }, [dispatch, authUser?.userid]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

<<<<<<< HEAD
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
        const data = res?.data;

        // Response has skillInfo (not skills) — check if it exists
        if (mounted && res?.status === 200 && data?.skillInfo) {
          history.replace('/hgn/profile/skills');
          return;
        }
      } catch {
        // 404 or error means no skills data → user hasn't submitted → show form
      } finally {
        if (mounted) setCheckingExisting(false);
      }
    }

    checkExistingResponse();
    return () => {
      mounted = false;
    };
  }, [authUser?.userid, history]);

  if (checkingExisting) {
    return (
      <div
        className={`${styles['container-hgnform-wrapper']} ${darkMode ? 'bg-oxford-blue' : ''}`}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <p>Checking your previous response…</p>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className={`${styles['container-hgnform-wrapper']} ${darkMode ? 'bg-oxford-blue' : ''}`}>
=======
    <div className={`${styles.hgnform} ${darkMode ? 'bg-oxford-blue' : ''}`}>
>>>>>>> a2dce1bdb (add dark mode for questionnaire)
=======
  const darkClass = darkMode ? styles.bgOxfordBlue : '';

  return (
    <div className={`${styles.hgnform} ${darkClass}`}>
>>>>>>> 8517600dd (Refactor dark mode class assignment in Page1.jsx)
      <Banner />
      <QuestionnaireInfo />
      <InfoForm />
      <Progress progressValue={16.67} />
    </div>
  );
}
