import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Timelog from './components/Timelog';
import Reports from './components/Reports';
import UserProfile from './components/UserProfile';
import UserProfileEdit from './components/UserProfile/UserProfileEdit';
import Dashboard from './components/Dashboard';
import { Logout } from './components/Logout/Logout';
import Login from './components/Login';
import ForcePasswordUpdate from './components/ForcePasswordUpdate';
import ProtectedRoute from './components/common/ProtectedRoute';
import UpdatePassword from './components/UpdatePassword';
import Header from './components/Header';
import Projects from './components/Projects';
import Teams from './components/Teams/Teams';
import UserManagement from './components/UserManagement';
import Members from './components/Projects/Members';
import WBS from './components/Projects/WBS';
import WBSDetail from './components/Projects/WBS/WBSDetail';
import WeeklySummariesReport from './components/WeeklySummariesReport';
import Admin from './components/Admin';
import 'react-toastify/dist/ReactToastify.css';
import { UserRole } from './utils/enums';
import ForgotPassword from './components/Login/ForgotPassword';
import PeopleReport from './components/Reports/PeopleReport';
import ProjectReport from './components/Reports/ProjectReport';
import TeamReport from './components/Reports/TeamReport';
import Inventory from './components/Inventory';
import BadgeManagement from './components/Badge/BadgeManagement';
import AutoUpdate from 'components/AutoUpdate';

export default (
  <React.Fragment>
    <Header />
    <AutoUpdate />
    <ToastContainer />
    <Switch>
      <ProtectedRoute path="/dashboard" exact component={Dashboard} />
      <ProtectedRoute path="/dashboard/:userId" exact component={Dashboard} />
      <ProtectedRoute path="/wbs/tasks/:wbsId/:projectId/:wbsName" component={WBSDetail} />
      <ProtectedRoute path="/project/members/:projectId" component={Members} />
      <ProtectedRoute path="/admin" component={Admin} />
      <ProtectedRoute path="/timelog/" exact component={Timelog} />
      <ProtectedRoute path="/timelog/:userId" exact component={Timelog} />
      <ProtectedRoute path="/reports" exact component={Reports} />
      <ProtectedRoute path="/peoplereport/:userId" component={PeopleReport} />
      <ProtectedRoute path="/projectreport/:projectId" component={ProjectReport} />
      <ProtectedRoute path="/teamreport/:teamId" component={TeamReport} />

      <ProtectedRoute
        path="/inventory/:projectId"
        component={Inventory}
        allowedRoles={[UserRole.Administrator, UserRole.Manager, UserRole.CoreTeam]}
      />
      <ProtectedRoute
        path="/inventory/:projectId/wbs/:wbsId"
        component={Inventory}
        allowedRoles={[UserRole.Administrator, UserRole.Manager, UserRole.CoreTeam]}
      />

      <ProtectedRoute
        path="/weeklysummariesreport"
        exact
        component={WeeklySummariesReport}
        allowedRoles={[UserRole.Administrator, UserRole.Manager, UserRole.CoreTeam]}
      />
      <ProtectedRoute path="/projects" exact component={Projects} />
      <ProtectedRoute path="/project/wbs/:projectId" component={WBS} />
      <ProtectedRoute path="/wbs/tasks/:wbsId/:projectId" component={WBSDetail} />
      <ProtectedRoute
        path="/usermanagement"
        exact
        component={UserManagement}
        allowedRoles={[UserRole.Administrator]}
      />
      <ProtectedRoute
        path="/badgemanagement"
        exact
        component={BadgeManagement}
        allowedRoles={[UserRole.Administrator]}
      />
      <ProtectedRoute path="/teams" exact component={Teams} />
      <ProtectedRoute path="/project/members/:projectId" component={Members} />

      <Route path="/login" component={Login} />
      <Route path="/forgotpassword" component={ForgotPassword} />
      <ProtectedRoute path="/userprofile/:userId" component={UserProfile} />
      <ProtectedRoute path="/userprofileedit/:userId" component={UserProfileEdit} />
      <ProtectedRoute path="/updatepassword/:userId" component={UpdatePassword} />
      <Route path="/Logout" component={Logout} />
      <Route path="/forcePasswordUpdate/:userId" component={ForcePasswordUpdate} />
      <ProtectedRoute path="/" exact component={Dashboard} />
    </Switch>
  </React.Fragment>
);
