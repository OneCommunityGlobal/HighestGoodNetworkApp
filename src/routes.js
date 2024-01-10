import { lazy } from 'react';
import { Route, Switch } from 'react-router-dom';
import SetupProfile from 'components/SetupProfile/SetupProfile';
import { ToastContainer } from 'react-toastify';

// import SameFolderTasks from 'components/Projects/WBS/SameFolderTasks';
import AutoUpdate from 'components/AutoUpdate';
import { TaskEditSuggestions } from 'components/TaskEditSuggestions/TaskEditSuggestions';
import { RoutePermissions } from 'utils/routePermissions';
// import PermissionsManagement from 'components/PermissionsManagement/PermissionsManagement';
// import UserRoleTab from 'components/PermissionsManagement/UserRoleTab';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import RoleInfoCollections from 'components/UserProfile/EditableModal/roleInfoModal';

import AddEquipmentType from 'components/BMDashboard/Equipment/Add/AddEquipmentType';
import Timelog from './components/Timelog';
import LessonForm from './components/BMDashboard/Lesson/LessonForm';
// import Reports from './components/Reports';
// import UserProfile from './components/UserProfile';
import UserProfileEdit from './components/UserProfile/UserProfileEdit';
import Dashboard from './components/Dashboard';
import Logout from './components/Logout/Logout';
import Login from './components/Login';
import ForcePasswordUpdate from './components/ForcePasswordUpdate';
import ProtectedRoute from './components/common/ProtectedRoute';
import UpdatePassword from './components/UpdatePassword';
import Header from './components/Header';
// import Projects from './components/Projects';
// Teams from './components/Teams/Teams';
// import UserManagement from './components/UserManagement';
// import Members from './components/Projects/Members';
// import WBS from './components/Projects/WBS';
// import WBSDetail from './components/Projects/WBS/WBSDetail';
// import SingleTask from './components/Projects/WBS/SingleTask';
// import WeeklySummariesReport from './components/WeeklySummariesReport';
import TeamLocations from './components/TeamLocations';
import Admin from './components/Admin';
import 'react-toastify/dist/ReactToastify.css';
import { UserRole } from './utils/enums';
import ForgotPassword from './components/Login/ForgotPassword';
// import { PeopleReport } from './components/Reports/PeopleReport';
// import { ProjectReport } from './components/Reports/ProjectReport';
// import { TeamReport } from './components/Reports/TeamReport';
import Inventory from './components/Inventory';
// import BadgeManagement from './components/Badge/BadgeManagement';


// BM Dashboard
import BMProtectedRoute from './components/common/BMDashboard/BMProtectedRoute';
import BMDashboard from './components/BMDashboard';
import BMLogin from './components/BMDashboard/Login';
import ConsumablesView from './components/BMDashboard/Consumables/ConsumablesList/ConsumablesView';

import EquipmentList from './components/BMDashboard/Equipment/List';
// import MaterialsList from './components/BMDashboard/MaterialsList';
// import PurchaseMaterials from './components/BMDashboard/MaterialPurchaseRequest';
// import ProjectDetails from './components/BMDashboard/Projects/ProjectDetails/ProjectDetails';

const MaterialsList = lazy(() => import('./components/BMDashboard/MaterialsList'));
const PurchaseMaterials = lazy(() => import('./components/BMDashboard/MaterialPurchaseRequest'));
const ProjectDetails = lazy(() => import('./components/BMDashboard/Projects/ProjectDetails/ProjectDetails'));
const UpdateMaterialsBulk = lazy(() => import('./components/BMDashboard/UpdateMaterials/UpdateMaterialsBulk/UpdateMaterialsBulk'));
const InventoryTypesList = lazy(() => import('./components/BMDashboard/InventoryTypesList'));
// const EquipmentList = lazy(() => import('./components/BMDashboard/EquipmentList'))

