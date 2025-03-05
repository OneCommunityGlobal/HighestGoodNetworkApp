import { useParams, Link } from 'react-router-dom';
import './FollowUpEmailTemplate.css';
import { FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';
import companyLogo from '../../../assets/images/logo2.png';

function FollowUpEmailTemplate() {
  const { email } = useParams() || { email: '' };

  return (
    <div className="email-template-container">
      {/* Company Logo */}
      <img src={companyLogo} alt="One Community Logo" className="email-logo" />

      <h2>Hi {email || '[Name]'},</h2>
      <p>
        We hope you enjoyed our recent event. Your feedback is valuable to us as we strive to
        improve our future events.
      </p>

      <p>
        Please take a moment to share your thoughts:
        <br />
        <Link
          to={`/communityportal/activities/FeedbackForm/${email || 'no-email'}`}
          className="feedback-link"
        >
          Survey Form
        </Link>
      </p>

      <p>If you’d like to:</p>
      <ul>
        <li>
          Reschedule: <a href="https://www.onecommunityevents.org/reschedule">Reschedule Link</a>
        </li>
        <li>
          Register for alternative events:{' '}
          <a href="https://www.onecommunityevents.org/alternative-events">Alternative Events</a>
        </li>
      </ul>

      <p>Best regards,</p>
      <p>One Community Team</p>
      <p>Primary Email: jae@onecommunityglobal.org</p>
      <p>Google Email: onecommunityglobal@gmail.com</p>
      <p>Timezone: Los Angeles, CA - Pacific Time</p>

      {/* Horizontal Line */}
      <hr className="email-divider" />

      {/* Social Media Icons */}
      <div className="social-icons">
        <a
          href="https://www.linkedin.com/company/one-community-global/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <FaLinkedin className="social-icon linkedin" />
        </a>

        <a
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram className="social-icon instagram" />
        </a>

        <a
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <FaFacebook className="social-icon facebook" />
        </a>
      </div>

      {/* Horizontal Line */}
      <hr className="email-divider" />

      <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
        Jae M.Sabol <br /> Executive Director - One Community <br />
        &quot;Open Source Sustainability for The Highest Good of All&quot;
      </p>

      <p style={{ fontSize: '12px', textAlign: 'center', color: '#888' }}>
        You are receiving this mail because you registered to join the One Community Global platform
        as a user or a creator. This also shows that you agree to our Terms of Use and Privacy
        Policies. If you no longer want to receive mails from us, click the unsubscribe link below.
      </p>

      <div className="footer-links-container">
        <p className="footer-links">
          <button type="button" className="footer-link">
            Privacy Policy
          </button>
          |
          <button type="button" className="footer-link">
            Terms of Service
          </button>
          |
          <button type="button" className="footer-link">
            Help Center
          </button>
          |
          <button type="button" className="footer-link">
            Unsubscribe
          </button>
        </p>
      </div>
    </div>
  );
}

export default FollowUpEmailTemplate;
