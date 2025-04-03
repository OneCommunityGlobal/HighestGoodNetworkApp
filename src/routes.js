// Delete these two lines:
import FormEditor from 'components/Forms/FormEditor';
import FormViewer from 'components/Forms/FormViewer';

import { lazy } from 'react';
import { Route, Switch } from 'react-router-dom';
import SetupProfile from 'components/SetupProfile/SetupProfile';
import { ToastContainer } from 'react-toastify';
import AutoUpdate from 'components/AutoUpdate';
import { TaskEditSuggestions } from 'components/TaskEditSuggestions/TaskEditSuggestions';
import RoutePermissions from 'utils/routePermissions';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import RoleInfoCollections from 'components/UserProfile/EditableModal/RoleInfoModal';
import LessonList from 'components/BMDashboard/LessonList/LessonListForm';
import AddEquipmentType from 'components/BMDashboard/Equipment/Add/AddEquipmentType';
import Announcements from 'components/Announcements';
import JobFormBuilder from 'components/Collaboration/JobFormbuilder';
import JobCCDashboard from 'components/JobCCDashboard/JobCCDashboard';
import WeeklyProjectSummary from 'components/BMDashboard/WeeklyProjectSummary/WeeklyProjectSummary';
import Page1 from './components/HGNForm/pages/Page1';
import Page2 from './components/HGNForm/pages/Page2';
import Page3 from './components/HGNForm/pages/Page3';
import Page4 from './components/HGNForm/pages/Page4';
import Page5 from './components/HGNForm/pages/Page5';
import Page6 from './components/HGNForm/pages/Page6';
import Timelog from './components/Timelog';
import LessonForm from './components/BMDashboard/Lesson/LessonForm';
import UserProfileEdit from './components/UserProfile/UserProfileEdit';
import Dashboard from './components/Dashboard';
import Logout from './components/Logout/Logout';
import Login from './components/Login';
import ForcePasswordUpdate from './components/ForcePasswordUpdate';
import ProtectedRoute from './components/common/ProtectedRoute';
import UpdatePassword from './components/UpdatePassword';
import Header from './components/Header';
import TeamLocations from './components/TeamLocations';
import 'react-toastify/dist/ReactToastify.css';
import { UserRole } from './utils/enums';
import ForgotPassword from './components/Login/ForgotPassword';
import Inventory from './components/Inventory';
import EmailSubscribeForm from './components/EmailSubscribeForm';
import UnsubscribeForm from './components/EmailSubscribeForm/Unsubscribe';
import NotFoundPage from './components/NotFound/NotFoundPage';
import { EmailSender } from './components/common/EmailSender/EmailSender';
import Collaboration from './components/Collaboration';

// LB Dashboard
import LBProtectedRoute from './components/common/LBDashboard/LBProtectedRoute';
import LBLogin from './components/LBDashboard/Login';
import LBDashboard from './components/LBDashboard';
import ListOveriew from './components/LBDashboard/ListingOverview/ListOverview';
import LBBidOverview from './components/LBDashboard/BiddingOverview/BiddingOverview';

// BM Dashboard
import BMProtectedRoute from './components/common/BMDashboard/BMProtectedRoute';
import BMDashboard from './components/BMDashboard';
import BMLogin from './components/BMDashboard/Login';
import EquipmentList from './components/BMDashboard/Equipment/List';
import EquipmentDetail from './components/BMDashboard/Equipment/Detail/EquipmentDetail';
import UpdateEquipment from './components/BMDashboard/Equipment/Update/UpdateEquipment';
import ToolDetailPage from './components/BMDashboard/Tools/ToolDetailPage';
import CheckTypes from './components/BMDashboard/shared/CheckTypes';
import Toolslist from './components/BMDashboard/Tools/ToolsList';
import AddTool from './components/BMDashboard/Tools/AddTool';
import AddTeamMember from './components/BMDashboard/AddTeamMember/AddTeamMember';

// Community Portal
import CPProtectedRoute from './components/common/CPDashboard/CPProtectedRoute';
import CPLogin from './components/CommunityPortal/Login';
import CPDashboard from './components/CommunityPortal';
import ActivityList from './components/CommunityPortal/Activities/ActivityList';
// import AddActivities from './components/CommunityPortal/Activities/AddActivities';
// import ActvityDetailPage from './components/CommunityPortal/Activities/ActivityDetailPage';

import EPProtectedRoute from './components/common/EPDashboard/EPProtectedRoute';
import EPLogin from './components/EductionPortal/Login';
import EPDashboard from './components/EductionPortal';
import HelpPage from './components/LandingPage/HelpPage';





