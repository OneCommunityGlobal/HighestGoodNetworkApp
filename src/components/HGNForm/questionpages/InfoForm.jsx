import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector, useSelector as useReduxSelector } from 'react-redux';
import { setformData } from '~/actions/hgnFormAction';
import { Spinner } from 'reactstrap';
import styles from '../styles/InfoForm.module.css';
import { getBoxStyling, getFontColor } from '../../../styles';

function InfoForm() {
  const darkMode = useReduxSelector(state => state.theme.darkMode);
  const formData = useSelector(state => state.hgnForm);
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const darkMode = useSelector(state => state.theme.darkMode);
  const isOwner = user.role === 'Owner';
  const userProfile = useSelector(state => state.allUserProfilesBasicInfo?.userProfilesBasicInfo);

  const [newVolunteer, setNewVolunteer] = useState({
    ...formData,
    github: formData?.github || '',
    slack: formData?.slack || '',
  });
  const [loading, setLoading] = useState(true);
  const updateFormData = data => {
    dispatch(setformData(data));
  };
  const [touched, setTouched] = useState(false);
  const [isSlackNameWarning, setIsSlackNameWarning] = useState(false);

  const isValid = newVolunteer.name.length >= 2;
  const showError = touched && !isValid;

  const navigate = useHistory();

  useEffect(() => {
    const trimmedSlack = newVolunteer.slack.trim().toLowerCase();
    const trimmedName = newVolunteer.name.trim().toLowerCase();

    if (trimmedSlack === trimmedName) {
      setIsSlackNameWarning(false);
    } else if (newVolunteer.slack && newVolunteer.name) {
      setIsSlackNameWarning(true);
    }
  }, [newVolunteer.name, newVolunteer.slack]);

  useEffect(() => {
    if (user && userProfile && formData) {
      setNewVolunteer(prevState => ({
        ...formData,
        ...prevState, // This preserves any user input
        name: `${userProfile?.firstName} ${userProfile?.lastName}`,
        email: user.email,
        github: prevState.github || formData.github || '', // Preserve GitHub value
        slack: prevState.slack || formData.slack || '', // Preserve
      }));
      setLoading(false);
    }
  }, [userProfile, user, formData]);

  const handleSlackChange = e => {
    const { checked } = e.target;
    setNewVolunteer({
      ...newVolunteer,
      isSlackSameAsName: checked,
    });
  };

  const handleNext = e => {
    e.preventDefault();
    updateFormData(newVolunteer);
    if (!isValid) {
      setTouched(true);
      return;
    }

    if (
      newVolunteer.isSlackSameAsName &&
      newVolunteer.name.trim().toLowerCase() !== newVolunteer.slack.trim().toLowerCase()
    ) {
      setIsSlackNameWarning(true);
      return;
    }
    dispatch(setformData(newVolunteer));
    navigate.push('/hgnform/page2', { isOwner });
  };

  const handleCancel = e => {
    e.preventDefault();
    setTouched(false);

    setNewVolunteer({
      // Rest all the pages when "Cancel" button is clicked

      // PAGE 1: General form fields
      // name: '',
      // email: '',
      github: '',
      slack: '',

      // PAGE 2: Fields from GeneralQuestions component
      hours: '',
      period: '',
      standup: '',
      location: '',
      manager: '',
      combined_frontend_backend: '',
      // combined_skills: '',
      mern_skills: '',
      leadership_skills: '',
      leadership_experience: '',
      preferences: [],
      availability: {},

      // PAGE 3: Frontend form fields
      frontend_Overall: '',
      frontend_HTML: '',
      frontend_Bootstrap: '',
      frontend_CSS: '',
      frontend_React: '',
      frontend_Redux: '',
      frontend_WebSocketCom: '',
      frontend_ResponsiveUI: '',
      frontend_UnitTest: '',
      frontend_Documentation: '',
      frontend_UIUXTools: '',

      // PAGE 4: Backend form fields
      backend_Overall: '',
      backend_Database: '',
      backend_MongoDB: '',
      backend_MongoDB_Advanced: '',
      backend_TestDrivenDev: '',
      backend_Deployment: '',
      backend_VersionControl: '',
      backend_CodeReview: '',
      backend_EnvironmentSetup: '',
      backend_AdvancedCoding: '',
      backend_AgileDevelopment: '',

      // PAGE 5: Follow-up form fields
      followup_platform: '',
      followup_mern_work_experience: '',
      followup_other_skills: '',
      followup_suggestion: '',
      followup_additional_info: '',

      isSlackNameWarning: '',
    });
  };

  return !loading ? (
<<<<<<< HEAD
    <div className={`${styles.infoFormContainer} ${darkMode ? styles.dark : ''}`}>
=======
    <div
      className={`${styles.infoFormContainer} ${darkMode ? 'bg-space-cadet' : ''}`}
      style={getBoxStyling(darkMode)}
    >
>>>>>>> f4bb365f3 (add dark mode to infoForm.jsx)
      <form onSubmit={handleNext}>
        <div className={`${styles.formInputs}`}>
          <label htmlFor="name" className={`${getFontColor(darkMode)}`}>
            Name <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            className={`
              ${styles.infoInput}
              ${darkMode ? 'bg-yinmn-blue' : ''}
              ${getFontColor(darkMode)}
              ${showError ? styles.error : ''}
            `}
            type="text"
            id="name"
            value={newVolunteer.name}
            onChange={e => setNewVolunteer({ ...newVolunteer, name: e.target.value })}
            onBlur={() => setTouched(true)}
            required
            minLength={2}
            pattern=".{2,}"
            title="Name must be at least 2 characters long"
            placeholder="Your First and Last Name"
          />
          {showError && (
            <span className={`${styles.errorMessage} `}>
              Name must be at least 2 characters long
            </span>
          )}
        </div>
        <div className={`${styles.formInputs}`}>
          <label htmlFor="email" className={`${getFontColor(darkMode)}`}>
            Email <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            className={`
              ${styles.infoInput}
              ${darkMode ? 'bg-yinmn-blue' : ''}
              ${getFontColor(darkMode)}
            `}
            type="email"
            id="email"
            value={newVolunteer.email}
            onChange={e => setNewVolunteer({ ...newVolunteer, email: e.target.value })}
            required
            placeholder="Your Email"
            disabled={!!(user.email !== undefined || user.email !== null)}
          />
        </div>
        <div className={`${styles.formInputs}`}>
<<<<<<< HEAD
          <label htmlFor="github" className={`${styles.labelInline}`}>
=======
          <label htmlFor="github" className={`${getFontColor(darkMode)}`}>
>>>>>>> f4bb365f3 (add dark mode to infoForm.jsx)
            GitHub <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            className={`
              ${styles.infoInput}
              ${darkMode ? 'bg-yinmn-blue' : ''}
              ${getFontColor(darkMode)}
            `}
            type="text"
            id="github"
            value={newVolunteer.github}
            onChange={e => setNewVolunteer({ ...newVolunteer, github: e.target.value })}
            required
            placeholder="Your GitHub"
            disabled={loading}
          />
        </div>
        <div className={`${styles.formInputs}`}>
<<<<<<< HEAD
          <label htmlFor="slack" className={`${styles.labelInline}`}>
=======
          <label htmlFor="slack" className={`${getFontColor(darkMode)}`}>
>>>>>>> f4bb365f3 (add dark mode to infoForm.jsx)
            Slack <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            className={`
              ${styles.infoInput}
              ${darkMode ? 'bg-yinmn-blue' : ''}
              ${getFontColor(darkMode)}
            `}
            type="text"
            id="slack"
            value={newVolunteer.slack}
            onChange={e => setNewVolunteer({ ...newVolunteer, slack: e.target.value })}
            required
            placeholder="Your Slack"
            disabled={loading}
          />
        </div>
        {isSlackNameWarning && (
          <span className={`${styles.errorMessage}`} style={{ color: 'red', margin: '20px 20px' }}>
            Kindly ensure your Slack name matches your full name as entered above. If it does not,
            please go to your Slack account to update your name, then return to this form to
            continue.
          </span>
        )}
        <div className={`${styles.formInputsSlack}`}>
          <input
            className={`${styles.slackCheckbox}`}
            type="checkbox"
            id="sameAsName"
            checked={newVolunteer.isSlackSameAsName}
            onChange={handleSlackChange}
            required
          />

          <label
<<<<<<< HEAD
            style={{ color: darkMode ? '#78a5c4' : '#2f5061', margin: '0 5px' }}
            htmlFor="sameAsName"
=======
            style={{ color: '#2f5061', margin: '0 5px' }}
            htmlFor="sameAsName"
            className={`${getFontColor(darkMode)}`}
>>>>>>> f4bb365f3 (add dark mode to infoForm.jsx)
          >
            Yes, my Slack handle is my first and last name <span style={{ color: 'red' }}>*</span>
          </label>
        </div>

        <span
<<<<<<< HEAD
          className={`${styles.errorMessage}`}
          style={{ color: darkMode ? '#b5bac5' : '#2e5163', margin: '20px 20px' }}
        >
          <strong style={{ color: darkMode ? '#78a5c4' : '#2f5061' }}>NOTE:</strong> Your name and
          email need to match what is on your DropBox and Google Doc. Please edit them on your
          Profile Page if they don’t.{' '}
=======
          className={`${styles.errorMessage} ${getFontColor(darkMode)}`}
          style={{ color: '#2e5163', margin: '20px 20px' }}
        >
          <strong className={`${getFontColor(darkMode)}`}>NOTE:</strong> Your name and email need to
          match what is on your DropBox and Google Doc. Please edit them on your Profile Page if
          they don’t.{' '}
>>>>>>> f4bb365f3 (add dark mode to infoForm.jsx)
        </span>

        <div className={`${styles.buttonContainer}`}>
          <button type="button" className={`${styles.hgnReturnButton}`} onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className={`${styles.nextButton}`}>
            Next
          </button>
        </div>
      </form>
    </div>
  ) : (
    <div>
      <Spinner color="primary" className={`${styles.spinnerHgnform}`} style={{ top: '80%' }} />;
    </div>
  );
}

export default InfoForm;
