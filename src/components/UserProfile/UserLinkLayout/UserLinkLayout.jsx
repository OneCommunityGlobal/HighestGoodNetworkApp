import React from 'react';
import UserLinks from '../UserLinks';
import LinkModButton from '../UserProfileEdit/LinkModButton';

function UserLinkLayout(props) {
  const { userProfile, updateLink, handleLinkModel, handleSubmit, darkMode } = props;

  const { adminLinks, personalLinks } = userProfile;

  return (
    <div data-testid="user-link">
      <p
        className={darkMode ? 'text-light' : ''}
        style={{ display: 'inline-block', marginRight: 10 }}
      >
        LINKS{' '}
      </p>
      {props.canEdit ? (
        <LinkModButton
          userProfile={userProfile}
          updateLink={updateLink}
          role={props.role}
          handleSubmit={handleSubmit}
          color={darkMode ? 'white' : ''}
        />
      ) : null}
      <UserLinks linkSection="user" links={personalLinks} handleLinkModel={handleLinkModel} />
      <UserLinks linkSection="user" links={adminLinks} handleLinkModel={handleLinkModel} />
    </div>
  );
}

export default UserLinkLayout;
