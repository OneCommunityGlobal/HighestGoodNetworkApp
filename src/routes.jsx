import FormEditor from '~/components/Forms/FormEditor';
import FormViewer from '~/components/Forms/FormViewer';

import { lazy } from 'react';
import { Route, Switch } from 'react-router-dom';
import SetupProfile from '~/components/SetupProfile/SetupProfile';
import { ToastContainer } from 'react-toastify';
import ToolsAvailabilityPage from '~/components/BMDashboard/WeeklyProjectSummary/Tools/ToolsAvailabilityPage';
import AutoUpdate from '~/components/AutoUpdate';
import TaskEditSuggestions from '~/components/TaskEditSuggestions/TaskEditSuggestions';
import RoutePermissions from '~/utils/routePermissions';
import EditableInfoModal from '~/components/UserProfile/EditableModal/EditableInfoModal';
import RoleInfoCollections from '~/components/UserProfile/EditableModal/RoleInfoModal';
import LessonList from '~/components/BMDashboard/LessonList/LessonListForm';
import ResourceUsage from '~/components/CommunityPortal/ResourceUsage/ResourceUsage';
import AddEquipmentType from '~/components/BMDashboard/Equipment/Add/AddEquipmentType';
import EDailyActivityLog from '~/components/BMDashboard/Equipment/DailyActivityLog/EDailyActivityLog';
import Announcements from '~/components/Announcements';
import JobCCDashboard from '~/components/JobCCDashboard/JobCCDashboard';
import WeeklyProjectSummary from '~/components/BMDashboard/WeeklyProjectSummary/WeeklyProjectSummary';
import FaqSearch from '~/components/Faq/FaqSearch';
import FaqManagement from '~/components/Faq/FaqManagement';
import FaqHistory from '~/components/Faq/FaqHistory';
import UnansweredFaqs from '~/components/Faq/UnansweredFaqs';
import HeaderRenderer from '~/components/Header/HeaderRenderer';
import IssueDashboard from '~/components/BMDashboard/Issues/IssueDashboard';
import { ExperienceDonutChart } from '~/components/ExperienceDonutChart';
import LessonForm from '~/components/BMDashboard/Lesson/LessonForm';
import Page1 from './components/HGNForm/pages/Page1';
import Page2 from './components/HGNForm/pages/Page2';
import Page3 from './components/HGNForm/pages/Page3';
import Page4 from './components/HGNForm/pages/Page4';
import Page5 from './components/HGNForm/pages/Page5';
import Page6 from './components/HGNForm/pages/Page6';
import TSAFormPage1 from './components/TSAForm/pages/TSAFormPage1';
import TSAFormPage2 from './components/TSAForm/pages/TSAFormPage2';
import TSAFormPage3 from './components/TSAForm/pages/TSAFormPage3';
import TSAFormPage4 from './components/TSAForm/pages/TSAFormPage4';
import TSAFormPage5 from './components/TSAForm/pages/TSAFormPage5';
import TSAFormPage6 from './components/TSAForm/pages/TSAFormPage6';
import TSAFormPage7 from './components/TSAForm/pages/TSAFormPage7';
import TSAFormPage8 from './components/TSAForm/pages/TSAFormPage8';
import Timelog from './components/Timelog';
import UserProfileEdit from './components/UserProfile/UserProfileEdit';

import Dashboard from './components/Dashboard';
import Logout from './components/Logout/Logout';
import Login from './components/Login';
import ForcePasswordUpdate from './components/ForcePasswordUpdate';
import ProtectedRoute from './components/common/ProtectedRoute';
import UpdatePassword from './components/UpdatePassword';
import TeamLocations from './components/TeamLocations';
import 'react-toastify/dist/ReactToastify.css';
import { UserRole } from './utils/enums';
import ForgotPassword from './components/Login/ForgotPassword';
import Inventory from './components/Inventory';
import EmailSubscribeForm from './components/EmailSubscribeForm';
import UnsubscribePage from './components/EmailSubscribeForm/UnsubscribePage';
import SubscribePage from './components/EmailSubscribeForm/SubscribePage';
import UnsubscribeForm from './components/EmailSubscribeForm/Unsubscribe';
import NotFoundPage from './components/NotFound/NotFoundPage';
import EmailSender from './components/common/EmailSender/EmailSender';
import Collaboration from './components/Collaboration';

