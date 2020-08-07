import React from 'react';
import { CardText, Badge, Tooltip } from 'reactstrap';
import styles from './UserLinks.css';


const UserLinks = ({
  linkSection,
  links = [],
  handleLinkModel,
  isUserAdmin,
  canEditFields,
}) => (
  <>
    <div className="linkContainer">
      {!links.length && (
      <CardText className="linkContainer">
        <Badge color="danger">No Links present</Badge>
      </CardText>
      )}

      {links.map((item, index) => (
        <Badge key={index} className="link" href={item.Link} color="success">
          {item.Name}
        </Badge>
      ))}
    </div>
  </>
);

export default UserLinks;
