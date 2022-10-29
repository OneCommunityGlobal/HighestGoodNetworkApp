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
    roles,
    userPermissions,
    canEdit,
  } = props;

  const { privacySettings } = userProfile;

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
          blueSquares={userProfile?.infringments || userProfile?.infringements}
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
            blueSquares={userProfile?.infringments || userProfile?.infringments}
            handleBlueSquare={handleBlueSquare}
            role={role}
          />
        </div>
      )}
    </div>
  );
};

export default BlueSquareLayout;
