import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './FollowUpEmailTemplate.module.css';
import { FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';
import companyLogo from '../../../assets/images/logo2.png';

function FollowUpEmailTemplate() {
  const { eventId = 1234, email = '' } = useParams();

  // Dark mode state from Redux
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div
      className={`${styles.emailTemplateContainer} ${
        darkMode ? styles.emailTemplateContainerDark : ''
      }`}
    >
      {/* Company Logo */}
      <img src={companyLogo} alt="One Community Logo" className={styles.emailLogo} />

      <h2 className={darkMode ? styles.textLight : ''}>Hi {email || '[Name]'},</h2>

      <p className={darkMode ? styles.textLight : ''}>
        We hope you enjoyed our recent event. Your feedback is valuable to us as we strive to
        improve our future events.
      </p>

      <p className={darkMode ? styles.textLight : ''}>
        Please take a moment to share your thoughts:
        <br />
        <Link
          to={`/communityportal/activities/FeedbackForm/${eventId}/${email || 'no-email'}`}
          className={`${styles.feedbackLink} ${darkMode ? styles.feedbackLinkDark : ''}`}
        >
          Survey Form
        </Link>
      </p>

      <p className={darkMode ? styles.textLight : ''}>If you’d like to:</p>
      <ul className={`${darkMode ? styles.textLight : ''} ${darkMode ? styles.linkSoftDark : ''}`}>
        <li>
          Reschedule: <a href="https://www.onecommunityevents.org/reschedule">Reschedule Link</a>
        </li>
        <li>
          Register for alternative events:{' '}
          <a href="https://www.onecommunityevents.org/alternative-events">Alternative Events</a>
        </li>
      </ul>

      <p className={darkMode ? styles.textLight : ''}>Best regards,</p>
      <p className={darkMode ? styles.textLight : ''}>One Community Team</p>
      <p className={darkMode ? styles.textLight : ''}>Primary Email: jae@onecommunityglobal.org</p>
      <p className={darkMode ? styles.textLight : ''}>Google Email: onecommunityglobal@gmail.com</p>
      <p className={darkMode ? styles.textLight : ''}>Timezone: Los Angeles, CA - Pacific Time</p>

      {/* Divider */}
      <hr className={`${styles.emailDivider} ${darkMode ? styles.emailDividerDark : ''}`} />

      {/* Social Icons */}
      <div className={`${styles.socialIcons} ${darkMode ? styles.socialIconsDark : ''}`}>
        <a
          href="https://www.linkedin.com/company/one-community-global/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <FaLinkedin className={styles.socialIcon} />
        </a>

        <a
          href="https://www.instagram.com/onecommunityglobal/?hl=en"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram className={styles.socialIcon} />
        </a>

        <a
          href="https://www.facebook.com/groups/forthehighestgoodofall/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <FaFacebook className={styles.socialIcon} />
        </a>
      </div>

      {/* Divider */}
      <hr className={`${styles.emailDivider} ${darkMode ? styles.emailDividerDark : ''}`} />

      <p
        style={{ fontWeight: 'bold', textAlign: 'center' }}
        className={darkMode ? styles.textLight : ''}
      >
        Jae M.Sabol <br /> Executive Director - One Community <br />
        &quot;Open Source Sustainability for The Highest Good of All&quot;
      </p>

      <p
        style={{ fontSize: '12px', textAlign: 'center' }}
        className={darkMode ? styles.textLight : ''}
      >
        You are receiving this mail because you registered to join the One Community Global platform
        as a user or a creator. This also shows that you agree to our Terms of Use and Privacy
        Policies. If you no longer want to receive mails from us, click the unsubscribe link below.
      </p>

      <div className={styles.footerLinksContainer}>
        <a
          href="https://onecommunityglobal.org/terms-and-conditions/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Privacy Policy"
          className={styles.footerLinks}
        >
          Privacy Policy
        </a>
        <a
          href="https://onecommunityglobal.org/terms-and-conditions/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Terms and Conditions"
          className={styles.footerLinks}
        >
          Terms and Conditions
        </a>
        <a
          href="https://onecommunityglobal.org/contact/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact"
          className={styles.footerLinks}
        >
          Help Center
        </a>
      </div>
    </div>
  );
}

export default FollowUpEmailTemplate;
