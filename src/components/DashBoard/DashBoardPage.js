import React, { Component } from 'react';
import { Card, Row, CardTitle, CardText, Col } from 'reactstrap';

class DashBoardPage extends Component {
    render() {
        return (
        <div>
            <Row>
            <Col sm={{offset:1,size:7}}>
              <Card body inverse style={{ backgroundColor: '#333', borderColor: '#333' }}>
                <CardTitle>LeaderBoard</CardTitle>
                <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
              </Card>
            </Col>
            <Col sm={{size:3}}>
              <Card body inverse color="info">
                <CardTitle>Monthly Effort</CardTitle>
                <CardText>Monthly Chart PlaceHolder</CardText>        
              </Card>
            </Col>
          </Row>
          <Row style={{marginTop:'20px'}}>
            <Col sm={{offset:1,size:7}}>
                <Card body inverse color="warning">
                    <CardTitle>Badges</CardTitle>
                    <CardText>PlaceHolder for Badges</CardText>
                </Card>
            </Col>
          </Row>   
        </div>
        );
    }
}

export default DashBoardPage;