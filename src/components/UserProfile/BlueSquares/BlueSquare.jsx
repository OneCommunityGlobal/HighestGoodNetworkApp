import React, {useState} from 'react'
import {
	Badge,
	Container
} from 'reactstrap'
import styles from './blueSquare.css';



const BlueSquare = ({
  blueSquares = [],
	blueSquareAccessible,
	handleUserProfile,
	props
}) => {

	return (
    <div style={{ width: '140px', height: 30, display: 'flex', flexFlow: 'wrap', alignItems: 'center'}}>

      {blueSquares.map((current, index) => (
				<div key={index} id='wrapper' class='blueSquareButton'> 
						<div class='report'> 
							<div class='title'>
								{current.date}
							</div>
							<div class='summary'>
								{current.description}
							</div>
						</div>
				</div>
      ))}

    </div>
	)

}




export default BlueSquare

