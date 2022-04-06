import React from 'react';
import './BlueSquare.css';

const BlueSquare = ({ blueSquares, handleBlueSquare, isUserAdmin }) => {
  return (
    <div className="blueSquareContainer">
      <div className="blueSquares">
        {blueSquares.map((blueSquare, index) => (
          <div
            key={index}
            role="button"
            id="wrapper"
            data-testid="blueSquare"
            className="blueSquareButton"
            onClick={() => {
              if (!blueSquare._id) {
                handleBlueSquare(isUserAdmin, 'message', 'none');
              } else if (isUserAdmin) {
                handleBlueSquare(isUserAdmin, 'modBlueSquare', blueSquare._id);
              } else {
                handleBlueSquare(!isUserAdmin, 'viewBlueSquare', blueSquare._id);
              }
            }}
          >
            <div className="report" data-testid="report">
              <div className="title">{blueSquare.date}</div>
              <div className="summary">{blueSquare.description}</div>
            </div>
          </div>
        ))}
      </div>

      {isUserAdmin && (
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
