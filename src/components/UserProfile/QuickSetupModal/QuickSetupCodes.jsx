function QuickSetupCodes({
  titles,
  setShowAssignModal,
  setTitleOnClick,
  setShowAddTitle,
  editMode,
  assignMode,
}) {
  return (
    <div className="blueSquares mt-3" id="qsc-outer-wrapper">
      {titles.map(title => (
        <div
          key={title._id}
          role="button"
          id="wrapper"
          className="role-button"
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
          {title?.titleName.substring(0, 5)}
          {/* <div className="title">
            <span className="setup-title-name">{title?.titleName}</span>
          </div> */}
        </div>
      ))}
    </div>
  );
}

export default QuickSetupCodes;
