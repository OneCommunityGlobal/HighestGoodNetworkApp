/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './NotFoundPage.css';
import NotFoundImage from '../../assets/images/404Image1.png';
import NotFoundDarkImage from '../../assets/images/404ImageDarkMode1.png';

function NotFoundPage() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className={`not-found-container ${darkMode ? 'dark-mode bg-black' : ''}`}>
      <img
        className="not-found-image"
        src={darkMode ? NotFoundDarkImage : NotFoundImage}
        alt="Page Not Found"
      />
      <div className="not-found-text">
        <h1>PAGE NOT FOUND</h1>
        <p>The rabbits have been nibbling the cables again...</p>
        <p>
          Maybe this will help{' '}
          <Link to="/" className="back-home-link">
            Home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default NotFoundPage;
