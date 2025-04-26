import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function UserLinks({ links = [] }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <div className="linkContainer mb-3" data-testid="testLinkContainer">
      {links.map(item => {
        if (item.Link.includes('http')) {
          // Render external link if it's not an empty string
          if (item.Link.trim() !== '') {
            return (
              <React.Fragment key={item.Name}>
                <a
                  className={darkMode ? 'text-light' : ''}
                  key={item.link}
                  href={item.Link}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="testHyperLink"
                >
                  {item.Name.toUpperCase()}
                </a>
                <br />
              </React.Fragment>
            );
          }
        } else if (item.Link.trim() !== '') {
          return (
            <React.Fragment key={item.Name}>
              <Link
                className={darkMode ? 'text-light' : ''}
                to={item.Link}
                target="_blank"
                data-testid="testLink"
              >
                {item.Name.toUpperCase()}
              </Link>
              <br />
            </React.Fragment>
          );
        }

        return null;
      })}
    </div>
  );
}

export default UserLinks;
