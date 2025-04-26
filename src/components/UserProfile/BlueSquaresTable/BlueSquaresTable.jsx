import EditableInfoModal from '../EditableModal/EditableInfoModal';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import BlueSquare from '../BlueSquares/BlueSquare';
import './BlueSquaresTable.css';

function BlueSquaresTable({
  userProfile,
  canEdit,
  isPrivate,
  handleUserProfile,
  handleBlueSquare,
  darkMode,
}) {
  return (
    <div className="user-profile-blue-square-section">
      <div className={`user-profile-blue-square-div-header ${darkMode ? 'bg-space-cadet' : ''}`}>
        <div className="user-profile-blue-square-div-header-title">
          <div className="blue-squares" data-testid="blue-squares">
            BLUE SQUARES
          </div>
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
      {canEdit && (
        <BlueSquare
          blueSquares={userProfile?.infringements}
          handleBlueSquare={handleBlueSquare}
          darkMode={darkMode}
        />
      )}
      {!canEdit && !isPrivate && <div className="pl-1">Blue Square Info is Private</div>}
      {!canEdit && isPrivate && (
        <BlueSquare
          blueSquares={userProfile?.infringements}
          handleBlueSquare={handleBlueSquare}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

export default BlueSquaresTable;