import TestEventRegistration from './components/EventRegistration/TestEventRegistration';
import MemberList from './components/QuestionnaireDashboard/MemberList';
import EventPopularity from './components/EventPopularity/EventPopularity';
import ApplicantsChart from './components/ApplicantsChart';
import ApplicationTimeChartPage from './components/ApplicationTimeChart';
import ApplicationAnalyticsContainer from './components/ApplicationAnalytics';
import UserSkillsProfile from './components/HGNSkillsDashboard/SkillsProfilePage/components/UserSkillsProfile';
import ApplicantVolunteerRatio from './components/ApplicantVolunteerRatio/ApplicantVolunteerRatio';

import WeeklySummaryPage from './components/VolunteerweeklysummaryBBC/WeeklySummaryPage'; // 测试用 后续要删除

// LB Dashboard
import LBProtectedRoute from './components/common/LBDashboard/LBProtectedRoute/LBProtectedRoute';
import LBHome from './components/LBDashboard/Home/Home';
import LBDashboard from './components/LBDashboard';
import LBLogin from './components/LBDashboard/Login';
import LBRegister from './components/LBDashboard/Register/LBRegister';
import LBMessaging from './components/LBDashboard/Messaging/LBMessaging';
import MasterPlan from './components/LBDashboard/Map/MasterPlan/MasterPlan';
import ListOveriew from './components/LBDashboard/ListingOverview/ListOverview';
import LBBidOverview from './components/LBDashboard/BiddingOverview/BiddingOverview';
import BiddingHomepage from './components/LBDashboard/BiddingHomepage/BiddingHomepage';
import WishList from './components/LBDashboard/WishList/WishList';
import WishListItem from './components/LBDashboard/WishList/ItemOverview';

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
import AttendanceNoShow from './components/AttendanceSystem/AttendanceNoShowCharts.jsx';
import AddTeamMember from './components/BMDashboard/AddTeamMember/AddTeamMember';
import LessonsLearntChart from './components/BMDashboard/LessonsLearnt/LessonsLearntChart';

// eslint-disable-next-line import/order
import IssueChart from './components/BMDashboard/Issues/issueCharts';
import BMTimeLogger from './components/BMDashboard/BMTimeLogger/BMTimeLogger';
import Issue from './components/BMDashboard/Issue/Issue';

import UtilizationChart from './components/BMDashboard/UtilizationChart/UtilizationChart';

import RentalChart from './components/BMDashboard/RentalChart/RentalChart';
import CreateNewTeam from './components/BMDashboard/Team/CreateNewTeam/CreateNewTeam';

// Community Portal
import CPProtectedRoute from './components/common/CPDashboard/CPProtectedRoute';
import CPLogin from './components/CommunityPortal/Login';
import CPDashboard from './components/CommunityPortal';
import ActivityList from './components/CommunityPortal/Activities/ActivityList';
import ActivityAttendance from './components/CommunityPortal/Activities/ActivityAttendance';
import Activity from './components/CommunityPortal/Activities/activityId/Activity';

import NoshowViz from './components/CommunityPortal/Attendence/NoshowViz';
// import AddActivities from './components/CommunityPortal/Activities/AddActivities';
// import ActvityDetailPage from './components/CommunityPortal/Activities/ActivityDetailPage';
import Register from './components/CommunityPortal/Activities/Register/Register';
import ActivitiesPage from './components/CommunityPortal/Activities/ActivitiesPage';
import EventStats from './components/CommunityPortal/EventPersonalization/EventStats';

import Resources from './components/CommunityPortal/Activities/activityId/Resources';
import EventParticipation from './components/CommunityPortal/Reports/Participation/EventParticipation';

import EPProtectedRoute from './components/common/EPDashboard/EPProtectedRoute';
import EPLogin from './components/EductionPortal/Login';
import EPDashboard from './components/EductionPortal';

import MostSusceptibleTools from './components/MostSusceptible/toolBreakdownChart';

import HelpPage from './components/LandingPage/HelpPage';

