import ToggleSwitch from '../UserProfileEdit/ToggleSwitch'
import BlueSquare from '../BlueSquares/BlueSquare'
import './BlueSquaresTable.css';

const BlueSquaresTable = ({ userProfile ,canEdit, isPrivate , handleUserProfile , handleBlueSquare, darkMode}) => {
  return (
    <div className="user-profile-blue-square-section">
      <div className={`user-profile-blue-square-div-header ${darkMode ? 'bg-space-cadet' : ''}`}>
        <div className="user-profile-blue-square-div-header-title">BLUE SQUARES</div>
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
        <BlueSquare blueSquares={userProfile?.infringements} handleBlueSquare={handleBlueSquare} darkMode={darkMode}/>
      ) : !isPrivate ? (
        <div className="pl-1">Blue Square Info is Private</div>
      ) : (
        <BlueSquare blueSquares={userProfile?.infringements} handleBlueSquare={handleBlueSquare} darkMode={darkMode}/>
      )}
    </div>
  );
};

export default BlueSquaresTable;
