import React from 'react';
import './BlueSquare.css';
import hasPermission from 'utils/permissions';

const BlueSquare = ({ blueSquares, handleBlueSquare, role, roles, userPermissions }) => {
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
                      handleBlueSquare(
                        hasPermission(role, 'infringementAuthorizer', roles, userPermissions),
                        'message',
                        'none',
                      );
                    } else if (
                      hasPermission(role, 'putUserProfileImportantInfo', roles, userPermissions)
                    ) {
                      handleBlueSquare(
                        hasPermission(role, 'putUserProfileImportantInfo', roles, userPermissions),
                        'modBlueSquare',
                        blueSquare._id,
                      );
                    } else {
                      handleBlueSquare(
                        !hasPermission(role, 'putUserProfileImportantInfo', roles, userPermissions),
                        'viewBlueSquare',
                        blueSquare._id,
                      );
                    }
                  }}
                >
                  <div className="report" data-testid="report">
                    <div className="title">{blueSquare.date}</div>
                    <div className="summary">{blueSquare.description}</div>
                  </div>
                </div>
              ))
          : null}
      </div>

      {(hasPermission(role, 'putUserProfile', roles, userPermissions) ||
        hasPermission(role, 'infringementAuthorizer', roles, userPermissions)) && (
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

export default BlueSquare;
