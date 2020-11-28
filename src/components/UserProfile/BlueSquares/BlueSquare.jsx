import React from 'react'
import './BlueSquare.css'

const BlueSquare = ({ blueSquares = [], handleBlueSquare, isUserAdmin }) => (
  <div className="blueSquareContainer">
    <div className="blueSquares">
      {blueSquares.map((current, index) => (
        <div
          key={index}
          role="button"
          id="wrapper"
          className="blueSquareButton"
          onClick={() => {
            if (!current._id) {
              handleBlueSquare(isUserAdmin, 'message', 'none')
            } else if (isUserAdmin) {
              handleBlueSquare(isUserAdmin, 'modBlueSquare', current._id)
            } else {
              handleBlueSquare(!isUserAdmin, 'viewBlueSquare', current._id)
            }
          }}
        >
          <div className="report" data-testid="report">
            <div className="title">{current.date}</div>
            <div className="summary">{current.description}</div>
          </div>
        </div>
      ))}
    </div>

    {isUserAdmin && (
      <div
        onClick={() => handleBlueSquare(true, 'addBlueSquare', '')}
        className="blueSquareButton"
        color="primary"
      >
        <span>+</span>
      </div>
    )}
    <br />
  </div>
)

export default BlueSquare
