/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import cn from 'classnames';
import styles from './NotFoundPage.module.css';
import NotFoundImage from '../../assets/images/404Image1.png';
import NotFoundDarkImage from '../../assets/images/404ImageDarkMode1.png';

function NotFoundPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();

  const handleReportClick = () => {
    history.push('/dashboard?reportModal=true');
  };

  return (
    <div className={cn(styles.notFoundContainer, darkMode ? cn(
      styles.darkMode, styles.bgBlack
    ) : '')}>
      <img
        className={styles.notFoundImage}
        src={darkMode ? NotFoundDarkImage : NotFoundImage}
        alt="Page Not Found"
      />
      <div className={styles.notFoundText}>
        <h1>PAGE NOT FOUND</h1>
        <p>The rabbits have been nibbling the cables again...</p>
        <p>
          Maybe this will help{' '}
          <Link to="/" className={styles.backHomeLink}>
            Home
          </Link>
        </p>
        <p>
          Report the issue at{' '}
          <button
            type="button"
            onClick={handleReportClick}
            className={styles.backHomeLink} // reuse Home link style for consistency
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
            here
          </button>
        </p>
      </div>
    </div>
  );
}

export default NotFoundPage;
