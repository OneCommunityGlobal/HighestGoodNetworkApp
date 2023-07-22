import React from 'react';
import { Link } from 'react-router-dom';

const UserLinks = ({ links = [] }) => (
  <>
    <div className="linkContainer">
      {links.map((item, index) => {
        if (item.Link.includes('http')) {
          return (
            <React.Fragment key={item.Name}>
              <a key={item.link} href={item.Link} target="_blank" rel="noreferrer">
                {item.Name.toUpperCase()}
              </a>
              <br />
            </React.Fragment>
          );
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
