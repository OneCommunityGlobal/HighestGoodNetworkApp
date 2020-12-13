import React from 'react';
import { CardText, Badge, Tooltip } from 'reactstrap';
import { Link } from 'react-router-dom';
import styles from './UserLinks.css';
// import styleProfile from '../UserProfile.module.scss';


const UserLinks = ({
  // eslint-disable-next-line react/prop-types
  links = [],
}) => (
  <>
    <div className="linkContainer">
      {/* {!links.length && (
      <CardText className="linkContainer">
        <Badge color="danger">No Links present</Badge>
      </CardText>
      )} */}

      {links.map((item, index) => {
        if (item.Link.includes('http')) {
          return (
            <React.Fragment key={item.link}>
              <a key={item.link} href={item.Link}>
                {item.Name.toUpperCase()}
              </a>
              <br />
            </React.Fragment>

          );
        }
        return (
          <React.Fragment key={item.link}>
            <Link key={item.link} to={item.Link}>
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
