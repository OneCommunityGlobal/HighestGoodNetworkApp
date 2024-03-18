import './BlueSquare.css';
import hasPermission from 'utils/permissions';
import { connect } from 'react-redux';
import { formatCreatedDate, formatDate } from 'utils/formatDate';
import { permissions } from 'utils/constants';

const BlueSquare = props => {

  const isInfringementAuthorizer = props.hasPermission(permissions.infringementAuthorizer);
  const canPutUserProfileImportantInfo = props.hasPermission(permissions.userManagement.putUserProfileImportantInfo);
  const { blueSquares, handleBlueSquare} = props;

  return (
    <div className="blueSquareContainer">
      <div className="blueSquares">
        {blueSquares
          ? blueSquares
              .sort((a, b) => (a.date > b.date ? 1 : -1))
              .map((blueSquare, index) => (
                <div
                  key={index}
                  role="button"
                  id="wrapper"
                  data-testid="blueSquare"
                  className="blueSquareButton"
                  onClick={() => {
                    if (!blueSquare._id) {
                      handleBlueSquare(isInfringementAuthorizer, 'message', 'none');
                    } else if (canPutUserProfileImportantInfo) {
                      handleBlueSquare(
                        canPutUserProfileImportantInfo,
                        'modBlueSquare',
                        blueSquare._id,
                      );
                    } else {
                      handleBlueSquare(
                        !canPutUserProfileImportantInfo,
                        'viewBlueSquare',
                        blueSquare._id,
                      );
                    }
                  }}
                >
                  <div className="report" data-testid="report">
                    <div className="title">{formatDate(blueSquare.date)}</div>
                    {blueSquare.description !== undefined && (
                      <div className="summary">
                        {blueSquare.createdDate !== undefined
                          ? `${formatCreatedDate(blueSquare.createdDate)}: ${blueSquare.description}`
                          : blueSquare.description}
                      </div>
                    )}
                  </div>
                </div>
              ))
          : null}
      </div>
      {isInfringementAuthorizer && (
        <div
          onClick={() => {
            handleBlueSquare(true, 'addBlueSquare', '');
          }}
          className="blueSquareButton"
          color="primary"
          data-testid="addBlueSquare"
        >
          +
        </div>
      )}
      <br />
    </div>
  );
};

export default connect(null, { hasPermission })(BlueSquare);
