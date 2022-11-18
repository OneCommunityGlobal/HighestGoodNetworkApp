import React from 'react';
import BlueSquare from './BlueSquares';
import ToggleSwitch from './UserProfileEdit/ToggleSwitch';
import './UserProfile.scss';
// import styleEdit from './UserProfileEdit.module.scss';
import './UserProfileEdit/UserProfileEdit.scss';

const BlueSquareLayout = props => {
<<<<<<< HEAD
  const { userProfile, handleUserProfile, handleBlueSquare, isUserSelf, role, canEdit } = props;
=======
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
>>>>>>> development

  const { privacySettings, infringements } = userProfile;

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

<<<<<<< HEAD
        <BlueSquare blueSquares={infringements} handleBlueSquare={handleBlueSquare} role={role} />
=======
        <BlueSquare
          blueSquares={infringments}
          handleBlueSquare={handleBlueSquare}
          role={role}
          roles={roles}
          userPermissions={userPermissions}
        />
>>>>>>> development
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
<<<<<<< HEAD
          <BlueSquare blueSquares={infringements} handleBlueSquare={handleBlueSquare} role={role} />
=======
          <BlueSquare
            blueSquares={infringments}
            handleBlueSquare={handleBlueSquare}
            role={role}
            roles={roles}
            userPermissions={userPermissions}
          />
>>>>>>> development
        </div>
      )}
    </div>
  );
};

export default BlueSquareLayout;