import TeamCard from './components/HGNHelpSkillsDashboard/TeamCard/TeamCard';
import LandingPage from './components/HGNHelpSkillsDashboard/LandingPage';
import SkillsOverviewPage from './components/HGNHelpSkillsDashboard/SkillsOverviewPage';
import CommunityMembersPage from './components/HGNHelpSkillsDashboard/CommunityMembersPage';
import UserProfilePage from './components/HGNHelpSkillsDashboard/UserProfilePage';
import FeedbackModal from './components/HGNHelpSkillsDashboard/FeedbackModal';
// import AddActivities from './components/CommunityPortal/Activities/AddActivities';
// import ActvityDetailPage from './components/CommunityPortal/Activities/ActivityDetailPage';
import ActivityAgenda from './components/CommunityPortal/Activities/ActivityAgenda';
// HGN PR Dashboard
import PRReviewTeamAnalytics from './components/HGNPRDashboard/PRReviewTeamAnalytics';

// eslint-disable-next-line import/order, import/no-unresolved
import LogTools from './components/BMDashboard/LogTools/LogTools';
// import IssueDashboard from './components/BMDashboard/Issues/IssueDashboard';
import EquipmentUpdate from './components/BMDashboard/Tools/EquipmentUpdate';
// Social Architecture
const ResourceManagement = lazy(() => import('./components/ResourceManagement/ResourceManagement'));
const RequestResources = lazy(() => import('./components/SocialArchitecture/RequestResources'));

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
const BMTimeLogCard = lazy(() => import('./components/BMDashboard/BMTimeLogger/BMTimeLogCard'));
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
const JobFormBuilder = lazy(() => import('./components/Collaboration/JobFormbuilder'));

