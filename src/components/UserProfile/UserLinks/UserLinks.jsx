import React, { Component } from 'react'

import { Card, Row, CardTitle, CardText, Col, Badge, Button, CardBody } from 'reactstrap'

const UserLinks = ({ type, adminLinks, personalLinks }) => {
	const links = type === 'Admin' ? adminLinks : personalLinks
	return (
		<Row>
			<Card body>
				<CardTitle style={{ fontWeight: 'bold', fontSize: 20 }}>{type} Links :</CardTitle>
				<CardBody>
					{!links.length && (
						<CardText>
							<Badge color='danger'>No Links present</Badge>
						</CardText>
					)}
					{links.map(item => (
						<CardText
							style={{
								fontSize: 20,
								justifyContent: 'space-between',
								display: 'flex',
								paddingLeft: 20,
								paddingRight: 20
							}}>
							<Badge style={{ width: '10vw' }} color='secondary'>
								{item.Name}
							</Badge>
							<Badge style={{ width: '40vw' }} href={item.Link} color='warning'>
								{item.Link}
							</Badge>
						</CardText>
					))}
				</CardBody>
				<Button outline color='primary' width='100px'>
					Add a new Link
				</Button>
			</Card>
		</Row>
	)
}

export default UserLinks
