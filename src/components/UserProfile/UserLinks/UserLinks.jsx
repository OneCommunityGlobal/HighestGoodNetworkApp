import React from 'react';
import { CardText, Badge, Tooltip } from 'reactstrap';
import styles from './UserLinks.css';
import styleProfile from '../UserProfile.css';


const UserLinks = ({
  // eslint-disable-next-line react/prop-types
  links = [],
}) => (
  <>
    <div className="linkContainer">
      {!links.length && (
      <CardText className="linkContainer">
        <Badge color="danger">No Links present</Badge>
      </CardText>
      )}

      {links.map((item, index) => (
        <Badge key={index} className="profileEditButton" href={item.Link} color="success">
          {item.Name}
        </Badge>
      ))}
    </div>
  </>
);

export default UserLinks;