export default (
  <Switch>
    {/* ----- LB Dashboard Routing ----- */}
    {/* If it's possible incorporate this route with others without the header, please do */}
    <Route path="/EventPopularity" component={EventPopularity} />
    <Route
      path="/lbdashboard/register"
      render={() => (
        <>
          <AutoUpdate />
          <ToastContainer />
          <LBRegister />
        </>
      )}
    />
    <Route
      path="/lbdashboard/login"
      render={() => (
        <>
          <AutoUpdate />
          <ToastContainer />
          <LBLogin />
        </>
      )}
    />

    <Route
      exact
      path="/lbdashboard/wishlists"
      render={() => (
        <>
          <AutoUpdate />
          <ToastContainer />
          <WishList />
        </>
      )}
    />
    <Route
      exact
      path="/lbdashboard/wishlist/:id"
      render={() => (
        <>
          <AutoUpdate />
          <ToastContainer />
          <WishListItem />
        </>
      )}
    />
    <Route path="/form" component={FormEditor} />
    <Route path="/formviewer" component={FormViewer} />
    <Route path="/ProfileInitialSetup/:token" component={SetupProfile} />

    <Route path="/mostsusceptibletoolschart" component={MostSusceptibleTools} />

    <Route path="/TestEventReg" component={TestEventRegistration} />

    <Route path="/logattendance" component={AttendanceNoShow} />

    <>
      {/* Comment out the Header component and its import during phase 2 development. */}
      {/* Uncomment BMHeader and its import during phase 2 development. */}

      {/* <BMHeader /> */}

      {/* This will render CPHeader to the page whose path starts with /communityportal i.e Phase III */}
      <HeaderRenderer />

      <AutoUpdate />
      <ToastContainer />
      <Switch>
        {/* 测试用，后续要删除 */}
        <ProtectedRoute path="/weekly-summary" exact component={WeeklySummaryPage} />
        <ProtectedRoute path="/hgnhelp" component={HelpPage} />
        <ProtectedRoute path="/dashboard" exact component={Dashboard} />
        <ProtectedRoute path="/dashboard/:userId" exact component={Dashboard} />
        <ProtectedRoute path="/project/members/:projectId" fallback component={Members} />
        <ProtectedRoute path="/timelog/" exact render={() => <Timelog userId={null} />} />
        <ProtectedRoute
          path="/timelog/:userId"
          exact
          render={props => {
            const { userId } = props.match.params;
            return <Timelog userId={userId} />;
          }}
        />
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
          path="/communityportal/activity/:activityId/resources"
          exact
          component={ResourceManagement}
          fallback
          routePermissions={RoutePermissions.resourceManagement}
        />
        <ProtectedRoute
          path="/communityportal/resources/add"
          exact
          component={RequestResources}
          fallback
          routePermissions={RoutePermissions.resourcesAdd}
        />
        <ProtectedRoute
          path="/usermanagement"
          exact
          component={UserManagement}
          fallback
          allowedRoles={[UserRole.Administrator, UserRole.Owner, UserRole.Manager]}
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

        <ProtectedRoute path="/applicants-chart" exact component={ApplicantsChart} fallback />
        <ProtectedRoute
          path="/applicant-volunteer-ratio"
          exact
          component={ApplicantVolunteerRatio}
        />

        <ProtectedRoute
          path="/application-time-chart"
          exact
          component={ApplicationTimeChartPage}
          fallback
        />

        <ProtectedRoute
          path="/application-analytics"
          exact
          component={ApplicationAnalyticsContainer}
          fallback
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

        <ProtectedRoute path="/faq" exact component={FaqSearch} />

        <ProtectedRoute
          path="/faq-management"
          exact
          component={FaqManagement}
          routePermissions={RoutePermissions.faqManagement}
        />

        <ProtectedRoute
          path="/faqs/:id/history"
          exact
          component={FaqHistory}
          routePermissions={RoutePermissions.faqManagement}
        />

        <ProtectedRoute
          path="/unanswered-faqs"
          exact
          component={UnansweredFaqs}
          routePermissions={RoutePermissions.faqManagement}
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
        <ProtectedRoute
          path="/job-notification-dashboard"
          exact
          component={JobCCDashboard}
          fallback
          allowedRoles={[UserRole.Owner]}
        />

        {/* ----- BEGIN BM Dashboard Routing ----- */}
        <BMProtectedRoute path="/bmdashboard" exact component={BMDashboard} />
        <Route path="/bmdashboard/login" component={BMLogin} />
        <Route path="/LessonsLearntChart" component={LessonsLearntChart} />

        <Route path="/UtilizationChart" component={UtilizationChart} />

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
        <BMProtectedRoute path="/bmdashboard/T/EDailyActivityLog" component={EDailyActivityLog} />
        <BMProtectedRoute
          path="/bmdashboard/consumables/purchase"
          fallback
          component={PurchaseConsumable}
        />

        <BMProtectedRoute path="/bmdashboard/rentalchart" component={RentalChart} />
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
        <BMProtectedRoute
          path="/bmdashboard/tools/equipmentupdate"
          exact
          component={EquipmentUpdate}
        />
        <BMProtectedRoute path="/bmdashboard/tools/:toolId" component={ToolDetailPage} />
        <BMProtectedRoute path="/bmdashboard/lessonform/:projectId" component={LessonForm} />
        <BMProtectedRoute path="/bmdashboard/lessonform/" component={LessonForm} />
        <BMProtectedRoute
          path="/bmdashboard/inventorytypes"
          fallback
          component={InventoryTypesList}
        />
        <BMProtectedRoute path="/bmdashboard/AddNewTeam" fallback component={CreateNewTeam} />
        <BMProtectedRoute
          path="/bmdashboard/totalconstructionsummary"
          fallback
          exact
          component={WeeklyProjectSummary}
        />

        <BMProtectedRoute path="/bmdashboard/issues/add/:projectId" component={Issue} />
        <BMProtectedRoute path="/bmdashboard/issuechart" component={IssueChart} />

        <BMProtectedRoute path="/bmdashboard/timelog/" component={BMTimeLogger} />
        <BMProtectedRoute path="/bmdashboard/issues/" component={IssueDashboard} />

        <BMProtectedRoute
          path="/bmdashboard/timelog/:projectId"
          fallback
          component={BMTimeLogCard}
        />

        <BMProtectedRoute
          path="/bmdashboard/tools-availability"
          fallback
          exact
          component={ToolsAvailabilityPage}
        />

        {/* Community Portal Routes */}
        <CPProtectedRoute path="/communityportal" exact component={CPDashboard} />
        <Route path="/communityportal/login" component={CPLogin} />
        <CPProtectedRoute path="/communityportal/activities" exact component={ActivityList} />
        <CPProtectedRoute
          path="/communityportal/ActivityAttendance"
          exact
          component={ActivityAttendance}
        />
        {/* <BMProtectedRoute path="/bmdashboard/tools/add" exact component={AddTool} /> */}
        <CPProtectedRoute path="/communityportal/reports/participation" component={NoshowViz} />

        <CPProtectedRoute
          path="/communityportal/activities/:activityid/resources"
          exact
          component={Resources}
        />
        <CPProtectedRoute
          path="/communityportal/activities/:activityid"
          exact
          component={Activity}
        />
        <CPProtectedRoute
          path="/communityportal/reports/participation"
          exact
          component={EventParticipation}
        />
        <CPProtectedRoute
          path="/communityportal/reports/event/personalization"
          exact
          component={EventStats}
        />
        <CPProtectedRoute path="/communityportal/ActivitiesPage" exact component={ActivitiesPage} />
        <CPProtectedRoute
          path="/communityportal/Activities/Register/:activityId"
          exact
          component={Register}
        />

        {/* Listing and Bidding Routes */}
        <LBProtectedRoute path="/lbdashboard" exact component={LBDashboard} />
        <LBProtectedRoute path="/lbdashboard/listOverview" exact component={ListOveriew} />
        <LBProtectedRoute path="/lbdashboard/masterplan" exact component={MasterPlan} />
        <Route path="/lbdashboard/login" component={LBLogin} />
        <Route path="/lbdashboard/register" component={LBRegister} />
        <LBProtectedRoute path="/lbdashboard/messaging" component={LBMessaging} />
        <Route // Should be LBProtectedRoute
          path="/lbdashboard/listingshome"
          render={() => (
            <>
              <AutoUpdate />
              <LBHome />
            </>
          )}
        />
        <Route path="/lbdashboard/bidoverview" exact component={LBBidOverview} />
        <LBProtectedRoute path="/lbdashboard/bidding" exact component={BiddingHomepage} />

        <CPProtectedRoute
          path="/communityportal/reports/participation"
          exact
          component={EventParticipation}
        />

        {/* Good Education  Portal Routes */}
        <EPProtectedRoute path="/educationportal" exact component={EPDashboard} />
        <Route path="/educationportal/login" component={EPLogin} />

        <CPProtectedRoute
          path="/communityportal/reports/event/personalization"
          exact
          component={EventStats}
        />
        {/* <BMProtectedRoute path="/bmdashboard/tools/add" exact component={AddTool} /> */}
        <CPProtectedRoute path="/communityportal/ActivityAgenda" exact component={ActivityAgenda} />

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
        {/* ----- HGN Help Community Skills Dashboard Routes ----- */}
        <ProtectedRoute path="/hgnhelp" exact component={LandingPage} />
        <ProtectedRoute path="/hgnteam" exact component={TeamCard} />

        <ProtectedRoute path="/hgnhelp/skills-overview" exact component={SkillsOverviewPage} />
        <ProtectedRoute path="/hgnhelp/community" exact component={CommunityMembersPage} />
        <ProtectedRoute path="/hgnhelp/profile/:userId" exact component={UserProfilePage} />
        <ProtectedRoute path="/hgnhelp/feedback" exact component={FeedbackModal} />
        <ProtectedRoute path="/hgnform" exact component={Page1} />
        <ProtectedRoute path="/hgnform/page2" exact component={Page2} />
        <ProtectedRoute path="/hgnform/page3" exact component={Page3} />
        <ProtectedRoute path="/hgnform/page4" exact component={Page4} />
        <ProtectedRoute path="/hgnform/page5" exact component={Page5} />
        <ProtectedRoute path="/hgnform/page6" exact component={Page6} />
        <ProtectedRoute
          path="/hgn/profile/skills"
          exact
          fallback
          component={UserSkillsProfile}
          allowedRoles={[UserRole.Administrator, UserRole.CoreTeam, UserRole.Owner]}
          routePermissions={RoutePermissions.accessHgnSkillsDashboard}
        />
        <ProtectedRoute path="/tsaformpage1" exact component={TSAFormPage1} />
        <ProtectedRoute path="/tsaformpage2" exact component={TSAFormPage2} />
        <ProtectedRoute path="/tsaformpage3" exact component={TSAFormPage3} />
        <ProtectedRoute path="/tsaformpage4" exact component={TSAFormPage4} />
        <ProtectedRoute path="/tsaformpage5" exact component={TSAFormPage5} />
        <ProtectedRoute path="/tsaformpage6" exact component={TSAFormPage6} />
        <ProtectedRoute path="/tsaformpage7" exact component={TSAFormPage7} />
        <ProtectedRoute path="/tsaformpage8" exact component={TSAFormPage8} />
        <ProtectedRoute path="/" exact component={Dashboard} />
        <Route path="*" component={NotFoundPage} />
      </Switch>
    </>
  </Switch>
);
