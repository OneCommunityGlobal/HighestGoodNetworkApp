import { lazy } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AutoUpdate from './components/AutoUpdate';
import TaskEditSuggestions from './components/TaskEditSuggestions/TaskEditSuggestions';
import RoutePermissions from './utils/routePermissions';
import hasPermission from './utils/permissions';

import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Logout from './components/Logout/Logout';
import ForgotPassword from './components/Login/ForgotPassword';
import ForcePasswordUpdate from './components/ForcePasswordUpdate';
import UpdatePassword from './components/UpdatePassword';
import NotFoundPage from './components/NotFound/NotFoundPage';

import SetupProfile from './components/SetupProfile/SetupProfile';
import Timelog from './components/Timelog';
import UserProfileEdit from './components/UserProfile/UserProfileEdit';
import EditableInfoModal from './components/UserProfile/EditableModal/EditableInfoModal';
import RoleInfoCollections from './components/UserProfile/EditableModal/RoleInfoModal';
import PRDashboard from './components/PRDashboard';
import ApplicationTimeChartPage from './components/ApplicationTimeChart';
import ApplicantsChart from './components/ApplicantsChart';
import ApplicationAnalyticsContainer from './components/ApplicationAnalytics';
import UserSkillsProfile from './components/HGNSkillsDashboard/SkillsProfilePage/components/UserSkillsProfile';

import WeeklySummaryPage from './components/VolunteerweeklysummaryBBC/WeeklySummaryPage';
import EmailSubscribeForm from './components/EmailSubscribeForm';
import SubscribePage from './components/EmailSubscribeForm/SubscribePage';
import UnsubscribePage from './components/EmailSubscribeForm/UnsubscribePage';
import UnsubscribeForm from './components/EmailSubscribeForm/Unsubscribe';
import EmailSender from './components/common/EmailSender/EmailSender';

import FormEditor from './components/Forms/FormEditor';
import FormViewer from './components/Forms/FormViewer';

import HeaderRenderer from './components/Header/HeaderRenderer';
import Announcements from './components/Announcements';
import JobCCDashboard from './components/JobCCDashboard/JobCCDashboard';

import WeeklyProjectSummary from './components/BMDashboard/WeeklyProjectSummary/WeeklyProjectSummary';
import LessonForm from './components/BMDashboard/Lesson/LessonForm';
import LessonList from './components/BMDashboard/LessonList/LessonListForm';
import AddEquipmentType from './components/BMDashboard/Equipment/Add/AddEquipmentType';
import EDailyActivityLog from './components/BMDashboard/Equipment/DailyActivityLog/EDailyActivityLog';
import LogTools from './components/BMDashboard/LogTools/LogTools';
import Toolslist from './components/BMDashboard/Tools/ToolsList';
import AddTool from './components/BMDashboard/Tools/AddTool';
import EquipmentUpdate from './components/BMDashboard/Tools/EquipmentUpdate';
import Issue from './components/BMDashboard/Issue/Issue';
import IssueDashboard from './components/BMDashboard/Issues/IssueDashboard';
import IssueChart from './components/BMDashboard/Issues/issueCharts';
import BMTimeLogger from './components/BMDashboard/BMTimeLogger/BMTimeLogger';
import AddTeamMember from './components/BMDashboard/AddTeamMember/AddTeamMember';
import AnalyticsDashboard from './components/JobCCDashboard/JobAnalytics/JobAnalytics';

import FaqSearch from './components/Faq/FaqSearch';
import FaqManagement from './components/Faq/FaqManagement';
import FaqHistory from './components/Faq/FaqHistory';
import UnansweredFaqs from './components/Faq/UnansweredFaqs';
import { ExperienceDonutChart } from './components/ExperienceDonutChart';

import ToolsAvailabilityPage from './components/BMDashboard/WeeklyProjectSummary/Tools/ToolsAvailabilityPage';
import ResourceUsage from './components/CommunityPortal/ResourceUsage/ResourceUsage';
import DatabaseDesign from './components/CommunityPortal/DatabaseDesign/DatabaseDesign';

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

import DisplayTeamMemberDetails from './components/HGNForm/TopCommunityMembers/TopCommunityMembers';

import HelpPage from './components/LandingPage/HelpPage';

