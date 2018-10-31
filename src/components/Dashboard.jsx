import React from 'react';
import Leaderboard from './Leaderboard'

const Dashboard = () => {
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
 
export default Dashboard;