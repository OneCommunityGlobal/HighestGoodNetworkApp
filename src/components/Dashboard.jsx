import React, { Component } from 'react';
import {getCurrentUser} from '../services/loginService'
import Leaderboard from './Leaderboard'


class Dashboard extends Component {
    state = {  }

    componentDidMount() {
        const loggedinuser = getCurrentUser().userid;
        this.setState({loggedinuser})
    }

    render() { 
        return ( 
            <React.Fragment>
                <div className="m-5">
                <div className="col-4">
                <Leaderboard />
                </div>
                
                {/* <Badges/>
                <MonthlyEffort/>                 */}
                </div>

            </React.Fragment>
         );
    }
}
 
export default Dashboard;