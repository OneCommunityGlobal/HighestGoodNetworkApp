import React from 'react'

import { Card, CardTitle, CardText, Badge, Button, CardBody } from 'reactstrap'


const UserLinks = ({
	linkSection,
	linkSectionName,
	links = [],
	handleModelState,
	isUserAdmin,
	canEditFields,
	removeLink,
}) => {


	return(
			<Card body>
				<CardTitle style={{ fontWeight: 'bold', fontSize: 20 }}>
				{linkSectionName} Links :
			</CardTitle>

			<CardBody>
				{!links.length && (
					<CardText>
						<Badge color='danger'>No Links present</Badge>
					</CardText>
				)}

				{links.map((item, index) => (

					<CardText
						key={index}
						style={{
							fontSize: 20,
							justifyContent: 'space-between',
							display: 'flex',
							paddingLeft: 10,
							paddingRight: 10
						}}>

						{ (linkSection === 'admin') && isUserAdmin && (
							<button 
								type="button" 
								className="close"
								aria-label="Close" 
								style={{paddingRight:2 }}
								onClick={() => removeLink(linkSection, item)}>				
									<span aria-hidden="true">&times;</span>
							</button>
						)}

						{ (linkSection === 'user') && canEditFields && (
							<button 
							type="button" 
							className="close"
							aria-label="Close" 
							style={{paddingRight:2 }}
							onClick={() => removeLink(linkSection, item)}>				
								<span aria-hidden="true">&times;</span>
							</button>
						)}

						<Badge style={{ width: '25vw', marginRight: '2vw', overflow: 'hidden', textOverflow: 'ellipsis' }} color='secondary'>
							{item.Name}
						</Badge>

						<Badge style={{ width: '30vw', overflow: 'hidden', textOverflow: 'ellipsis' }} href={item.Link} color='warning'>
							{item.Link}
						</Badge>

					</CardText>
					))}

			</CardBody>
			
			{ (linkSection === 'admin') && isUserAdmin && (
				<Button
				outline
				color='primary'
				onClick={() => handleModelState(true, 'input', linkSection)}>
				Add a new Link
				</Button>
			)}

			{ (linkSection === 'user') && canEditFields && (
				<Button
					outline
					color='primary'
					onClick={() => handleModelState(true, 'input', linkSection)}>
					Add a new Link
				</Button>
			)}

		</Card>
	)

}

export default UserLinks
