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
							<Badge color='red'>No Links present</Badge>
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
							<Badge color='secondary'>{item.Name}</Badge>
							<span>{item.Link}</span>
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
