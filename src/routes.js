import React from 'react';
import {Route} from 'react-router';
import App from './components/App';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserManagementPage from './components/UserManagement/usermanagementPage';



export default (
    <Route path="/" component={App}>
        <Route path="login" component={Login} />
        <Route path="dashboard" component={Dashboard} />
        <Route path="timelog" component={Timelog}/>
        <Route path="reports" component={Reports}/>
        <Route path="usermanagement" component={UserManagementPage}/> 
    </Route>
);