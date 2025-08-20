/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import cn from 'classnames';
import styles from './NotFoundPage.module.css';
import NotFoundImage from '../../assets/images/404Image1.png';
import NotFoundDarkImage from '../../assets/images/404ImageDarkMode1.png';

function NotFoundPage() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className={cn(styles.notFoundContainer, darkMode ? cn(styles.darkMode) : '')}>
      <div
        className={styles.notFoundContent}
        //prettier-ignore
        style={{border: `2px solid ${darkMode ? `#f1f1f1` : `#333`}`}}
      >
        <img
          className={styles.notFoundImage}
          src={darkMode ? NotFoundDarkImage : NotFoundImage}
          alt="Page Not Found"
        />
        <div className={styles.notFoundText}>
          <h1 className={darkMode ? `text-light` : `text-dark`}>PAGE NOT FOUND</h1>
          <p className={darkMode ? `text-light` : `text-dark`}>
            The rabbits have been nibbling the cables again...
          </p>
          <p className={darkMode ? `text-light` : `text-dark`}>
            Maybe this will help{' '}
            <Link to="/" className={styles.backHomeLink}>
              Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
