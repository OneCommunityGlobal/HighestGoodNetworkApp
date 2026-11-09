import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import cn from 'classnames';
import styles from './NotFoundPage.module.css';
import NotFoundImage from '../../assets/images/404Image1.png';
import NotFoundDarkImage from '../../assets/images/404ImageDarkMode1.png';

function NotFoundPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const location = useLocation();

  const isPrAnalytics = location.pathname.startsWith('/pr-dashboard');
  const textClass = darkMode ? styles.textDark : styles.textLight;
  const linkClass = cn(styles.backHomeLink, darkMode && styles.linkDark);

  const flagSuggestionsModal = () => {
    localStorage.setItem('openSuggestionsModal', 'true');
  };

  const renderMessage = () => {
    if (isPrAnalytics) {
      return (
        <>
          <h1 className={textClass}>PR ANALYTICS UNAVAILABLE</h1>
          <p className={textClass}>PR Analytics is temporarily unavailable.</p>
          <p className={textClass}>Please try again later or contact an administrator.</p>
          <p>
            <Link to="/reports" className={linkClass}>
              Go to Reports Dashboard
            </Link>
          </p>
        </>
      );
    }

    if (isAuthenticated) {
      return (
        <>
          <h1 className={textClass}>PAGE NOT FOUND</h1>
          <p className={textClass}>The rabbits have been nibbling the cables again...</p>
          <p className={textClass}>
            Maybe this will help{' '}
            <Link to="/dashboard" className={linkClass}>
              Home
            </Link>
          </p>
          <p className={textClass}>
            Or you can report this page by clicking{' '}
            <Link to="/dashboard" className={linkClass} onClick={flagSuggestionsModal}>
              here
            </Link>
          </p>
        </>
      );
    }

    return (
      <>
        <h1 className={textClass}>PAGE NOT FOUND</h1>
        <p className={textClass}>
          It seems like you&apos;ve reached a page that doesn&apos;t exist, and you&apos;re not
          currently logged in.
        </p>
        <p className={textClass}>
          Please go back to the{' '}
          <Link to="/login" className={linkClass}>
            login page
          </Link>
        </p>
      </>
    );
  };

  return (
    <div className={cn(styles.notFoundContainer, darkMode && styles.darkMode)}>
      <div
        className={cn(styles.notFoundContent, darkMode ? styles.borderDark : styles.borderLight)}
      >
        <img
          className={styles.notFoundImage}
          src={darkMode ? NotFoundDarkImage : NotFoundImage}
          alt="Page Not Found"
        />
        <div className={styles.notFoundText}>{renderMessage()}</div>
      </div>
    </div>
  );
}

export default NotFoundPage;