import TeamCard from './components/HGNHelpSkillsDashboard/TeamCard/TeamCard';
import LandingPage from './components/HGNHelpSkillsDashboard/LandingPage';
import SkillsOverviewPage from './components/HGNHelpSkillsDashboard/SkillsOverviewPage';
import CommunityMembersPage from './components/HGNHelpSkillsDashboard/CommunityMembersPage';
import UserProfilePage from './components/HGNHelpSkillsDashboard/UserProfilePage';
import FeedbackModal from './components/HGNHelpSkillsDashboard/FeedbackModal';

import Activity from './components/CommunityPortal/Activities/activityId/Activity';
import ActivityAttendance from './components/CommunityPortal/Activities/ActivityAttendance';
import ActivityAgenda from './components/CommunityPortal/Activities/ActivityAgenda';
import NoshowViz from './components/CommunityPortal/Attendence/NoshowViz';
import EventList from './components/CommunityPortal/Event/EventList/EventList';
import ResourcesUsage from './components/CommunityPortal/Activities/activityId/ResourcesUsage';
import ResourceManagement from './components/ResourceManagement/ResourceManagement';
import EventParticipation from './components/CommunityPortal/Reports/Participation/EventParticipation';

import MaterialSummary from './components/MaterialSummary/MaterialSummary';

// Activity Feedback Modal
import FeedbackRatingEntry from './components/FeedbackActivityModal/FeedbackActivityEntry';

import TeamLocations from './components/TeamLocations';
import Inventory from './components/Inventory';
import Collaboration from './components/Collaboration';
import SuggestedJobsList from './components/Collaboration/SuggestedJobsList';

import TestEventRegistration from './components/EventRegistration/TestEventRegistration';
// Questionnaire Dashboard
import MemberList from './components/QuestionnaireDashboard/MemberList';
import PromotionTable from './components/QuestionnaireDashboard/PromotionTable';
import EventPopularity from './components/EventPopularity/EventPopularity';
import ApplicantVolunteerRatio from './components/ApplicantVolunteerRatio/ApplicantVolunteerRatio';
import { JobAnalyticsCompetitiveRolesPage } from './components/Reports/JobAnalytics';
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
import AttendanceNoShow from './components/AttendanceSystem/AttendanceNoShowCharts.jsx';
import LessonsLearntChart from './components/BMDashboard/LessonsLearnt/LessonsLearntChart';
import UtilizationChart from './components/BMDashboard/UtilizationChart/UtilizationChart';

import RentalChart from './components/BMDashboard/RentalChart/RentalChart';
import ReturnedLateChart from './components/BMDashboard/RentalChart/ReturnedLateChart';
import CreateNewTeam from './components/BMDashboard/Team/CreateNewTeam/CreateNewTeam';
// import MostSusceptibleTools from './components/MostSusceptible/toolBreakdownChart';
import HoursPledgedChart from './components/JobAnalytics/HoursPledgedChart/HoursPledgedChart';
import InjurySeverityDashboard from './components/BMDashboard/Injuries/InjurySeverityChart';

// Community Portal
import CPProtectedRoute from './components/common/CPDashboard/CPProtectedRoute';
import CPLogin from './components/CommunityPortal/Login';
import CPDashboard from './components/CommunityPortal';
import ActivityList from './components/CommunityPortal/Activities/ActivityList';
import ActivityComments from './components/CommunityPortal/Activities/activityId/ActivityComments';
import Feedbackform from './components/CommunityPortal/Activities/Feedbackform';
import FollowUpEmailTemplate from './components/CommunityPortal/Activities/FollowUpEmailTemplate';
// import AddActivities from './components/CommunityPortal/Activities/AddActivities';
// import ActvityDetailPage from './components/CommunityPortal/Activities/ActivityDetailPage';
import Register from './components/CommunityPortal/Activities/Register/Register';
import ActivitiesPage from './components/CommunityPortal/Activities/ActivitiesPage';
import EventStats from './components/CommunityPortal/EventPersonalization/EventStats';

// Community Calendar
import CommunityCalendar from './components/CommunityPortal/Calendar/CommunityCalendar';
import EPProtectedRoute from './components/common/EPDashboard/EPProtectedRoute';
import EPLogin from './components/EductionPortal/Login';
import BrowseLessonPlan from './components/EductionPortal/BrowseLessonPlan/BrowseLP';
import EPDashboard from './components/EductionPortal';
import ReportDownloadButton from './components/EductionPortal/AnalyticsDashboard/ReportDownloadButton';
import GroupList from './components/EductionPortal/GroupList/GroupList';
import EvaluationResultsWrapper from './components/EductionPortal/EvaluationResultsWrapper';
import InsightWidget from './components/EductionPortal/AnalyticsDashboard/InsightsWidget';

