import React from 'react';
import {getCurrentUser} from "../../services/loginService";


class MonthlyEffort extends React.Component {
    state = { };
    
  async componentDidMount() {
    let userID = getCurrentUser().userid;
    this.setState({userID});
  }
  render() {
   
    return (
        <div className="card-body text-white">
          <h5 className="card-title">Monthly Efforts</h5>
          <div>
          
          </div>
        </div>
        
    );
  }
}

export default MonthlyEffort;
