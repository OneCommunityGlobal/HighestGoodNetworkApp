/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import cn from 'classnames';
import styles from './NotFoundPage.module.css';
import NotFoundImage from '../../assets/images/404Image1.png';
import NotFoundDarkImage from '../../assets/images/404ImageDarkMode1.png';

function NotFoundPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const location = useLocation();

  const isPrAnalytics = location.pathname.startsWith('/pr-dashboard');

  return (
    <div
      className={cn(styles.notFoundContainer, darkMode ? cn(styles.darkMode, styles.bgBlack) : '')}
    >
      <img
        className={styles.notFoundImage}
        src={darkMode ? NotFoundDarkImage : NotFoundImage}
        alt="Page Not Found"
      />
      <div className={styles.notFoundText}>
        {isPrAnalytics ? (
          <>
            <h1>PR ANALYTICS UNAVAILABLE</h1>
            <p>PR Analytics is temporarily unavailable.</p>
            <p>Please try again later or contact an administrator.</p>

            <p>
              <Link to="/reports" className={styles.backHomeLink}>
                Go to Reports Dashboard
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1>PAGE NOT FOUND</h1>
            <p>The rabbits have been nibbling the cables again...</p>
            <p>
              Maybe this will help{' '}
              <Link to="/" className={styles.backHomeLink}>
                Home
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default NotFoundPage;
