import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import SameFolderTasks from 'components/Projects/WBS/SameFolderTasks';
import AutoUpdate from 'components/AutoUpdate';
import { TaskEditSuggestions } from 'components/TaskEditSuggestions/TaskEditSuggestions';
import { RoutePermissions } from 'utils/routePermissions';
import PermissionsManagement from 'components/PermissionsManagement/PermissionsManagement';
import UserRoleTab from 'components/PermissionsManagement/UserRoleTab';
import Timelog from './components/Timelog';
import Reports from './components/Reports';
import UserProfile from './components/UserProfile';
import UserProfileEdit from './components/UserProfile/UserProfileEdit';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import Dashboard from './components/Dashboard';
import Logout from './components/Logout/Logout';
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
import SingleTask from './components/Projects/WBS/SingleTask';
import WeeklySummariesReport from './components/WeeklySummariesReport';
import Admin from './components/Admin';
import 'react-toastify/dist/ReactToastify.css';
import { UserRole } from './utils/enums';
import ForgotPassword from './components/Login/ForgotPassword';
import { PeopleReport } from './components/Reports/PeopleReport';
import { ProjectReport } from './components/Reports/ProjectReport';
import { TeamReport } from './components/Reports/TeamReport';
import Inventory from './components/Inventory';
import BadgeManagement from './components/Badge/BadgeManagement';
import RoleInfoCollections from 'components/UserProfile/EditableModal/roleInfoModal';
import SetupProfile from 'components/SetupProfile/SetupProfile';
import AddMaterials from 'components/BMDashboard/AddMaterials';

export default (
  <>
    <Switch>
      <Route path="/ProfileInitialSetup/:token" component={SetupProfile} />
      <>
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
          <ProtectedRoute path="/peoplereport/:userId" component={PeopleReport} />
          <ProtectedRoute path="/projectreport/:projectId" component={ProjectReport} />
          <ProtectedRoute path="/teamreport/:teamId" component={TeamReport} />
          <ProtectedRoute path="/taskeditsuggestions" component={TaskEditSuggestions} />

          <ProtectedRoute
            path="/inventory/:projectId"
            component={Inventory}
            routePermissions={RoutePermissions.inventoryProject}
          />
          <ProtectedRoute
            path="/inventory/:projectId/wbs/:wbsId"
            component={Inventory}
            routePermissions={RoutePermissions.inventoryProjectWbs}
          />

          <ProtectedRoute
            path="/weeklysummariesreport"
            exact
            component={WeeklySummariesReport}
            allowedRoles={[
              UserRole.Administrator,
              UserRole.Manager,
              UserRole.CoreTeam,
              UserRole.Owner,
              UserRole.Mentor,
            ]}
            routePermissions={[RoutePermissions.weeklySummariesReport, RoutePermissions.reports]}
          />
          <ProtectedRoute
            path="/reports"
            exact
            component={Reports}
            routePermissions={RoutePermissions.reports}
          />
          <ProtectedRoute
            path="/projects"
            exact
            component={Projects}
            allowedRoles={[UserRole.Administrator, UserRole.Owner]}
            routePermissions={RoutePermissions.projects}
          />
          <ProtectedRoute
            path="/projects"
            exact
            component={Projects}
            routePermissions={RoutePermissions.projects}
          />
          <ProtectedRoute path="/project/wbs/:projectId" component={WBS} />
          <ProtectedRoute path="/wbs/tasks/:wbsId/:projectId" component={WBSDetail} />
          <ProtectedRoute path="/wbs/tasks/:taskId" component={SingleTask} />
          <ProtectedRoute path="/wbs/samefoldertasks/:taskId" component={SameFolderTasks} />
          <ProtectedRoute
            path="/usermanagement"
            exact
            component={UserManagement}
            routePermissions={RoutePermissions.userManagement}
          />
          <ProtectedRoute
            path="/badgemanagement"
            exact
            component={BadgeManagement}
            routePermissions={RoutePermissions.badgeManagement}
          />
          <ProtectedRoute
            path="/permissionsmanagement"
            exact
            component={PermissionsManagement}
            routePermissions={RoutePermissions.permissionsManagement}
          />
          <ProtectedRoute
            path="/permissionsmanagement/:userRole"
            exact
            component={UserRoleTab}
            routePermissions={RoutePermissions.permissionsManagementRole}
          />
          <ProtectedRoute
            path="/teams"
            exact
            component={Teams}
            allowedRoles={[UserRole.Administrator, UserRole.Owner]}
          />
          <ProtectedRoute
            path="/teams"
            exact
            component={Teams}
            routePermissions={RoutePermissions.teams}
          />
          <ProtectedRoute path="/project/members/:projectId" component={Members} />

          <Route path="/login" component={Login} />
          <Route path="/forgotpassword" component={ForgotPassword} />
          <ProtectedRoute path="/infoCollections" component={EditableInfoModal} />
          <ProtectedRoute path="/infoCollections" component={RoleInfoCollections} />
          <ProtectedRoute path="/userprofile/:userId" component={UserProfile} />
          <ProtectedRoute path="/userprofileedit/:userId" component={UserProfileEdit} />
          <ProtectedRoute path="/updatepassword/:userId" component={UpdatePassword} />
          <Route path="/Logout" component={Logout} />
          <Route path="/forcePasswordUpdate/:userId" component={ForcePasswordUpdate} />
          <ProtectedRoute path="/" exact component={Dashboard} />
          <Route path="/bmdashboard/addMaterials" component={AddMaterials} />
        </Switch>
      </>
    </Switch>
  </>
);
