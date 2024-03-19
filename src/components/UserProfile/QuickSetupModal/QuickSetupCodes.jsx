function QuickSetupCodes({ titles, setAssignPopup, setTitleOnClick }) {
  return (
    <div className="blueSquares mt-3">
      {titles.map((title) => (
        <div
          key={title._id}
          role="button"
          id="wrapper"
          className="role-button bg-warning"
          onClick={() => {
            setAssignPopup(true);
            setTitleOnClick(title);
          }}
          value={title.titleName}
        >
          {title?.shortName}
          <div className="title">
            <div className="summary">{title?.titleName}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default QuickSetupCodes;
