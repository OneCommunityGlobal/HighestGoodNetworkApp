import { useSelector } from 'react-redux';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import companyLogo from '../../../assets/images/logo2.png';
import styles from './FollowUpEmailTemplate.module.css';

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
      <p className={styles.previewLine}>
        <strong>Preview:</strong> {previewText}
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

      <p className={styles.p}>Best regards,</p>
      <p className={styles.p}>One Community Team</p>
      <p className={styles.p}>Primary Email: jae@onecommunityglobal.org</p>
      <p className={styles.p}>Google Email: onecommunityglobal@gmail.com</p>
      <p className={styles.p}>Timezone: Los Angeles, CA - Pacific Time</p>

      <hr className={styles.emailDivider} />

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

      <hr className={styles.emailDivider} />

      <p style={{ fontWeight: 'bold', textAlign: 'center' }} className={styles.p}>
        Jae M.Sabol <br /> Executive Director - One Community <br />
        &quot;Open Source Sustainability for The Highest Good of All&quot;
      </p>

      <p style={{ fontSize: '12px', textAlign: 'center' }} className={styles.p}>
        You are receiving this mail because you registered to join the One Community Global platform
        as a user or a creator. This also shows that you agree to our Terms of Use and Privacy
        Policies. If you no longer want to receive mails from us, click the unsubscribe link below.
      </p>
      <p style={{ textAlign: 'center', fontSize: '12px', marginTop: '6px' }}>
        <a
          href="https://onecommunityglobal.org/unsubscribe"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerLinks}
        >
          Unsubscribe
        </a>
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
