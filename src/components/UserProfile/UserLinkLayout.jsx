import React from 'react';
import UserLinks from './UserLinks';
import LinkModButton from './UserProfileEdit/LinkModButton';
import hasPermission from 'utils/permissions';

const UserLinkLayout = (props) => {
  const { isUserSelf, userProfile, updateLink, handleLinkModel, setChanged, role } = props;

  const { adminLinks, personalLinks } = userProfile;

  const canEdit = hasPermission(role, 'editUserProfile') || isUserSelf;

  return (
    <div data-testid="user-link">
      <p style={{ display: 'inline-block', marginRight: 10 }}>LINKS </p>
      {canEdit ? (
        <LinkModButton
          userProfile={userProfile}
          updateLink={updateLink}
          setChanged={setChanged}
          role={props.role}
        />
      ) : null}
      <UserLinks
        linkSection="user"
        links={personalLinks}
        handleLinkModel={handleLinkModel}
      />
      <UserLinks
        linkSection="user"
        links={adminLinks}
        handleLinkModel={handleLinkModel}
      />
    </div>
  );
};

export default UserLinkLayout;
