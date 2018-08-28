import React from 'react';
import {Route, IndexRoute } from 'react-router';
import App from './components/App';
import LoginPage from './components/Login/LoginPage';
import DashboardPage from './components/Dashboard/DashboardPage';
import UserManagementPage from './components/UserManagement/UserManagementPage';



export default (
    <Route path="/" component={App}>
        <Route path="Login" component={LoginPage} />
        <Route path="Dashboard" component={DashboardPage} />
        {/* <Route path="Timelog" component={TimelogPage}/>
        <Route path="Reports" component={ReportsPage}/>  */}
        <Route path="UserManagement" component={UserManagementPage}/> 
    </Route>
);