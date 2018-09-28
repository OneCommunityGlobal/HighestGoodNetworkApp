import React from 'react';
import {Route} from 'react-router';
import App from './components/App';
import Login from './components/Login/LoginPage';
import DashboardPage from './components/Dashboard/DashboardPage';
import UserManagementPage from './components/UserManagement/usermanagementPage';



export default (
    <Route path="/" component={App}>
        <Route path="Login" component={Login} />
        <Route path="Dashboard" component={DashboardPage} />
        <Route path="Timelog" component={TimelogPage}/>
        <Route path="Reports" component={ReportsPage}/>
        <Route path="Usermanagement" component={UserManagementPage}/> 
    </Route>
);