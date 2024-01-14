import React from 'react';
import './BlueSquare.css';
import hasPermission from 'utils/permissions';
import { connect } from 'react-redux';
import { formatDate } from 'utils/formatDate';
import { formatDateFromDescriptionString } from 'utils/formatDateFromDescriptionString';

const BlueSquare = (props) => {
  const isInfringementAuthorizer = props.hasPermission('infringementAuthorizer');
  const canDeleteBuleSquare = props.hasPermission('deleteInfringements');
  const { blueSquares, handleBlueSquare } = props;

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
                    } else if (isInfringementAuthorizer && canDeleteBuleSquare) {
                      handleBlueSquare(
                        isInfringementAuthorizer,
                        'modBlueSquare',
                        blueSquare._id,
                      );
                    } else if (isInfringementAuthorizer) {
                      handleBlueSquare(
                        isInfringementAuthorizer,
                        'editBlueSquare',
                        blueSquare._id,
                      );
                    } else if (canDeleteBuleSquare) {
                      handleBlueSquare(
                        canDeleteBuleSquare,
                        'deleteBlueSquare',
                        blueSquare._id,
                      );
                    } else {
                      handleBlueSquare(
                        !isInfringementAuthorizer,
                        'viewBlueSquare',
                        blueSquare._id,
                      );
                    }
                  }}
                >
                  <div className="report" data-testid="report">
                    <div className="title">{formatDate(blueSquare.date)}</div>
                    {blueSquare.description !== undefined && 
                      <div className="summary">{formatDateFromDescriptionString(blueSquare.description)}</div>
                    }
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
