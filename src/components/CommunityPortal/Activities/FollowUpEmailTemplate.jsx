import { useParams, Link } from 'react-router-dom';
import styles from './FollowUpEmailTemplate.module.css';
import { FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';
import companyLogo from '../../../assets/images/logo2.png';

function FollowUpEmailTemplate() {
  const { eventId = 1234, email = '' } = useParams(); // || { email: '' };
  return (
    <div className={styles.emailTemplateContainer}>
      {/* Company Logo */}
      <img src={companyLogo} alt="One Community Logo" className={styles.emailLogo} />

      <h2 className={styles.h2}>Hi {email || '[Name]'},</h2>
      <p className={styles.p}>
        We hope you enjoyed our recent event. Your feedback is valuable to us as we strive to
        improve our future events.
      </p>

      <p className={styles.p}>
        Please take a moment to share your thoughts:
        <br />
        <Link
          to={`/communityportal/activities/FeedbackForm/${eventId}/${email || 'no-email'}`}
          className={styles.feedbackLink}
        >
          Survey Form
        </Link>
      </p>

      <p className={styles.p}>If you’d like to:</p>
      <ul className={styles.ul}>
        <li>
          Reschedule: <a href="https://www.onecommunityevents.org/reschedule">Reschedule Link</a>
        </li>
        <li>
          Register for alternative events:{' '}
          <a href="https://www.onecommunityevents.org/alternative-events">Alternative Events</a>
        </li>
      </ul>

      <p className={styles.p}>Best regards,</p>
      <p className={styles.p}>One Community Team</p>
      <p className={styles.p}>Primary Email: jae@onecommunityglobal.org</p>
      <p className={styles.p}>Google Email: onecommunityglobal@gmail.com</p>
      <p className={styles.p}>Timezone: Los Angeles, CA - Pacific Time</p>

      {/* Horizontal Line */}
      <hr className={styles.emailDivider} />

      {/* Social Media Icons */}
      <div className={styles.socialIcons}>
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

      {/* Horizontal Line */}
      <hr className={styles.emailDivider} />

      <p className={styles.p} style={{ fontWeight: 'bold', textAlign: 'center' }}>
        Jae M.Sabol <br /> Executive Director - One Community <br />
        &quot;Open Source Sustainability for The Highest Good of All&quot;
      </p>

      <p className={styles.p} style={{ fontSize: '12px', textAlign: 'center', color: '#888' }}>
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
