import React, {Component} from 'react';
import {getUserProfile} from '../../services/profileService'
import logger from '../../services/logService'
import {getCurrentUser} from '../../services/loginService'

class ReportsPage extends Component {
    render() {
        return (
            <div>
            <div className="jumbotron">
            ReportsPage
            </div>
              <div>
              <nav class="navbar navbar-expand-md navbar-light bg-light mb-3 nav-fill">
                <li class="navbar-brand">Generate Report:</li>
              </nav>
            </div>
            </div>
        );
    }
}
export default ReportsPage;