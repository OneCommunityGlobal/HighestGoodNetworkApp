import React from 'react'
import {
    Card,

    CardTitle,
    CardText,

    CardBody,

    Button
  } from 'reactstrap'
const Badges=()=>{

    return(    <div className='row mt-3'>
    <Card body inverse color='warning'>
      <CardTitle
        style={{
          fontWeight: 'bold',
          fontSize: 20,
          textDecoration: 'underLine'
        }}
      >
        Badges
      </CardTitle>
      <CardBody>
        <CardText>Here are your badges.</CardText>
        <Button disabled>Add a Badge</Button>
      </CardBody>
    </Card>
  </div>)
}

export default Badges