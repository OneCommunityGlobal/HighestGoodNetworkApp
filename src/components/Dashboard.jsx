import React from 'react';
import Leaderboard from './Leaderboard'
import '../App.css';

const Dashboard = () => {
    return (
        <React.Fragment>
                <div className="m-5 dashboard">
                <div className="col-4">
                <Leaderboard />
                </div>
                
                {/* <Badges/>
                <MonthlyEffort/>                 */}
                </div>

            </React.Fragment>
      );
}
 
export default Dashboard;
