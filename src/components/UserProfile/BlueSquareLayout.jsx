import React from 'react';
import BlueSquare from './BlueSquares';
import ToggleSwitch from './UserProfileEdit/ToggleSwitch';
import './UserProfile.scss';
// import styleEdit from './UserProfileEdit.module.scss';
import './UserProfileEdit/UserProfileEdit.scss';

const BlueSquareLayout = (props) => {

  const {
    userProfile,
    setUserProfile,
    handleBlueSquare,
    isUserAdmin,
    isUserSelf,
    setChanged
  } = props;

  const { privacySettings, infringments } = userProfile;

  const canEdit = isUserAdmin || isUserSelf;
  
  if (canEdit) {
    return (
      <div data-testid="blueSqaure-field">
        <div className="blueSquare-toggle">
          <div style={{ display: 'inline-block' }}>BLUE SQUARES</div>
          {canEdit ? (
            <ToggleSwitch
              state={privacySettings?.blueSquares}
              setState={state => {
                setUserProfile({...userProfile, 
                  privacySettings: {
                    ...userProfile.privacySettings,
                    blueSquares: state
                  }
                })
                setChanged(true);
              }}
              onLabel="Public"
              offLabel="Private"
            />
          ) : null}
        </div>

        <BlueSquare
          isUserAdmin={isUserAdmin}
          blueSquares={infringments}
          handleBlueSquare={handleBlueSquare}
        />
      </div>
    );
  }
  return (
    <div>
      {!privacySettings.blueSquares ? <p>Blue Square Info is Private</p> : (
        <div>
          <p>BLUE SQAURES</p>
          <BlueSquare
            isUserAdmin={isUserAdmin}
            blueSquares={infringments}
            handleBlueSquare={handleBlueSquare}
          />
        </div>
      )}
    </div>
  );
};

export default BlueSquareLayout;
