import React from 'react';
import { Link } from 'react-router-dom';

const UserLinks = ({
  // eslint-disable-next-line react/prop-types
  links = [],
}) => (
  <>
    <div className="linkContainer">
      {links.map((item, index) => {
        if (item.Link.includes('http')) {
          // Check if it's a Google Doc link
          if (item.Link.includes('docs.google.com')) {
            return (
              <React.Fragment key={item.Name}>
                <a key={item.link} href={item.Link} target="_blank" rel="noopener noreferrer">
                  {item.Name.toUpperCase()}
                </a>
                <br />
              </React.Fragment>
            );
            }
          // Check if it's a Dropbox link
          else if (item.Link.includes('dropbox.com')) {
            return (
              <React.Fragment key={item.Name}>
                <a key={item.link} href={item.Link} target="_blank" rel="noopener noreferrer">
                  {item.Name.toUpperCase()} 
                </a>
                <br />
              </React.Fragment>
            );
          }
        }
        return (
          <React.Fragment key={item.Name}>
            <Link key={item.link} to={item.Link} target="_blank">
              {item.Name.toUpperCase()}
            </Link>
            <br />
          </React.Fragment>
        );
      })}
    </div>
  </>
);

export default UserLinks;
