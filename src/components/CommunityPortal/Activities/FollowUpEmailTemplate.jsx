import { useSelector } from 'react-redux';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import companyLogo from '../../../assets/images/logo2.png';
import styles from './FollowUpEmailTemplate.module.css';

function FollowUpEmailTemplate() {
  const { eventId = 1234, email = '' } = useParams();
  const darkMode = useSelector(state => state.theme.darkMode);

  const textClassName = `${styles.p} ${darkMode ? styles.textLight : ''}`;
  const dividerClassName = `${styles.emailDivider} ${darkMode ? styles.emailDividerDark : ''}`;
  const socialIconsClassName = `${styles.socialIcons} ${darkMode ? styles.socialIconsDark : ''}`;
  const listClassName = `${styles.ul} ${darkMode ? styles.textLight : ''} ${
    darkMode ? styles.linkSoftDark : ''
  }`;
  const feedbackLinkClassName = `${styles.feedbackLink} ${darkMode ? styles.feedbackLinkDark : ''}`;

  return (
    <div
      className={`${styles.emailTemplateContainer} ${
        darkMode ? styles.emailTemplateContainerDark : ''
      }`}
    >
      <img src={companyLogo} alt="One Community Logo" className={styles.emailLogo} />

      <h2 className={`${styles.h2} ${darkMode ? styles.textLight : ''}`}>
        Hi {email || '[Name]'},
      </h2>

      <p className={textClassName}>
        We hope you enjoyed our recent event. Your feedback is valuable to us as we strive to
        improve our future events.
      </p>

      <p className={textClassName}>
        Please take a moment to share your thoughts:
        <br />
        <Link
          to={`/communityportal/activities/FeedbackForm/${eventId}/${email || 'no-email'}`}
          className={feedbackLinkClassName}
        >
          Survey Form
        </Link>
      </p>

      <p className={textClassName}>If you&apos;d like to:</p>
      <ul className={listClassName}>
        <li>
          Reschedule: <a href="https://www.onecommunityevents.org/reschedule">Reschedule Link</a>
        </li>
        <li>
          Register for alternative events:{' '}
          <a href="https://www.onecommunityevents.org/alternative-events">Alternative Events</a>
        </li>
      </ul>

      <p className={textClassName}>Best regards,</p>
      <p className={textClassName}>One Community Team</p>
      <p className={textClassName}>Primary Email: jae@onecommunityglobal.org</p>
      <p className={textClassName}>Google Email: onecommunityglobal@gmail.com</p>
      <p className={textClassName}>Timezone: Los Angeles, CA - Pacific Time</p>

      <hr className={dividerClassName} />

      <div className={socialIconsClassName}>
        <a
          href="https://www.linkedin.com/company/one-community-global/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <FaLinkedin className={`${styles.socialIcon} ${styles.linkedin}`} />
        </a>

        <a
          href="https://www.instagram.com/onecommunityglobal/?hl=en"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram className={`${styles.socialIcon} ${styles.instagram}`} />
        </a>

        <a
          href="https://www.facebook.com/groups/forthehighestgoodofall/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <FaFacebook className={`${styles.socialIcon} ${styles.facebook}`} />
        </a>
      </div>

      <hr className={dividerClassName} />

      <p
        style={{ fontWeight: 'bold', textAlign: 'center' }}
        className={`${styles.p} ${darkMode ? styles.textLight : ''}`}
      >
        Jae M.Sabol <br /> Executive Director - One Community <br />
        &quot;Open Source Sustainability for The Highest Good of All&quot;
      </p>

      <p
        style={{ fontSize: '12px', textAlign: 'center' }}
        className={`${styles.p} ${darkMode ? styles.textLight : ''}`}
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
