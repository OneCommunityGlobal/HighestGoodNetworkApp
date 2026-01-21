import { useParams, Link } from 'react-router-dom';
import styles from './FollowUpEmailTemplate.module.css';
import { FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';
import companyLogo from '../../../assets/images/logo2.png';

function FollowUpEmailTemplate() {
  const { eventId = 1234, email = '' } = useParams(); // || { email: '' };
  const eventName = '[Event Name]';
  const eventDate = '[Event Date]';

  const subject =
    eventName !== '[Event Name]' ? `Help us improve: ${eventName}` : 'Help Us Improve Our Events';
  const previewText = 'Tell us what you thought — takes less than 2 minutes.';
  return (
    <div className={styles.emailTemplateContainer}>
      {/* Subject (for template clarity / preview) */}
      <p className={styles.subjectLine}>
        <strong>Subject:</strong> {subject}
      </p>

      {/* Preheader / preview text (email clients show this) */}
      <span className={styles.preheader}>{previewText}</span>

      {/* Company Logo */}
      <img src={companyLogo} alt="One Community Logo" className={styles.emailLogo} />

      <h2>Hi {email || '[Name]'},</h2>
      <p>
        Thanks for attending <strong>{eventName}</strong> on <strong>{eventDate}</strong>. Your
        feedback helps us improve future events and make them more valuable for you.
      </p>

      <p className={styles.ctaIntro}>Please take a moment to share your thoughts:</p>
      <Link
        to={`/communityportal/activities/FeedbackForm/${eventId}/${email || 'no-email'}`}
        className={styles.primaryCta}
      >
        Complete Survey
      </Link>
      <p className={styles.ctaSubtext}>Takes less than 2 minutes.</p>

      <div className={styles.otherOptions}>
        <p className={styles.otherOptionsTitle}>Other options</p>
        <ul className={styles.otherOptionsList}>
          <li>
            <a
              className={styles.secondaryLink}
              href="https://www.onecommunityevents.org/reschedule"
              target="_blank"
              rel="noopener noreferrer"
            >
              Reschedule
            </a>
          </li>
          <li>
            <a
              className={styles.secondaryLink}
              href="https://www.onecommunityevents.org/alternative-events"
              target="_blank"
              rel="noopener noreferrer"
            >
              Browse alternative events
            </a>
          </li>
        </ul>
      </div>

      <p>Best regards,</p>
      <p>One Community Team</p>
      <p>Primary Email: jae@onecommunityglobal.org</p>
      <p>Google Email: onecommunityglobal@gmail.com</p>
      <p>Timezone: Los Angeles, CA - Pacific Time</p>

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
          <FaLinkedin className={`${styles.socialIcon} ${styles.socialIconLinkedin}`} />
        </a>

        <a
          href="https://www.instagram.com/onecommunityglobal/?hl=en"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram className={`${styles.socialIcon} ${styles.socialIconInstagram}`} />
        </a>

        <a
          href="https://www.facebook.com/groups/forthehighestgoodofall/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <FaFacebook className={`${styles.socialIcon} ${styles.socialIconFacebook}`} />
        </a>
      </div>

      {/* Horizontal Line */}
      <hr className={styles.emailDivider} />

      <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
        Jae M.Sabol <br /> Executive Director - One Community <br />
        &quot;Open Source Sustainability for The Highest Good of All&quot;
      </p>

      <p style={{ fontSize: '12px', textAlign: 'center', color: '#888' }}>
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
