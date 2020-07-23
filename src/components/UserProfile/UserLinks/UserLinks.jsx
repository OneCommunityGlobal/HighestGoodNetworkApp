import React from 'react'
import { CardText, Badge } from 'reactstrap'
import styles from './UserLinks.css';


const UserLinks = ({
	linkSection,
	links = [],
	handleLinkModel,
	isUserAdmin,
	canEditFields,
}) => {


	return(
		<>
			{!links.length && (
				<CardText className='linkContainer'>
					<Badge color='danger'>No Links present</Badge>
				</CardText>
			)}

			{links.map((item, index) => (
				<div key={index} className='linkContainer'>
					<Badge className='link' href={item.Link} color='success'>
						{item.Name}
					</Badge>
				</div>
			))}
		</>
	)

}

export default UserLinks