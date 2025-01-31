import { useSelector } from 'react-redux';

function QuickSetupCodes({
  titles,
  setShowAssignModal,
  setTitleOnClick,
  setShowAddTitle,
  editMode,
  assignMode,
}) {
  const teamCodes = useSelector(state => state.teamCodes.teamCodes || []);

  return (
    <div className="blueSquares mt-3" id="qsc-outer-wrapper">
      {titles.map(title => {
        const isTeamCodeInList = teamCodes.some(code => code.value === title.teamCode);
        return (
          <div
            key={title._id}
            role="button"
            id="wrapper"
            className={`role-button ${isTeamCodeInList ? 'bg-warning' : 'bg-danger'}`}
            onClick={() => {
              if (editMode) {
                setShowAddTitle(true);
              } else if (assignMode) {
                setShowAssignModal(true);
              }
              setTitleOnClick(title);
            }}
            value={title.titleName}
          >
            {title?.titleCode ? title.titleCode : title?.titleName?.substring(0, 5)}
            <div className="title">
              <span className="setup-title-name">{title?.titleName}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default QuickSetupCodes;
