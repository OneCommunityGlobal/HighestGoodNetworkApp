import React from 'react';
import './BlueSquare.css';
import hasPermission from 'utils/permissions';

const BlueSquare = ({ blueSquares, handleBlueSquare, role, roles, userPermissions }) => {
  return (
    <div className="blueSquareContainer">
      <div className="blueSquares">
        {blueSquares ? (blueSquares.map((blueSquare, index) => (
          <div
            key={index}
            role="button"
            id="wrapper"
            data-testid="blueSquare"
            className="blueSquareButton"
            onClick={() => {
              if (!blueSquare._id) {
                handleBlueSquare(
                  hasPermission(role, 'handleBlueSquare', roles, userPermissions),
                  'message',
                  'none',
                );
              } else if (hasPermission(role, 'handleBlueSquare', roles, userPermissions)) {
                handleBlueSquare(
                  hasPermission(role, 'handleBlueSquare', roles, userPermissions),
                  'modBlueSquare',
                  blueSquare._id,
                );
              } else {
                handleBlueSquare(
                  !hasPermission(role, 'handleBlueSquare', roles, userPermissions),
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
        ))) : null}
      </div>

      {(hasPermission(role, 'editUserProfile', roles, userPermissions) ||
        hasPermission(role, 'assignOnlyBlueSquares', roles, userPermissions)) && (
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
