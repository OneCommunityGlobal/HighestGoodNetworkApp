import './BlueSquare.css';
import { connect } from 'react-redux';
import hasPermission from '../../../utils/permissions';
import { formatCreatedDate, formatDate } from '../../../utils/formatDate';

function BlueSquare(props) {
  const { blueSquares, handleBlueSquare, hasPermission: checkPermission, darkMode } = props;

  const canAddInfringements = checkPermission('addInfringements');
  const canEditInfringements = checkPermission('editInfringements');
  const canDeleteInfringements = checkPermission('deleteInfringements');
  const isInfringementAuthorizer =
    canAddInfringements || canEditInfringements || canDeleteInfringements;

  const handleOnClick = blueSquare => {
    if (!blueSquare._id) {
      handleBlueSquare();
      darkMode(isInfringementAuthorizer, 'message', 'none');
    } else if (canEditInfringements || canDeleteInfringements) {
      handleBlueSquare(true, 'modBlueSquare', blueSquare._id);
    } else {
      handleBlueSquare(true, 'viewBlueSquare', blueSquare._id);
    }
  };

  return (
    <div className={`blueSquareContainer ${darkMode ? 'bg-darkmode-liblack' : ''}`}>
      <div className={`blueSquares ${blueSquares?.length ? '' : 'NoBlueSquares'}`}>
        {blueSquares?.length ? (
          blueSquares
            .sort((a, b) => (a.date > b.date ? 1 : -1))
            .map(blueSquare => (
              <div
                key={blueSquare._id}
                role="button"
                id="wrapper"
                tabIndex={0}
                data-testid="blueSquare"
                className="blueSquareButton"
                onClick={() => handleOnClick(blueSquare)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleOnClick(blueSquare);
                  }
                }}
              >
                <div className="report" data-testid="report">
                  <div className="title">{formatDate(blueSquare.date)}</div>
                  {blueSquare.description && (
                    <div className="summary">
                      {blueSquare.createdDate
                        ? `${formatCreatedDate(blueSquare.createdDate)}: `
                        : ''}
                      {blueSquare.description}
                    </div>
                  )}
                </div>
              </div>
            ))
        ) : (
          <div>No blue squares.</div>
        )}
        {canAddInfringements && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleBlueSquare(true, 'addBlueSquare', '')}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleBlueSquare(true, 'addBlueSquare', '');
              }
            }}
            className="blueSquareButton"
            color="primary"
            data-testid="addBlueSquare"
          >
            +
          </div>
        )}
      </div>
    </div>
  );
}

export default connect(null, { hasPermission })(BlueSquare);