// Code-Splitting
const Projects = lazy(() => import('./components/Projects'));
const WeeklySummariesReport = lazy(() => import('./components/WeeklySummariesReport'));
const Reports = lazy(() => import('./components/Reports'));
const PeopleReport = lazy(() => import('./components/Reports/PeopleReport'));
const ProjectReport = lazy(() => import('./components/Reports/ProjectReport'));
const TeamReport = lazy(() => import('./components/Reports/TeamReport'));
const Members = lazy(() => import('./components/Projects/Members'));
const WBS = lazy(() => import('./components/Projects/WBS'));
const WBSDetail = lazy(() => import('./components/Projects/WBS/WBSDetail'));
const SingleTask = lazy(() => import('./components/Projects/WBS/SingleTask'));
const SameFolderTasks = lazy(() => import('./components/Projects/WBS/SameFolderTasks'));
const UserManagement = lazy(() => import('./components/UserManagement'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const BadgeManagement = lazy(() => import('./components/Badge/BadgeManagement'));
const PermissionsManagement = lazy(() => import('./components/PermissionsManagement/PermissionsManagement'));
const UserRoleTab = lazy(() => import('./components/PermissionsManagement/UserRoleTab'));
const Teams = lazy(() => import('./components/Teams/Teams'));

export default (
  <Switch>
    <Route path="/ProfileInitialSetup/:token" component={SetupProfile} />
    <>
      {/* Comment out the Header component and its import during phase 2 development. */}
      <Header />
      {/* Uncomment BMHeader and its import during phase 2 development. */}
      {/* <BMHeader /> */}
      <AutoUpdate />
      <ToastContainer />
      <Switch>
        <ProtectedRoute path="/dashboard" exact component={Dashboard} />
        <ProtectedRoute path="/dashboard/:userId" exact component={Dashboard} />
        <ProtectedRoute path="/project/members/:projectId" fallback component={Members} />
        <ProtectedRoute path="/popupmanagement" component={Admin} />
        <ProtectedRoute path="/timelog/" exact component={Timelog} />
        <ProtectedRoute path="/timelog/:userId" exact component={Timelog} />
        <ProtectedRoute path="/peoplereport/:userId" component={PeopleReport} fallback />
        <ProtectedRoute path="/projectreport/:projectId" component={ProjectReport} fallback />
        <ProtectedRoute path="/teamreport/:teamId" component={TeamReport} fallback />
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
          fallback
          allowedRoles={[
            UserRole.Administrator,
            UserRole.Manager,
            UserRole.CoreTeam,
            UserRole.Owner,
            UserRole.Mentor,
          ]}
          routePermissions={[RoutePermissions.weeklySummariesReport]}
        />
        <ProtectedRoute
          path="/reports"
          exact
          component={Reports}
          fallback
          routePermissions={RoutePermissions.reports}
        />
        <ProtectedRoute
          path="/teamlocations"
          exact
          component={TeamLocations}
        />
        <ProtectedRoute
          path="/projects"
          exact
          component={Projects}
          fallback
          allowedRoles={[UserRole.Administrator, UserRole.Owner]}
          routePermissions={[
            RoutePermissions.projects,
            RoutePermissions.projectManagement_fullFunctionality,
            RoutePermissions.projectManagement_addTeamMembersUploadNewWBS,
          ]}
        />
        <ProtectedRoute
          path="/projects"
          exact
          component={Projects}
          fallback
          routePermissions={RoutePermissions.projects}
        />
        <ProtectedRoute path="/wbs/tasks/:wbsId/:projectId/:wbsName" component={WBSDetail} fallback />
        <ProtectedRoute path="/project/wbs/:projectId" component={WBS} fallback />
        <ProtectedRoute path="/wbs/tasks/:wbsId/:projectId" component={WBSDetail} fallback />
        <ProtectedRoute path="/wbs/tasks/:taskId" component={SingleTask} fallback />
        <ProtectedRoute path="/wbs/samefoldertasks/:taskId" component={SameFolderTasks} fallback />
        <ProtectedRoute
          path="/usermanagement"
          exact
          component={UserManagement}
          fallback
          routePermissions={RoutePermissions.userManagement}
        />
        <ProtectedRoute
          path="/badgemanagement"
          exact
          component={BadgeManagement}
          fallback
          routePermissions={RoutePermissions.badgeManagement}
        />
        <ProtectedRoute
          path="/permissionsmanagement"
          exact
          component={PermissionsManagement}
          fallback
          routePermissions={[
            RoutePermissions.permissionsManagement,
            RoutePermissions.userPermissionsManagement,
          ]}
        />
        <ProtectedRoute
          path="/permissionsmanagement/:userRole"
          exact
          component={UserRoleTab}
          fallback
          routePermissions={RoutePermissions.permissionsManagementRole}
        />
        <ProtectedRoute
          path="/teams"
          exact
          component={Teams}
          fallback
          allowedRoles={[UserRole.Administrator, UserRole.Owner]}
          routePermissions={RoutePermissions.teams}
        />

        {/* ----- BEGIN BM Dashboard Routing ----- */}

        <BMProtectedRoute path="/bmdashboard" exact component={BMDashboard} />
        <Route path="/bmdashboard/login" component={BMLogin} />
        <BMProtectedRoute path="/bmdashboard/materials/purchase" fallback component={PurchaseMaterials} />
        <BMProtectedRoute path="/bmdashboard/projects/:projectId" fallback component={ProjectDetails} />
        <BMProtectedRoute path="/bmdashboard/materials/update" fallback component={UpdateMaterialsBulk} />
        <BMProtectedRoute path="/bmdashboard/equipment/add" component={AddEquipmentType} />

        <BMProtectedRoute path="/bmdashboard/equipment" fallback exact component={EquipmentList} />
        <BMProtectedRoute path="/bmdashboard/materials" fallback component={MaterialsList} />
        <BMProtectedRoute path="/bmdashboard/consumables" component={ConsumablesView} />
        <BMProtectedRoute path="/bmdashboard/lessonform/" fallback component={LessonForm} />

        <BMProtectedRoute path="/bmdashboard/inventorytypes" fallback component={InventoryTypesList} />

        {/* Temporary route to redirect all subdirectories to login if unauthenticated */}
        <BMProtectedRoute path="/bmdashboard/:path" component={BMDashboard} />

        {/* ----- END BM Dashboard Routing ----- */}

        <Route path="/login" component={Login} />
        <Route path="/forgotpassword" component={ForgotPassword} />
        <ProtectedRoute path="/infoCollections" component={EditableInfoModal} />
        <ProtectedRoute path="/infoCollections" component={RoleInfoCollections} />
        <ProtectedRoute path="/userprofile/:userId" fallback component={UserProfile} />
        <ProtectedRoute path="/userprofileedit/:userId" component={UserProfileEdit} />
        <ProtectedRoute path="/updatepassword/:userId" component={UpdatePassword} />
        <Route path="/Logout" component={Logout} />
        <Route path="/forcePasswordUpdate/:userId" component={ForcePasswordUpdate} />
        <ProtectedRoute path="/" exact component={Dashboard} />


      </Switch>
    </>
  </Switch>
);