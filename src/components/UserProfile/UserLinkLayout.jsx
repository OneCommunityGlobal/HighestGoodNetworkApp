import React from 'react';
import UserLinks from './UserLinks';
import LinkModButton from './UserProfileEdit/LinkModButton';

const UserLinkLayout = (props) => {
  const { isUserAdmin, isUserSelf, userProfile, updateLink, handleLinkModel, setChanged } = props;

  const { adminLinks, personalLinks } = userProfile;

  const canEdit = isUserAdmin || isUserSelf;

  return (
    <div data-testid="user-link">
      <p style={{ display: 'inline-block', marginRight: 10 }}>LINKS </p>
      {canEdit ? (
        <LinkModButton
          userProfile={userProfile}
          updateLink={updateLink}
          isUserAdmin={isUserAdmin}
          setChanged={setChanged}
        />
      ) : null}
      <UserLinks
        linkSection="user"
        links={personalLinks}
        handleLinkModel={handleLinkModel}
        isUserAdmin={isUserAdmin}
      />
      <UserLinks
        linkSection="user"
        links={adminLinks}
        handleLinkModel={handleLinkModel}
        isUserAdmin={isUserAdmin}
      />
    </div>
  );
};

export default UserLinkLayout;