// eslint-disable-next-line import/order, import/no-unresolved
import LogTools from './components/BMDashboard/LogTools/LogTools';

const ReusableListView = lazy(() => import('./components/BMDashboard/ReusableList'));
const ConsumableListView = lazy(() => import('./components/BMDashboard/ConsumableList'));
const MaterialListView = lazy(() => import('./components/BMDashboard/MaterialList'));
const PurchaseMaterials = lazy(() =>
  import('./components/BMDashboard/PurchaseRequests/MaterialPurchaseRequest'),
);
const PurchaseReusables = lazy(() =>
  import('./components/BMDashboard/PurchaseRequests/ReusablePurchaseRequest'),
);
// const PurchaseEquipment = lazy(() =>
//   import('./components/BMDashboard/PurchaseRequests/EquipmentPurchaseRequest'),
// );
const ProjectDetails = lazy(() =>
  import('./components/BMDashboard/Projects/ProjectDetails/ProjectDetails'),
);
const UpdateMaterialsBulk = lazy(() =>
  import('./components/BMDashboard/UpdateMaterials/UpdateMaterialsBulk/UpdateMaterialsBulk'),
);

const UpdateReusablesBulk = lazy(() =>
  import('./components/BMDashboard/UpdateReusables/UpdateReusablesBulk/UpdateReusablesBulk'),
);

const PurchaseConsumable = lazy(() => import('./components/BMDashboard/ConsumablePurchaseRequest'));
const InventoryTypesList = lazy(() => import('./components/BMDashboard/InventoryTypesList'));
const PurchaseTools = lazy(() => import('./components/BMDashboard/ToolPurchaseRequest'));
const PurchaseEquipment = lazy(() => import('./components/BMDashboard/EquipmentPurchaseRequest'));

const AddMaterial = lazy(() => import('./components/BMDashboard/AddMaterial/AddMaterial'));
const AddConsumable = lazy(() => import('./components/BMDashboard/AddConsumable/AddConsumable'));
// Code-Splitting
const Projects = lazy(() => import('./components/Projects'));
const WeeklySummariesReport = lazy(() => import('./components/WeeklySummariesReport'));
const TotalOrgSummary = lazy(() => import('./components/TotalOrgSummary'));
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
const PermissionsManagement = lazy(() =>
  import('./components/PermissionsManagement/PermissionsManagement'),
);
const UserRoleTab = lazy(() => import('./components/PermissionsManagement/UserRoleTab'));
const Teams = lazy(() => import('./components/Teams/Teams'));

