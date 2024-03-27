function QuickSetupCodes({ titles, setShowAssignModal, setTitleOnClick }) {
  return (
    <div className="blueSquares mt-3">
      {titles.map((title) => (
        <div
          key={title._id}
          role="button"
          id="wrapper"
          className="role-button bg-warning"
          onClick={() => {
            setShowAssignModal(true);
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
  );
}

export default QuickSetupCodes;
