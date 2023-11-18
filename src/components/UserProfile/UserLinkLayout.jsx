import React from 'react';
import UserLinks from './UserLinks';
import LinkModButton from './UserProfileEdit/LinkModButton';

const UserLinkLayout = props => {
  const { userProfile, updateLink, handleLinkModel, handleSubmit } = props;

  const { adminLinks, personalLinks } = userProfile;

  return (
    <div data-testid="user-link">
      <p style={{ display: 'inline-block', marginRight: 10 }}>LINKS </p>
      {props.canEdit || props.canEditAdminLinks ? (
        <LinkModButton userProfile={userProfile} updateLink={updateLink} role={props.role} handleSubmit={handleSubmit} isUpdated={props.isUpdated}/>
      ) : null}
      <UserLinks linkSection="user" links={personalLinks} handleLinkModel={handleLinkModel} />
      <UserLinks linkSection="user" links={adminLinks} handleLinkModel={handleLinkModel} />
    </div>
  );
};

export default UserLinkLayout;
