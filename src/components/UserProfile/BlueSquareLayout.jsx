import React from 'react';
import BlueSquare from './BlueSquares';
import ToggleSwitch from './UserProfileEdit/ToggleSwitch';
import './UserProfile.scss';
// import styleEdit from './UserProfileEdit.module.scss';
import './UserProfileEdit/UserProfileEdit.scss';

const BlueSquareLayout = props => {
  const {
    userProfile,
    handleUserProfile,
    handleBlueSquare,
    isUserSelf,
    role,
    canEdit,
    roles,
    userPermissions,
  } = props;

  const { privacySettings, infringments } = userProfile;

  if (canEdit) {
    return (
      <div data-testid="blueSqaure-field">
        <div className="blueSquare-toggle">
          <div style={{ display: 'inline-block' }}>BLUE SQUARES</div>
          {canEdit ? (
            <ToggleSwitch
              style={{ display: 'inline-block' }}
              switchType="bluesquares"
              state={privacySettings?.blueSquares}
              handleUserProfile={handleUserProfile}
            />
          ) : null}
        </div>

        <BlueSquare
          blueSquares={infringments}
          handleBlueSquare={handleBlueSquare}
          role={role}
          roles={roles}
          userPermissions={userPermissions}
        />
      </div>
    );
  }
  return (
    <div>
      {!privacySettings?.blueSquares ? (
        <p>Blue Square Info is Private</p>
      ) : (
        <div>
          <p>BLUE SQUARES</p>
          <BlueSquare
            blueSquares={infringments}
            handleBlueSquare={handleBlueSquare}
            role={role}
            roles={roles}
            userPermissions={userPermissions}
          />
        </div>
      )}
    </div>
  );
};

export default BlueSquareLayout;