export default (
  <Switch>
    {/* ----- LB Dashboard Routing ----- */}
    {/* If it's possible incorporate this route with others without the header, please do */}
    <Route path="/form" component={FormEditor} />
    <Route path="/formviewer" component={FormViewer} />
    <Route path="/ProfileInitialSetup/:token" component={SetupProfile} />
    <>
      {/* Comment out the Header component and its import during phase 2 development. */}
      <Header />
      {/* Uncomment BMHeader and its import during phase 2 development. */}


      {/* <BMHeader /> */}
      <AutoUpdate />
      <ToastContainer />
      <Switch>
        <ProtectedRoute path="/hgnhelp" component={HelpPage} />
        <ProtectedRoute path="/dashboard" exact component={Dashboard} />
        <ProtectedRoute path="/dashboard/:userId" exact component={Dashboard} />
        <ProtectedRoute path="/project/members/:projectId" fallback component={Members} />
        <ProtectedRoute path="/timelog/" exact render={() => <Timelog userId={null} />} />
        <ProtectedRoute path="/timelog/:userId" exact render={(props) => {
          const { userId } = props.match.params;
          return <Timelog userId={userId} />
        }} />
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
          routePermissions={RoutePermissions.weeklySummariesReport}
        />
        <ProtectedRoute
          path="/reports"
          exact
          component={Reports}
          fallback
          routePermissions={RoutePermissions.reports}
        />
        <ProtectedRoute path="/teamlocations" exact component={TeamLocations} />
        <ProtectedRoute
          path="/projects"
          exact
          component={Projects}
          fallback
          allowedRoles={[UserRole.Administrator, UserRole.Owner, UserRole.Manager]}
          routePermissions={RoutePermissions.projects}
        />
        <ProtectedRoute
          path="/projects"
          exact
          component={Projects}
          fallback
          routePermissions={RoutePermissions.projects}
        />
        <ProtectedRoute
          path="/wbs/tasks/:wbsId/:projectId/:wbsName"
          component={WBSDetail}
          fallback
          routePermissions={RoutePermissions.workBreakdownStructure}
        />
        <ProtectedRoute
          path="/project/wbs/:projectId"
          component={WBS}
          fallback
          routePermissions={RoutePermissions.workBreakdownStructure}
        />
        <ProtectedRoute
          path="/wbs/tasks/:wbsId/:projectId"
          component={WBSDetail}
          fallback
          routePermissions={RoutePermissions.workBreakdownStructure}
        />
        <ProtectedRoute
          path="/wbs/tasks/:taskId"
          component={SingleTask}
          fallback
          routePermissions={RoutePermissions.workBreakdownStructure}
        />
        <ProtectedRoute
          path="/wbs/samefoldertasks/:taskId"
          component={SameFolderTasks}
          fallback
          routePermissions={RoutePermissions.workBreakdownStructure}
        />
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
            ...RoutePermissions.permissionsManagement,
            ...RoutePermissions.userPermissionsManagement,
          ].flat()}
        />
        <ProtectedRoute
          path="/permissionsmanagement/:userRole"
          exact
          component={UserRoleTab}
          fallback
          routePermissions={RoutePermissions.permissionsManagement}
        />
        <ProtectedRoute
          path="/teams"
          exact
          component={Teams}
          fallback
          allowedRoles={[UserRole.Administrator, UserRole.Owner]}
          routePermissions={RoutePermissions.teams}
        />

        <ProtectedRoute
          path="/announcements"
          exact
          component={Announcements}
          routePermissions={RoutePermissions.announcements}
        />
        <ProtectedRoute
          path="/sendemail"
          exact
          component={EmailSender}
          allowedRoles={[UserRole.Administrator, UserRole.Owner]}
          routePermissions={RoutePermissions.projects}
        />

        <ProtectedRoute
          path="/totalorgsummary"
          exact
          component={TotalOrgSummary}
          fallback
          allowedRoles={[
            UserRole.Administrator,
            UserRole.Manager,
            UserRole.CoreTeam,
            UserRole.Owner,
            UserRole.Mentor,
          ]}
          // setting permission as Weeklysummariesreport for now. Later it will be changed to weeklyVolunteerSummary. - H
          routePermissions={RoutePermissions.weeklySummariesReport}
        />
        <ProtectedRoute path="/job-notification-dashboard" exact component={JobCCDashboard} fallback allowedRoles={[UserRole.Owner]}/>

        {/* ----- BEGIN BM Dashboard Routing ----- */}
        <BMProtectedRoute path="/bmdashboard" exact component={BMDashboard} />
        <Route path="/bmdashboard/login" component={BMLogin} />

        <BMProtectedRoute
          path="/bmdashboard/materials/purchase"
          fallback
          component={PurchaseMaterials}
        />
        <BMProtectedRoute
          path="/bmdashboard/reusables/purchase"
          fallback
          component={PurchaseReusables}
        />
        <BMProtectedRoute
          path="/bmdashboard/equipment/purchase"
          fallback
          component={PurchaseEquipment}
        />
        <BMProtectedRoute path="/bmdashboard/tools/purchase" fallback component={PurchaseTools} />
        <BMProtectedRoute
          path="/bmdashboard/projects/:projectId"
          fallback
          component={ProjectDetails}
        />
        <BMProtectedRoute path="/bmdashboard/lessonlist/" component={LessonList} />
        <BMProtectedRoute
          path="/bmdashboard/materials/update"
          fallback
          component={UpdateMaterialsBulk}
        />
        <BMProtectedRoute
          path="/bmdashboard/reusables/update"
          fallback
          component={UpdateReusablesBulk}
        />
        <BMProtectedRoute path="/bmdashboard/materials/add" fallback component={AddMaterial} />
        <BMProtectedRoute path="/bmdashboard/equipment/add" component={AddEquipmentType} />
        <BMProtectedRoute
          path="/bmdashboard/consumables/purchase"
          fallback
          component={PurchaseConsumable}
        />
        <BMProtectedRoute path="/bmdashboard/inventory/types" component={CheckTypes} />
        <BMProtectedRoute path="/bmdashboard/equipment" fallback exact component={EquipmentList} />
        <BMProtectedRoute path="/bmdashboard/equipment/:equipmentId" component={EquipmentDetail} />
        <BMProtectedRoute path="/bmdashboard/consumables" fallback component={ConsumableListView} />
        <BMProtectedRoute path="/bmdashboard/materials" fallback component={MaterialListView} />
        <BMProtectedRoute path="/bmdashboard/consumables/add" fallback component={AddConsumable} />
        <BMProtectedRoute path="/bmdashboard/reusables" fallback component={ReusableListView} />
        <BMProtectedRoute
          path="/bmdashboard/equipment/:equipmentId"
          fallback
          exact
          component={EquipmentDetail}
        />
        <BMProtectedRoute path="/bmdashboard/equipment/:equipmentId" component={EquipmentDetail} />
        <BMProtectedRoute
          path="/bmdashboard/tools/:equipmentId/update"
          component={UpdateEquipment}
        />
        <BMProtectedRoute path="/bmdashboard/tools" exact component={Toolslist} />
        <BMProtectedRoute path="/bmdashboard/AddTeamMember" component={AddTeamMember} />
        <BMProtectedRoute path="/bmdashboard/tools/add" exact component={AddTool} />
        <BMProtectedRoute path="/bmdashboard/tools/log" exact component={LogTools} />
        <BMProtectedRoute path="/bmdashboard/tools/:toolId" component={ToolDetailPage} />
        <BMProtectedRoute path="/bmdashboard/lessonform/:projectId" component={LessonForm} />
        <BMProtectedRoute path="/bmdashboard/lessonform/" component={LessonForm} />
        <BMProtectedRoute
          path="/bmdashboard/inventorytypes"
          fallback
          component={InventoryTypesList}
        />
        <BMProtectedRoute
          path="/bmdashboard/totalconstructionsummary"
          fallback
          exact
          component={WeeklyProjectSummary}
        />

        {/* Community Portal Routes */}
        <CPProtectedRoute path="/communityportal" exact component={CPDashboard} />
        <Route path="/communityportal/login" component={CPLogin} />
        <CPProtectedRoute path="/communityportal/Activities" exact component={ActivityList} />


        {/* Listing and Bidding Routes */}
        <LBProtectedRoute path="/lbdashboard" exact component={LBDashboard} />
        <LBProtectedRoute path="/lbdashboard/listOverview" exact component={ListOveriew} />
        <Route path="/lbdashboard/login" component={LBLogin} />
        <Route path="/lbdashboard/bidoverview" exact component={LBBidOverview} />

        {/* Good Education  Portal Routes */}
        <EPProtectedRoute path="/educationportal" exact component={EPDashboard} />
        <Route path="/educationportal/login" component={EPLogin} />


        {/* <BMProtectedRoute path="/bmdashboard/tools/add" exact component={AddTool} /> */}



        {/* Temporary route to redirect all subdirectories to login if unauthenticated */}
        {/* <BMProtectedRoute path="/bmdashboard/:path" component={BMDashboard} /> */}
        {/* ----- END BM Dashboard Routing ----- */}
        <Route path="/login" component={Login} />
        <Route path="/forgotpassword" component={ForgotPassword} />
        <Route path="/email-subscribe" component={EmailSubscribeForm} />
        <Route path="/email-unsubscribe" component={UnsubscribeForm} />
        <Route path="/collaboration" component={Collaboration} />
        <ProtectedRoute path="/jobformbuilder" fallback component={JobFormBuilder} />
        <ProtectedRoute path="/infoCollections" component={EditableInfoModal} />
        <ProtectedRoute path="/infoCollections" component={RoleInfoCollections} />
        <ProtectedRoute path="/userprofile/:userId" fallback component={UserProfile} />
        <ProtectedRoute path="/userprofileedit/:userId" component={UserProfileEdit} />
        <ProtectedRoute path="/updatepassword/:userId" component={UpdatePassword} />
        <Route path="/Logout" component={Logout} />
        <Route path="/forcePasswordUpdate/:userId" component={ForcePasswordUpdate} />
        <ProtectedRoute path="/hgnform" exact component={Page1}/>
        <ProtectedRoute path="/hgnform/page2" exact component={Page2}/>
        <ProtectedRoute path="/hgnform/page3" exact component={Page3}/>
        <ProtectedRoute path="/hgnform/page4" exact component={Page4}/>
        <ProtectedRoute path="/hgnform/page5" exact component={Page5}/>
        <ProtectedRoute path="/hgnform/page6" exact component={Page6}/>  
        <ProtectedRoute path="/" exact component={Dashboard} />
        <Route path="*" component={NotFoundPage} />
      </Switch>
    </>
  </Switch>
);
