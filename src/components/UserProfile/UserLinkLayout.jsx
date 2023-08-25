import React from 'react';
import UserLinks from './UserLinks';
import LinkModButton from './UserProfileEdit/LinkModButton';
import hasPermission from '../../utils/permissions';
import { useSelector } from 'react-redux';


const UserLinkLayout = props => {
  const { userProfile, updateLink, handleLinkModel, role} = props;
  const { roles } = useSelector(state => state.role);
  const userPermissions = useSelector(state => state.auth.user?.permissions?.frontPermissions);
  const canEdit = hasPermission(role, 'adminLinks', roles, userPermissions, 'editLink') || hasPermission(role, 'editUserProfile', roles, userPermissions);
  const { adminLinks, personalLinks } = userProfile;

  return (
    <div data-testid="user-link">
      <p style={{ display: 'inline-block', marginRight: 10 }}>LINKS </p>
      {canEdit ? (
        <LinkModButton userProfile={userProfile} updateLink={updateLink} isUpdated={props.isUpdated}/>
      ) : null}
      <UserLinks linkSection="user" links={personalLinks} handleLinkModel={handleLinkModel} />
      <UserLinks linkSection="user" links={adminLinks} handleLinkModel={handleLinkModel} />
    </div>
  );
};

export default UserLinkLayout;