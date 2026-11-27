import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styles from './UserLinks.module.css';

const UserLinks = ({ links = [], darkMode }) => {
  const storeDarkMode = useSelector(state => state.theme.darkMode);
  const isDarkMode = darkMode ?? storeDarkMode;
  const linkClassName = isDarkMode ? styles.userLinkDark : '';
  return (
  <>
    <div className="linkContainer mb-3" data-testid="testLinkContainer">
      {links.map((item, index) => {
        if (item.Link.includes('http')) {
          // Render external link if it's not an empty string
          if (item.Link.trim() !== '') {
            return (
              <React.Fragment key={item.Name}>
                <a className={linkClassName} key={item.link} href={item.Link} target="_blank" rel="noreferrer" data-testid="testHyperLink">
                  {item.Name.toUpperCase()}
                </a>
                <br />
              </React.Fragment>
            );
          }
        } else {
          // Check if the link is an internal link and not an empty string
          if (item.Link.trim() !== '') {
            return (
              <React.Fragment key={item.Name}>
                <Link className={linkClassName} key={item.link} to={item.Link} target="_blank" data-testid="testLink">
                  {item.Name.toUpperCase()}
                </Link>
                <br />
              </React.Fragment>
            );
          }
        }
      })}
    </div>
  </>
)};

export default UserLinks;
