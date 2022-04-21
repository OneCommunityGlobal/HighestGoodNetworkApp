import React from 'react';
import BlueSquare from './BlueSquares';
import ToggleSwitch from './UserProfileEdit/ToggleSwitch';
import './UserProfile.scss';
// import styleEdit from './UserProfileEdit.module.scss';
import './UserProfileEdit/UserProfileEdit.scss';
import hasPermission from 'utils/permissions';

const BlueSquareLayout = (props) => {
  const { userProfile, handleUserProfile, handleBlueSquare, isUserAdmin, isUserSelf, role } = props;

  const { privacySettings, infringments } = userProfile;

  const canEdit = hasPermission(role, 'editUserProfile') || isUserSelf;

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
          isUserAdmin={isUserAdmin}
          blueSquares={infringments}
          handleBlueSquare={handleBlueSquare}
          role={role}
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
            isUserAdmin={isUserAdmin}
            blueSquares={infringments}
            handleBlueSquare={handleBlueSquare}
            role={role}
          />
        </div>
      )}
    </div>
  );
};

export default BlueSquareLayout;
