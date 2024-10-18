import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import BlueSquare from '../BlueSquares/BlueSquare';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import './BlueSquaresTable.css';

const BlueSquaresTable = ({ userProfile ,canEdit, isPrivate , handleUserProfile , handleBlueSquare, darkMode}) => {
  return (
    <div className="user-profile-blue-square-section">
      <div className={`user-profile-blue-square-div-header ${darkMode ? 'bg-space-cadet' : ''}`}>
        <div className="user-profile-blue-square-div-header-title">
          <div>BLUE SQUARES</div>
          <div>
            <EditableInfoModal
              areaName="blueSquares_info"
              areaTitle="Blue Squares"
              fontSize={20}
              isPermissionPage
              role={userProfile.role}
              darkMode={darkMode}
            />
          </div>
        </div>
        {canEdit && (
          <ToggleSwitch
            toggleClass="user-profile-blue-square-header-toggle"
            switchType="bluesquares"
            state={isPrivate}
            handleUserProfile={handleUserProfile}
            darkMode={darkMode}
          />
        )}
      </div>
      {canEdit ? (
        <BlueSquare blueSquares={userProfile?.infringements} handleBlueSquare={handleBlueSquare} darkMode={darkMode} userProfile={userProfile}/>
      ) : !isPrivate ? (
        <div className="pl-1">Blue Square Info is Private</div>
      ) : (
        <BlueSquare blueSquares={userProfile?.infringements} handleBlueSquare={handleBlueSquare} darkMode={darkMode} userProfile={userProfile}/>
      )}
    </div>
  );
};

export default BlueSquaresTable;
