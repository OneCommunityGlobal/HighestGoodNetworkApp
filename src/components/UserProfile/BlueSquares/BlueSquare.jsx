import React, { useState } from 'react'
import {
	Badge,
	Button
} from 'reactstrap'
import styles from './blueSquare.css';



const BlueSquare = ({
	blueSquares = [],
	handleBlueSquare,
	isUserAdmin
}) => {

	return (
		<div className='blueSquareContainer'>

			<div className='blueSquares'>
				{blueSquares.map((current, index) => (
					<div
						key={index} id='wrapper'
						className='blueSquareButton'
						onClick={() => {
							if (isUserAdmin) {
								handleBlueSquare(isUserAdmin, 'modBlueSquare', current._id)
							} else {
								handleBlueSquare(!isUserAdmin, 'viewBlueSquare', current._id)
							}
						}}>

						<div className='report'>
							<div className='title'>
								{current.date}
							</div>
							<div className='summary'>
								{current.description}
							</div>
						</div>
					</div>
				))}
			</div>

			{ isUserAdmin && (
				<div
				color='primary'
				className='blueSquareButton'
				onClick={() => handleBlueSquare(true, 'addBlueSquare', '')}>
					<span>+</span>
				</div>
			)}

		</div>
	)

}




export default BlueSquare

