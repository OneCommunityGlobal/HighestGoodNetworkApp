import React from 'react';
import { Card, Row, CardTitle, CardText, Col } from 'reactstrap';
import MonthlyEffort from './MonthlyEffort';
import Leaderboard from './Leaderboard'
import '../App.css';

const Dashboard = () => {
    return (
        <React.Fragment>
        <div>
            <Row>
            <Col sm={{offset:1,size:7}}>
               <Leaderboard />
            </Col>
            <Col sm={{size:3}}>
              <Card body inverse color="info">
                <CardTitle>
                  <MonthlyEffort />
                </CardTitle> 
                <CardText>
                          </CardText>
              </Card>
            </Col>
          </Row>
          <Row style={{marginTop:'20px'}}>
            <Col sm={{offset:1,size:7}}>
                <Card body inverse color="warning">
                    <CardTitle>Badges</CardTitle>
                </Card>
            </Col>
          </Row>   
        </div>
              
        </React.Fragment>
    );
}
 
export default Dashboard;
