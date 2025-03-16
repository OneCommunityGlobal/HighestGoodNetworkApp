import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import '../styles/InfoForm.css';
import { useDispatch, useSelector } from 'react-redux';
import { setformData } from 'actions/hgnFormAction';
import { Spinner } from 'reactstrap';

function InfoForm() {
  const formData = useSelector(state => state.hgnForm);
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const isOwner = user.role === 'Owner';
  const { userProfilesBasicInfo } = useSelector(state => state.allUserProfilesBasicInfo);
  const userProfile = userProfilesBasicInfo.find(profile => profile._id === user.userid);
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
    if(user && userProfile && formData) {
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
      followup_other_skills: '',
      followup_suggestion: '',
      followup_additional_info: '',

      isSlackNameWarning: '',
    });
  };

  return !loading ? (
    <div className="info-form-container">
      <form onSubmit={handleNext}>
        <div className="form-inputs">
          <label htmlFor="name">
            Name <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            className={`info-input ${showError ? 'error' : ''}`}
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
            disabled={!!(userProfile !== undefined || userProfile !== null)}
          />
          {showError && (
            <span className="error-message">Name must be at least 2 characters long</span>
          )}
        </div>
        <div className="form-inputs">
          <label htmlFor="email">
            Email <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            className="info-input"
            type="email"
            id="email"
            value={newVolunteer.email}
            onChange={e => setNewVolunteer({ ...newVolunteer, email: e.target.value })}
            required
            placeholder="Your Email"
            disabled={!!(user.email !== undefined || user.email !== null)}
          />
        </div>
        <div className="form-inputs">
          <label htmlFor="github">
            GitHub <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            className="info-input"
            type="text"
            id="github"
            value={newVolunteer.github}
            onChange={e => setNewVolunteer({ ...newVolunteer, github: e.target.value })}
            required
            placeholder="Your GitHub"
            disabled={loading}
          />
        </div>
        <div className="form-inputs">
          <label htmlFor="slack">
            Slack <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            className="info-input"
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
          <span className="error-message" style={{ color: 'red', margin: '20px 20px' }}>
            Kindly ensure your Slack name matches your full name as entered above. If it does not,
            please go to your Slack account to update your name, then return to this form to
            continue.
          </span>
        )}
        <div className="form-inputs-slack">
          <input
            className="slack-checkbox"
            type="checkbox"
            id="sameAsName"
            checked={newVolunteer.isSlackSameAsName}
            onChange={handleSlackChange}
            required
          />

          <label style={{ color: '#2f5061', margin: '0 5px' }} htmlFor="sameAsName">
            Yes, my Slack handle is my first and last name <span style={{ color: 'red' }}>*</span>
          </label>
        </div>

        <span className="error-message" style={{ color: '#2e5163', margin: '20px 20px' }}>
          <strong>NOTE:</strong> Your name and email need to match what is on your DropBox and
          Google Doc. Please edit them on your Profile Page if they don’t.{' '}
        </span>

        <div className="button-container">
          <button type="button" className="hgn-return-button" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="next-button">
            Next
          </button>
        </div>
      </form>
    </div>
  ) : <div>
      <Spinner color="primary" className="spinner-hgnform" style={{top : "80%"}}/>;
  </div>;
}

export default InfoForm;
