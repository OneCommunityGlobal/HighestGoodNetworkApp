import React from 'react';
import BlueSquare from './BlueSquares';
import ToggleSwitch from './UserProfileEdit/ToggleSwitch';
import './UserProfile.scss';
import './UserProfileEdit/UserProfileEdit.scss';
import { Button } from 'react-bootstrap';
import ScheduleReasonModal from './ScheduleReasonModal/ScheduleReasonModal';
import { useState } from 'react';

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
  const [show, setShow] = useState(false);
  const [reason, setReason] = useState('');

  const handleToggle = () => {
    setShow(prev => !prev);
  };

  const handleSubmit = event => {
    event.preventDefault()
  };

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
          blueSquares={userProfile?.infringements}
          handleBlueSquare={handleBlueSquare}
          role={role}
          roles={roles}
          userPermissions={userPermissions}
        />
        <div className="mt-4 w-100">
          <Button variant="primary" onClick={handleToggle} className="w-100" size="md">
            Schedule Reason
          </Button>
        </div>
        <ScheduleReasonModal
          show={show}
          handleToggle={handleToggle}
          user={userProfile}
          reason={reason}
          setReason={setReason}
          handleSubmit={handleSubmit}
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
            blueSquares={userProfile?.infringements}
            handleBlueSquare={handleBlueSquare}
            role={role}
            userPermissions={userPermissions}
            roles={roles}
          />
        </div>
      )}
    </div>
  );
};

export default BlueSquareLayout;
