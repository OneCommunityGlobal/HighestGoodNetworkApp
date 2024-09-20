function QuickSetupCodes({ titles, setShowAssignModal, setTitleOnClick, setShowAddTitle,editMode,assignMode, setSortBy}) {

  const groupedTitles = titles.reduce((acc, title) => {
    if (!acc[title.teamCode]) {
      acc[title.teamCode] = [];
    }
    acc[title.teamCode].push(title);
    return acc;
  }, {});

  
  return (
    <div className="blueSquares mt-3" id="qsc-outer-wrapper">
      {editMode ? (
        Object.keys(groupedTitles).map((teamCode) => (
          <div className = "group-titles" key={teamCode}>
            <p className="team-code-title">{teamCode}: </p>
            {groupedTitles[teamCode].map((title) => (
              <div
                key={title._id}
                role="button"
                id="wrapper"
                className="role-button bg-warning"
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
                {title?.shortName}
                <div className="title">
                  <span className="setup-title-name">{title?.titleName}</span>
                </div>
              </div>
            ))}
            
          </div>
        ))
        
      ) : (
        titles.map((title) => (
          <div
            key={title._id}
            role="button"
            id="wrapper"
            className="role-button bg-warning"
            onClick={() => {
              if (assignMode) {
                setShowAssignModal(true);
              }
              setTitleOnClick(title);
            }}
            value={title.titleName}
          >
            {title?.shortName}
            <div className="title">
              <span className="setup-title-name">{title?.titleName}</span>
            </div>
          </div>
        ))
      )}

      
    </div>
  );
}

export default QuickSetupCodes;

