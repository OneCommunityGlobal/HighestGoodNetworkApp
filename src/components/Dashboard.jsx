import React from 'react';
<<<<<<< HEAD
import Leaderboard from '../components/Leaderboard'
//import MonthyEffort from '../MonthyEffort'
//import Badges from '../Badges'
import { Card, Row, CardTitle, CardText, Col } from 'reactstrap';
import MonthlyEffort from './MonthlyEffort';

=======
import Leaderboard from './Leaderboard'
import '../App.css';
>>>>>>> 6fe1485002f03d1271d8b36e05b74bf05fbdc622

const Dashboard = () => {
    return (
        <React.Fragment>
<<<<<<< HEAD
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
                  <div>
                    
                  </div>
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
=======
                <div className="m-5 dashboard">
                <div className="col-4">
                <Leaderboard />
                </div>
                
                {/* <Badges/>
                <MonthlyEffort/>                 */}
                </div>

            </React.Fragment>
      );
>>>>>>> 6fe1485002f03d1271d8b36e05b74bf05fbdc622
}
 
export default Dashboard;