import StudentDashboard from './components/EductionPortal/StudentTasks/StudentDashboard';
import StudentTasks from './components/EductionPortal/StudentTasks/StudentTasks';
import TaskDetails from './components/EductionPortal/StudentTasks/TaskDetails';
import PRReviewTeamAnalytics from './components/HGNPRDashboard/PRReviewTeamAnalytics';
import PRDashboardOverview from './components/HGNPRDashboard/PRDashboardOverview';
import PRDashboardPromotionEligibility from './components/HGNPRDashboard/PRDashboardPromotionEligibility';
import PRDashboardTopReviewedPRs from './components/HGNPRDashboard/PRDashboardTopReviewedPRs';
import PRDashboardDetails from './components/HGNPRDashboard/PRDashboardDetails';
import PromotionEligibility from './components/HGNPRDashboard/PromotionEligibility';
import PRPromotionsPage from './components/PRPromotions/PRPromotionsPage';

import ProtectedRoute from './components/common/ProtectedRoute';
import { UserRole } from './utils/enums';

import WriteTaskUpload from './components/EductionPortal/Tasks/WriteTaskUpload';
import IntermediateTaskList from './components/EductionPortal/IntermediateTasks/IntermediateTaskList';

import EmbedInteractiveMap from './components/BMDashboard/InteractiveMap/EmbedInteractiveMap';
import InteractiveMap from './components/BMDashboard/InteractiveMap/InteractiveMap';

import SimpleToolChart from './components/BMDashboard/Tools/SimpleToolChart';

import SupportLogin from './components/SupportPortal/SupportLogin';
import SupportDashboard from './components/SupportPortal/SupportDashboard';
import SupportLogViewer from './components/SupportPortal/SupportLogViewer';

// Social Architecture

import JobApplicationForm from './components/Collaboration/JobApplicationForm/JobApplicationForm';
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
const InjuryChart = lazy(() => import('./components/BMDashboard/InjuryChart/InjuryChart'));
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
const PopularityTimelineChart = lazy(() =>
  import('./components/PopularityTimelineAnalytics/PopularityTimelineChart'),
);
const MonthsPledgedChart = lazy(() =>
  import('./components/MonthsPledgedAnalytics/MonthsPledgedChart'),
);
const EnhancedPopularityTimelineChart = lazy(() =>
  import('./components/EnhancedPopularityTimelineAnalytics/EnhancedPopularityTimelineChart'),
);

// PR Analytics Dashboard
import ReviewsInsight from './components/PRAnalyticsDashboard/ReviewsInsight/ReviewsInsight';
import ProjectsGlobalDistribution from './components/ProjectsGlobalDistribution/ProjectsGlobalDistribution';

const JobAnalyticsPage = lazy(() =>
  import('./components/Reports/HitsAndApplicationRatio/JobAnalyticsPage'),
);

const SuggestedJobsListBuilder = lazy(() => import('./components/Collaboration/SuggestedJobsList'));
export default (
  <Switch>
    {/* ----- LB Dashboard Routing Starts----- */}
    {/* If it's possible incorporate this route with others without the header, please do */}
    <Route path="/lbdashboard/login" component={LBLogin} />
    <Route path="/lbdashboard/register" component={LBRegister} />
    {/* Protected Routes for lbdashboard */}
    <LBProtectedRoute path="/lbdashboard" exact component={LBDashboard} />
    <LBProtectedRoute
      path="/lbdashboard/listingshome"
      render={() => (
        <>
          <AutoUpdate />
          <LBHome />
        </>
      )}
    />
    <LBProtectedRoute path="/lbdashboard/listOverview" exact component={ListOveriew} />
    <LBProtectedRoute path="/lbdashboard/bidoverview" exact component={LBBidOverview} />
    <LBProtectedRoute path="/lbdashboard/bidding" exact component={BiddingHomepage} />
    <LBProtectedRoute path="/lbdashboard/messaging" component={LBMessaging} />
    <LBProtectedRoute path="/lbdashboard/masterplan" exact component={MasterPlan} />
    <LBProtectedRoute
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
    <LBProtectedRoute
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

    <LBProtectedRoute path="/lbdashboard" component={LBDashboard} />

    <LBProtectedRoute path="/lbdashboard/home" component={LBHome} />
    <LBProtectedRoute path="/lbdashboard/messaging" component={LBMessaging} />
    <LBProtectedRoute path="/lbdashboard/map/masterplan" component={MasterPlan} />
    <LBProtectedRoute path="/lbdashboard/listingoverview" component={ListOveriew} />
    <LBProtectedRoute path="/lbdashboard/biddingoverview" component={LBBidOverview} />
    <LBProtectedRoute path="/lbdashboard/biddinghomepage" component={BiddingHomepage} />
    {/* ----- LB Dashboard Routing Ends----- */}

    <Route path="/EventPopularity" component={EventPopularity} />
    <Route path="/MaterialSummary" component={MaterialSummary} />
    <Route path="/form" component={FormEditor} />
    <Route path="/formviewer" component={FormViewer} />
    <Route path="/ProfileInitialSetup/:token" component={SetupProfile} />
    <Route path="/hours-pledged-chart" component={HoursPledgedChart} />
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
        <ProtectedRoute path="/weekly-summary" exact component={WeeklySummaryPage} />
        <ProtectedRoute path="/hgnhelp" exact component={HelpPage} />
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
          path="/job-analytics-competitive-roles"
          exact
          component={JobAnalyticsCompetitiveRolesPage}
          fallback
        />
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
          path="/pr-dashboard"
          exact
          component={PRDashboard}
          fallback
          routePermissions={RoutePermissions.prDashboard}
        />
        <ProtectedRoute
          path="/reports"
          exact
          component={Reports}
          fallback
          routePermissions={RoutePermissions.reports}
        />
        <ProtectedRoute path="/teamlocations" exact component={TeamLocations} />
        <ProtectedRoute path="/job-analytics" component={JobAnalyticsPage} fallback />
        <ProtectedRoute
          path="/projects"
          exact
          component={Projects}
          fallback
          allowedRoles={[UserRole.Administrator, UserRole.Owner, UserRole.Manager]}
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
        <ProtectedRoute path="/job-application" exact component={JobApplicationForm} />
        <ProtectedRoute path="/popularity" component={PopularityTimelineChart} fallback />;
        <ProtectedRoute
          path="/popularity-enhanced"
          component={EnhancedPopularityTimelineChart}
          fallback
        />
        <ProtectedRoute path="/analytics/months-pledged" component={MonthsPledgedChart} fallback />
        <ProtectedRoute
          path="/jobanalytics"
          exact
          component={HoursPledgedChart}
          allowedRoles={[UserRole.Administrator, UserRole.Owner]}
        />
        <ProtectedRoute
          path="/communityportal/activity/:activityId/feedback"
          exact
          component={FeedbackRatingEntry}
          fallback
          allowedRoles={[
            UserRole.Administrator,
            UserRole.Owner,
            UserRole.Manager,
            UserRole.CoreTeam,
            UserRole.Mentor,
            UserRole.Volunteer,
            UserRole.Learner,
            UserRole.Guest,
            UserRole.Staff,
            UserRole.Participant,
            UserRole.Reviewer,
            UserRole.Contributor,
            UserRole.Editor,
            UserRole.Publisher,
            UserRole.Subscriber,
            UserRole.Author,
            UserRole.Member,
            UserRole.Organizer,
            UserRole.Facilitator,
          ]}
        />
        <ProtectedRoute
          path="/application/analytics"
          exact
          component={AnalyticsDashboard}
          fallback
          // allowedRoles={[UserRole.Administrator, UserRole.Owner]}
        />
        {/* ----- BEGIN BM Dashboard Routing ----- */}
        <BMProtectedRoute path="/bmdashboard" exact component={BMDashboard} />
        <Route path="/bmdashboard/login" component={BMLogin} />
        <Route path="/LessonsLearntChart" component={LessonsLearntChart} />
        <Route path="/UtilizationChart" component={UtilizationChart} />
        <Route path="/mostsusceptibletoolschart" component={SimpleToolChart} />
        <Route path="/projectglobaldistribution" component={ProjectsGlobalDistribution} />
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
        <BMProtectedRoute path="/bmdashboard/returned-late-chart" component={ReturnedLateChart} />
        <BMProtectedRoute path="/bmdashboard/inventory/types" component={CheckTypes} />
        <BMProtectedRoute path="/bmdashboard/equipment" fallback exact component={EquipmentList} />
        <BMProtectedRoute path="/bmdashboard/equipment/:equipmentId" component={EquipmentDetail} />
        <BMProtectedRoute path="/bmdashboard/consumables" fallback component={ConsumableListView} />
        <BMProtectedRoute path="/bmdashboard/materials" fallback component={MaterialListView} />
        <BMProtectedRoute path="/bmdashboard/consumables/add" fallback component={AddConsumable} />
        <BMProtectedRoute path="/bmdashboard/reusables" fallback component={ReusableListView} />
        {/* Note: equipment detail route defined above; duplicates removed */}
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
        <BMProtectedRoute path="/bmdashboard/injurychart" fallback exact component={InjuryChart} />
        <BMProtectedRoute
          path="/bmdashboard/injuries-severity"
          fallback
          exact
          component={InjurySeverityDashboard}
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
        {/* PR Analytics Dashboard */}
        <Route path="/pull-request-analytics/reviews-insight" component={ReviewsInsight} />
        {/* Community Portal Routes */}
        <CPProtectedRoute path="/communityportal" exact component={CPDashboard} />
        <Route path="/communityportal/login" component={CPLogin} />
        {/* ----- Community Calendar Routing ----- */}
        <CPProtectedRoute path="/communityportal/calendar" exact component={CommunityCalendar} />
        <CPProtectedRoute path="/communityportal/activities" exact component={ActivityList} />
        <CPProtectedRoute
          path="/communityportal/ActivityAttendance"
          exact
          component={ActivityAttendance}
        />
        <CPProtectedRoute
          path="/communityportal/activities/Feedbackform/:eventId/:email"
          component={Feedbackform}
        />
        <CPProtectedRoute
          path="/communityportal/activities/FollowUpEmailTemplate"
          component={FollowUpEmailTemplate}
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
        <CPProtectedRoute path="/communityportal/ActivityAgenda" exact component={ActivityAgenda} />
        <CPProtectedRoute
          path="/communityportal/activity/:activityId/engagement/Comments"
          exact
          component={ActivityComments}
        />
        <CPProtectedRoute
          path="/communityportal/activity/:activityId/resourcesusage"
          exact
          component={ResourcesUsage}
        />
        <CPProtectedRoute
          path="/communityportal/activity/:activityId/resources"
          exact
          component={ResourceManagement}
          fallback
          routePermissions={RoutePermissions.resourceManagement}
        />
        {/* Listing and Bidding Routes */}
        <LBProtectedRoute path="/lbdashboard" exact component={LBDashboard} />
        <LBProtectedRoute path="/lbdashboard/listOverview/:id" exact component={ListOveriew} />
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
        <EPProtectedRoute
          path="/educationportal/evaluation-results"
          exact
          component={EvaluationResultsWrapper}
        />
        <Route path="/educationportal/login" component={EPLogin} />
        <Route path="/educationportal/InsightWidget" component={InsightWidget} />
        <Route path="/educationportal/lesson-library" exact component={BrowseLessonPlan} />
        <EPProtectedRoute path="/educationportal/tasks/upload" exact component={WriteTaskUpload} />
        <Route path="/educationportal/reportButton" component={ReportDownloadButton} />
        <Route path="/educator/groups" exact component={GroupList} />
        <EPProtectedRoute
          path="/educationportal/tasks/intermediate"
          exact
          component={IntermediateTaskList}
        />
        <EPProtectedRoute path="/educationportal/dashboard" exact component={StudentDashboard} />
        <EPProtectedRoute path="/educationportal/student/tasks" exact component={StudentTasks} />
        <EPProtectedRoute path="/educationportal/student/tasks/:id" exact component={TaskDetails} />
        <Redirect exact from="/student/tasks" to="/educationportal/student/tasks" />
        <Redirect exact from="/student/tasks/:id" to="/educationportal/student/tasks/:id" />
        {/* PR Analytics Dashboard */}
        <Route path="/pull-request-analytics/reviews-insight" component={ReviewsInsight} />
        <CPProtectedRoute
          path="/communityportal/reports/event/personalization"
          exact
          component={EventStats}
        />
        <CPProtectedRoute
          path="/communityportal/reports/participation"
          exact
          component={EventParticipation}
        />
        <CPProtectedRoute
          path="/communityportal/reports/resourceusage"
          exact
          component={ResourceUsage}
        />
        <CPProtectedRoute
          path="/communityportal/database/design"
          exact
          component={DatabaseDesign}
        />
        {/* <BMProtectedRoute path="/bmdashboard/tools/add" exact component={AddTool} /> */}
        {/* Temporary route to redirect all subdirectories to login if unauthenticated */}
        {/* <BMProtectedRoute path="/bmdashboard/:path" component={BMDashboard} /> */}
        {/* ----- END BM Dashboard Routing ----- */}
        <Route path="/login" component={Login} />
        <Route path="/forgotpassword" component={ForgotPassword} />
        <Route path="/subscribe" component={SubscribePage} />
        <Route path="/unsubscribe" component={UnsubscribePage} />
        <Route path="/collaboration" component={Collaboration} />
        <Route path="/suggestedjobslist" component={SuggestedJobsList} />
        <ProtectedRoute path="/jobformbuilder" fallback component={JobFormBuilder} />
        <ProtectedRoute path="/infoCollections" component={EditableInfoModal} />
        <ProtectedRoute path="/userprofile/:userId" fallback component={UserProfile} />
        <ProtectedRoute path="/userprofileedit/:userId" component={UserProfileEdit} />
        <ProtectedRoute path="/updatepassword/:userId" component={UpdatePassword} />
        <ProtectedRoute path="/promotiontable" exact component={PromotionTable} />
        <ProtectedRoute path="/memberlist" exact component={MemberList} />
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
        <ProtectedRoute path="/hgn/profile/skills" exact component={UserSkillsProfile} />
        <ProtectedRoute
          path="/hgn/profile/skills/:userId?"
          exact
          fallback
          component={UserSkillsProfile}
          allowedRoles={[UserRole.Administrator, UserRole.CoreTeam, UserRole.Owner]}
          routePermissions={RoutePermissions.accessHgnSkillsDashboard}
        />
        {/* Alternative route for HGN Skills Profile */}
        <ProtectedRoute
          path="/hgn-skills/profile/:userId?"
          exact
          fallback
          component={UserSkillsProfile}
          allowedRoles={[UserRole.Administrator, UserRole.CoreTeam, UserRole.Owner]}
          routePermissions={RoutePermissions.accessHgnSkillsDashboard}
        />
        <ProtectedRoute path="/topcommunitymembers" exact component={DisplayTeamMemberDetails} />
        <ProtectedRoute path="/tsaformpage1" exact component={TSAFormPage1} />
        <ProtectedRoute path="/tsaformpage2" exact component={TSAFormPage2} />
        <ProtectedRoute path="/tsaformpage3" exact component={TSAFormPage3} />
        <ProtectedRoute path="/tsaformpage4" exact component={TSAFormPage4} />
        <ProtectedRoute path="/tsaformpage5" exact component={TSAFormPage5} />
        <ProtectedRoute path="/tsaformpage6" exact component={TSAFormPage6} />
        <ProtectedRoute path="/tsaformpage7" exact component={TSAFormPage7} />
        <ProtectedRoute path="/tsaformpage8" exact component={TSAFormPage8} />
        <ProtectedRoute path="/ExperienceDonutChart" component={ExperienceDonutChart} fallback />
        <ProtectedRoute path="/prPromotionsPage" component={PRPromotionsPage} fallback />
        <ProtectedRoute path="/" exact component={Dashboard} />
        {/* ----- PR Dashboard  ----- */}
        <ProtectedRoute
          path="/pr-dashboard/promotion-eligibility"
          exact
          component={PromotionEligibility}
        />
        {/* /*  for support team*/}
        <Route path="/support/login" component={SupportLogin} />
        <Route path="/support/dashboard" component={SupportDashboard} />
        <Route path="/support/log/:studentId" component={SupportLogViewer} />
        <ProtectedRoute
          path="/pr-team-analytics/popular-prs"
          exact
          component={PRReviewTeamAnalytics}
        />
        <Route path="*" component={NotFoundPage} />
      </Switch>
    </>
  </Switch>
);
