/* eslint-disable no-param-reassign */
/* eslint-disable no-alert */
/* eslint-disable no-console */
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import tipStyles from './TimeEntryTooltip.module.css';
import TooltipPortal from "./TooltipPortal";
import {
  Container,
  Row,
  Col,
  Card,
  CardTitle,
  CardSubtitle,
  CardHeader,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import './Timelog.css';
import styles from './followup-modal.module.css';
import classnames from 'classnames';
import { connect, useSelector } from 'react-redux';
import moment from 'moment';
import ReactTooltip from 'react-tooltip';
import ActiveCell from '~/components/UserManagement/ActiveCell';
import ProfileNavDot from '~/components/UserManagement/ProfileNavDot';
import TeamMemberTasks from '~/components/TeamMemberTasks';
import { boxStyle, boxStyleDark } from '~/styles';
import { formatDate } from '~/utils/formatDate';
import EditableInfoModal from '~/components/UserProfile/EditableModal/EditableInfoModal';
import { cantUpdateDevAdminDetails } from '~/utils/permissions';
import axios from 'axios';
import {
  DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY,
  DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY,
  PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE,
} from '~/utils/constants';
import PropTypes from 'prop-types';
import { getTimeEntriesForWeek, getTimeEntriesForPeriod } from '../../actions/timeEntries';
import { getUserProfile, updateUserProfile, getUserTasks } from '../../actions/userProfile';
import { getUserProjects } from '../../actions/userProjects';
import { getAllRoles } from '../../actions/role';
import { getBadgeCount, resetBadgeCount } from '../../actions/badgeManagement';
import TimeEntryForm from './TimeEntryForm';
import TimeEntry from './TimeEntry';
import EffortBar from './EffortBar';
import SummaryBar from '../SummaryBar/SummaryBar';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import LoadingSkeleton from '../common/SkeletonLoading';
import hasPermission from '../../utils/permissions';
import WeeklySummaries from './WeeklySummaries';
import TimestampsTab from './TimestampsTab';
import Badge from '../Badge';
import { ENDPOINTS } from '~/utils/URL';

// startOfWeek returns the date of the start of the week based on offset. Offset is the number of weeks before.
// For example, if offset is 0, returns the start of this week. If offset is 1, returns the start of last week.
const startOfWeek = offset => {
  return moment()
    .tz('America/Los_Angeles')
    .startOf('week')
    .subtract(offset, 'weeks')
    .format('YYYY-MM-DD');
};

// endOfWeek returns the date of the end of the week based on offset. Offset is the number of weeks before.
// For example, if offset is 0, returns the end of this week. If offset is 1, returns the end of last week.
const endOfWeek = offset => {
  return moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .subtract(offset, 'weeks')
    .format('YYYY-MM-DD');
};

function Timelog(props) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const location = useLocation();

  const normalizeNotes = (raw) => {
    if (!raw) return '';
    let s = String(raw);
  
    // Temporary line-break markers
    s = s.replace(/<br\s*\/?>/gi, '\n')
         .replace(/<\/p>\s*<p>/gi, '\n')
         .replace(/<\/?p[^>]*>/gi, '');
  
    // Strip remaining tags
    s = s.replace(/<\/?[^>]+>/g, '');
  
    // Decode entities using the browser
    const txt = document.createElement('textarea');
    txt.innerHTML = s;
    s = txt.value;
  
    // Linkify URLs
    s = s.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');
  
    // Convert newlines back to <br> for pdfmake line breaks
    s = s.replace(/\n/g, '<br/>');
  
    return s;
  };

  // Escape minimal HTML to keep pdf clean
const escapeHtml = s =>
  String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

// Return the raw period entries respecting the same filter as the UI
const getFilteredPeriodData = () => {
  const data = Array.isArray(timeEntries?.period) ? timeEntries.period.filter(entryBelongsToDisplayed) : [];
  if (!timeLogState.projectsOrTasksSelected?.length || timeLogState.projectsOrTasksSelected.includes('all')) {
    return data;
  }
  return data.filter(entry =>
    timeLogState.projectsOrTasksSelected.includes(entry.projectId) ||
    timeLogState.projectsOrTasksSelected.includes(entry.taskId)
  );
};

// Build simple HTML table string (easy for html-to-pdfmake)
const formatPeriodHtml = (rows) => {
  const title =
    `<h1 style="margin:0 0 12px 0; font-size:22px;">Time Log Report</h1>
     <div style="margin: 0 0 4px 0;"><b>Range:</b> ${formatDate(timeLogState.fromDate)} – ${formatDate(timeLogState.toDate)}</div>
     <div style="margin: 0 0 12px 0;"><b>User:</b> ${escapeHtml(displayUserProfile?.firstName)} ${escapeHtml(displayUserProfile?.lastName)}</div>`;

     const thead =
  `<thead>
     <tr>
       <th style="padding:6px;border:1px solid #ddd; width: 10%;">Date</th>
       <th style="padding:6px;border:1px solid #ddd; width: 15%;">Project</th>
       <th style="padding:6px;border:1px solid #ddd; width: 10%;">Task</th>
       <th style="padding:6px;border:1px solid #ddd; width: 10%;">Tangible</th>
       <th style="padding:6px;border:1px solid #ddd; width: 10%;">Time (h:m)</th>
       <th style="padding:6px;border:1px solid #ddd; width: 45%;">Notes</th>
     </tr>
   </thead>`;


  const tbody = rows.map((e, i) => {
    console.log(e)
    const dateStr = e.dateOfWork ? formatDate(e.dateOfWork) : '';
    const proj = escapeHtml(e.projectName || '');
    const task = escapeHtml(e.taskName || '');
    const tangible = e.isTangible ? 'Yes' : 'No';
    const hrs = Number(e.hours ?? 0);
    const mins = Number(e.minutes ?? 0);
    const notesHtml = normalizeNotes(e.notes || '');

    // subtle zebra striping
    const rowBg = i % 2 === 0 ? 'background:#ffffff;' : 'background:#fafafa;';

    return `<tr>
  <td style="padding:6px;border:1px solid #ddd; width: 10%;">${dateStr}</td>
  <td style="padding:6px;border:1px solid #ddd; width: 15%;">${proj}</td>
  <td style="padding:6px;border:1px solid #ddd; width: 10%;">${task}</td>
  <td style="padding:6px;border:1px solid #ddd; width: 10%;">${tangible}</td>
  <td style="padding:6px;border:1px solid #ddd; width: 10%;">${hrs}:${mins.toString().padStart(2, '0')}</td>
  <td style="padding:6px;border:1px solid #ddd; width: 45%;">${notesHtml}</td>
</tr>`;
  }).join('');

  const table =
    `<table style="width:100%; border-collapse:collapse; font-size:11px; margin-top:8px;">
       ${thead}
       <tbody>${tbody}</tbody>
     </table>`;

  // Totals footer
  const summarize = rows => rows.reduce((acc, e) => {
    const t = Number(e.hours || 0) + Number(e.minutes || 0) / 60;
    return { total: acc.total + t, tangible: acc.tangible + (e.isTangible ? t : 0) };
  }, { total: 0, tangible: 0 });

  const { total, tangible } = summarize(rows);

  const footer =
    `<div style="margin-top:12px; font-size:12px;">
       <b>Total Tangible Hours:</b> ${tangible.toFixed(2)}
       &nbsp;&nbsp;|&nbsp;&nbsp;
       <b>Total Hours:</b> ${total.toFixed(2)}
     </div>`;

  return `${title}${table}${footer}`;
};


const downloadPeriodPdf = () => {
  const rows = getFilteredPeriodData();
  if (!rows.length) {
    alert('No time entries found for this date range/filter.');
    return;
  }
  const html = formatPeriodHtml(rows);
  const content = htmlToPdfmake(html, { tableAutoSize: true });

  const generatedAt = moment().tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm z');

  const docDefinition = {
    content: [content],
    // Add a clean page header/footer for all pages
    header: (currentPage) => ({
      text: currentPage === 1 ? '' : 'Time Log Report',
      alignment: 'right',
      margin: [24, 12, 24, 0],
      fontSize: 9,
      color: '#666',
    }),
    footer: (currentPage, pageCount) => ({
      columns: [
        { text: `Generated ${generatedAt}`, alignment: 'left', margin: [24, 0, 0, 12], fontSize: 8, color: '#888' },
        { text: `Page ${currentPage} of ${pageCount}`, alignment: 'right', margin: [0, 0, 24, 12], fontSize: 8, color: '#888' },
      ],
    }),
    pageMargins: [24, 36, 24, 42],
    defaultStyle: { fontSize: 10, lineHeight: 1.2 },
    styles: {
      'html-h1': { fontSize: 22, bold: true, margin: [0, 0, 8, 6] },
      'html-h3': { fontSize: 14, bold: true, margin: [0, 0, 6, 6] },
      'html-a': { color: '#1d4ed8' }, // link color
    },
  };

  const fileName = `Timelog_${formatDate(timeLogState.fromDate)}_to_${formatDate(timeLogState.toDate)}.pdf`;
  pdfMake.createPdf(docDefinition).download(fileName);
};


  // Main Function component
  const canPutUserProfileImportantInfo = props.hasPermission('putUserProfileImportantInfo');

  // access the store states
  const {
    authUser,
    displayUserProfile,
    timeEntries,
    roles,
    displayUserProjects,
    disPlayUserTasks,
    userId,
  } = props;

  const initialState = {
    timeEntryFormModal: false,
    summary: false,
    activeTab: 0,
    projectsOrTasksSelected: ['all'],
    fromDate: startOfWeek(0),
    toDate: endOfWeek(0),
    infoModal: false,
    information: '',
    currentWeekEffort: 0,
    isTimeEntriesLoading: true,
    badgeCount: 0,
  };

  const intangibletimeEntryFormData = {
    isTangible: false,
    personId: displayUserProfile._id,
  };

  const [initialTab, setInitialTab] = useState(null);
  const [projectOrTaskOptions, setProjectOrTaskOptions] = useState(null);
  const [currentWeekEntries, setCurrentWeekEntries] = useState(null);
  const [lastWeekEntries, setLastWeekEntries] = useState(null);
  const [beforeLastEntries, setBeforeLastEntries] = useState(null);
  const [periodEntries, setPeriodEntries] = useState(null);
  const [summaryBarData, setSummaryBarData] = useState(null);
  const [timeLogState, setTimeLogState] = useState(initialState);
  const isNotAllowedToEdit = cantUpdateDevAdminDetails(displayUserProfile.email, authUser.email);

  const { userId: urlId } = useParams();
  const [userprofileId, setUserProfileId] = useState(urlId || authUser.userid);

  const checkSessionStorage = () => JSON.parse(sessionStorage.getItem('viewingUser')) ?? false;
  const [viewingUser, setViewingUser] = useState(checkSessionStorage());
  const getUserId = () => {
    try {
      if (viewingUser) {
        return viewingUser.userId;
      }
      if (userId != null) {
        return userId;
      }
      return authUser.userid;
    } catch (error) {
      return null;
    }
  };

  const doesUserHaveTaskWithWBS = userHaveTask => {
    return userHaveTask.reduce((acc, item) => {
      const hasIncompleteTask = item.resources.some(
        val =>
          (viewingUser.userId === val.userID || val.userID === userprofileId) &&
          val.completedTask === false,
      );
      if (hasIncompleteTask) acc.push(item);
      return acc;
    }, []);
  };

  const [displayUserId, setDisplayUserId] = useState(getUserId());
  const isAuthUser = authUser.userid === displayUserId;
  const fullName = `${displayUserProfile.firstName} ${displayUserProfile.lastName}`;

  const displayedId = displayUserId || displayUserProfile?._id;

  const entryBelongsToDisplayed = (e) => {
    const pid = e?.personId ?? e?.userId ?? e?.person?._id ?? e?.person?._id ?? e?.person?._id;
    return String(pid) === String(displayedId);
  };
  
  const tabMapping = {
    '#tasks': 0,
    '#currentWeek': 1,
    '#lastWeek': 2,
    '#beforeLastWeek': 3,
    '#dateRange': 4,
    '#weeklySummaries': 5,
    '#timestamps': 6,
    '#badgesearned': 7,
  };

  const defaultTab = data => {
    const userHaveTask = doesUserHaveTaskWithWBS(data);
    // change default to time log tab(1) in the following cases:
    const { role } = authUser;
    let tab = 0;
    /* To set the Task tab as defatult this.userTask is being watched.
    Accounts with no tasks assigned to it return an empty array.
    Accounts assigned with tasks with no wbs return and empty array.
    Accounts assigned with tasks with wbs return an array with that wbs data.
    The problem: even after unassigning tasks the array keeps the wbs data.
    That breaks this feature. Necessary to check if this array should keep data or be reset when unassinging tasks.*/

    // That breaks this feature. Necessary to check if this array should keep data or be reset when unassigning tasks.

// if user role is volunteer or core team and they don't have tasks assigned, then default tab is timelog.
if (role === 'Volunteer' && userHaveTask.length > 0) {
  tab = 0;
} else if (role === 'Volunteer' && userHaveTask.length === 0) {
  tab = 1;
} else {
  tab = null;
}

 
    // Sets active tab to "Current Week Timelog" when the Progress bar in Leaderboard is clicked
    if (!props.isDashboard) {
      tab = 1;
    }

    if (location.hash) {
      const redirectToTab = tabMapping[location.hash];
      if (redirectToTab !== undefined) {
        tab = redirectToTab;
      }
    }
    return tab;
  };

  useEffect(() => {
    if (initialTab != null && !location.hash) {
      changeTab(initialTab);
    }
  }, [initialTab, location.hash]); // This effect will run whenever the hash changes

/* ---------------- methods -------------- */
const updateTimeEntryItems = () => {
  const allTimeEntryItems = generateAllTimeEntryItems();
  setCurrentWeekEntries(allTimeEntryItems[0]);
  setLastWeekEntries(allTimeEntryItems[1]);
  setBeforeLastEntries(allTimeEntryItems[2]);
  setPeriodEntries(allTimeEntryItems[3]);
};

const generateAllTimeEntryItems = () => {
  const currentWeekEntries = generateTimeEntries(timeEntries.weeks[0], 0);
  const lastWeekEntries = generateTimeEntries(timeEntries.weeks[1], 1);
  const beforeLastEntries = generateTimeEntries(timeEntries.weeks[2], 2);
  const periodEntries = generateTimeEntries(timeEntries.period, 3);
  return [currentWeekEntries, lastWeekEntries, beforeLastEntries, periodEntries];
};


  const generateTimeEntries = (data, tab) => {
    data = (Array.isArray(data) ? data : []).filter(entryBelongsToDisplayed);
    if (!timeLogState.projectsOrTasksSelected.includes('all')) {
      // eslint-disable-next-line no-param-reassign
      data = data.filter(
        entry =>
          timeLogState.projectsOrTasksSelected.includes(entry.projectId) ||
          timeLogState.projectsOrTasksSelected.includes(entry.taskId),
      );
    }
    return data.map(entry => (
      /**
       * Need to pass the projects and tasks of the display user here by props drilling,
       * because if access in TimeEntry component, if only any of two states (userProjects and userTasks)
       * changed, it will trigger a rerender of TimeEntry, then userProject and userTasks wouldn't
       * be for the same display user. But here loadAsyncData will make sure TimeLog will rerender only
       * when all states in store are updated to the same display user.
       *  */
      <TimeEntry
        from="WeeklyTab"
        data={entry}
        displayYear
        key={entry._id}
        timeEntryUserProfile={displayUserProfile}
        displayUserProjects={displayUserProjects}
        displayUserTasks={disPlayUserTasks}
        tab={tab}
      />
    ));
  };

  const loadAsyncData = async uid => {
    // load the timelog data
    setTimeLogState({ ...timeLogState, isTimeEntriesLoading: true });
    try {
      await Promise.all([
        props.getUserProfile(uid),
        props.getTimeEntriesForWeek(uid, 0),
        props.getTimeEntriesForWeek(uid, 1),
        props.getTimeEntriesForWeek(uid, 2),
        props.getTimeEntriesForPeriod(uid, timeLogState.fromDate, timeLogState.toDate),
        props.getAllRoles(),
        props.getUserProjects(uid),
        props.getUserTasks(uid),
      ]);

      const url = ENDPOINTS.TASKS_BY_USERID(uid);
      const res = await axios.get(url);

      const data = res.data.length > 0 ? res.data : [];
      const mappedHash = tabMapping[location.hash];

      if (mappedHash !== undefined) {
        // If the URL has a known hash, open that tab immediately
        setTimeLogState(s => ({
          ...s,
          isTimeEntriesLoading: false,
          activeTab: mappedHash,
        }));
        setInitialTab(null); // so the initialTab effect won’t override
      } else {
        // No hash → fall back to your existing default logic
        setTimeLogState(s => ({ ...s, isTimeEntriesLoading: false }));
        setInitialTab(defaultTab(data));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const toggle = () => {
    if (isNotAllowedToEdit) {
      if (displayUserProfile?.email === DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY) {
        alert(DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY);
      } else {
        alert(PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE);
      }
      return;
    }
    setTimeLogState({ ...timeLogState, timeEntryFormModal: !timeLogState.timeEntryFormModal });
  };

  const showSummary = isAuth => {
    if (isAuth) {
      setTimeLogState({ ...timeLogState, summary: true });
      setTimeout(() => {
        const elem = document.getElementById('weeklySum');
        if (elem) {
          const yOffset = elem.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: yOffset, behavior: 'smooth' });
        }
      }, 150);
    }
  };

  const toggleSummary = summaryState => {
    setTimeLogState({ ...timeLogState, summary: summaryState });
  };

  const openInfo = () => {
    const str = `This is the One Community time log! It is used to show a record of all the time you have volunteered with One Community, what you’ve done for each work session, etc.
    * “Add Time Entry” Button: Clicking this button will only allow you to add “Intangible” time. This is for time not related to your tasks OR for time you need a manager to change to “Tangible” for you because you were working away from your computer or made a mistake and are trying to manually log time. Intangible time will not be counted towards your committed time for the week or your tasks. “Intangible” time changed by a manager to “Tangible” time WILL be counted towards your committed time for the week and whatever task it is logged towards. For Blue Square purposes, changing Intangible Time to Tangible Time for any reason other than work away from your computer will count and be recorded in the system the same as a time edit.
    * Viewing Past Work: The current week is always shown by default but past weeks can also be viewed by clicking the tabs or selecting a date range.
    * Sorting by Project and Task: All projects and tasks are shown by default but you can also choose to sort your time log by Project or Task.
    * Notes: The “Notes” section is where you write a summary of what you did during the time you are about to log. You must write a minimum of 10 words because we want you to be specific. You must include a link to your work so others can easily confirm and review it.
    * Tangible Time: By default, the “Tangible” box is clicked. Tangible time is any time spent working on your Projects/Tasks and counts towards your committed time for the week and also the time allocated for your task.
    * Intangible Time: Clicking the Tangible box OFF will mean you are logging “Intangible Time.” This is for time not related to your tasks OR for time you need a manager to change to “Tangible” for you because you were working away from your computer or made a mistake and are trying to manually log time. Intangible time will not be counted towards your committed time for the week or your tasks. “Intangible” time changed by a manager to “Tangible” time WILL be counted towards your committed time for the week and whatever task it is logged towards. For Blue Square purposes, changing Intangible Time to Tangible Time for any reason other than work away from your computer will count and be recorded in the system the same as a time edit. `;

    setTimeLogState({
      ...timeLogState,
      infoModal: !timeLogState.infoModal,
      information: str.split('\n').map(item => <p key={item.id}>{item}</p>),
    });
  };

  const changeTab = tab => {
    if (tab === 7) {
      props.resetBadgeCount(displayUserId);
    }

    // Clear the hash to trigger the useEffect on hash change
    // if (location.hash) {
    //   window.location.hash = '';
    // }

    setTimeLogState({
      ...timeLogState,
      activeTab: tab,
    });
  };

  const handleInputChange = e => {
    setTimeLogState({ ...timeLogState, [e.target.name]: e.target.value });
  };

  const handleSearch = e => {
    // check if the toDate is before the fromDate
    if (moment(timeLogState.fromDate).isAfter(moment(timeLogState.toDate))) {
      alert('Invalid Date Range: the From Date must be before the To Date');
    } else {
      e.preventDefault();
      props.getTimeEntriesForPeriod(displayUserId, timeLogState.fromDate, timeLogState.toDate);
    }
  };

  const calculateTotalTime = (data, isTangible) => {
    const filteredData = (Array.isArray(data) ? data : [])
    .filter(entryBelongsToDisplayed)
    .filter(entry => entry.isTangible === isTangible);
    const reducer = (total, entry) => total + Number(entry.hours) + Number(entry.minutes) / 60;
    return filteredData.reduce(reducer, 0);
  };

  const renderViewingTimeEntriesFrom = () => {
    if (
      timeLogState.activeTab === 0 ||
      timeLogState.activeTab === 5 ||
      timeLogState.activeTab === 6 ||
      timeLogState.activeTab === 7
    ) {
      return null;
    }
    if (timeLogState.activeTab === 4) {
      return (
        <p className="ml-1 responsive-font-size text-dark" style={{ textAlign: 'left' }}>
  Viewing time Entries from <b>{formatDate(timeLogState.fromDate)}</b> to{' '}
  <b>{formatDate(timeLogState.toDate)}</b>
</p>

      );
    }
    return (
      <p className="ml-1 responsive-font-size text-dark" style={{ textAlign: 'left' }}>
  Viewing time Entries from <b>{formatDate(startOfWeek(timeLogState.activeTab - 1))}</b> to{' '}
  <b>{formatDate(endOfWeek(timeLogState.activeTab - 1))}</b>
</p>

    );
  };

  const makeBarData = uid => {
    // pass the data to summary bar
    const weekEffort = calculateTotalTime(timeEntries.weeks[0], true);
    setTimeLogState({ ...timeLogState, currentWeekEffort: weekEffort });
    if (props.isDashboard) {
      props.passSummaryBarData({ personId: uid, tangibletime: weekEffort });
    } else {
      setSummaryBarData({ personId: uid, tangibletime: weekEffort });
    }
  };

  const buildOptions = () => {
    const projectsObject = {};
    const options = [
      <option className="responsive-font-size" value="all" key="TimeLogDefaultProjectOrTask">
        Select Project/Task (all)
      </option>,
    ];

    // Build the projectsObject structure
    displayUserProjects.forEach(project => {
      const { projectId } = project;
      projectsObject[projectId] = {
        ...project,
        WBSObject: {},
      };
    });

    disPlayUserTasks.forEach(task => {
      const { projectId, wbsId, _id: taskId, wbsName, projectName } = task;
      if (!projectsObject[projectId]) {
        projectsObject[projectId] = {
          projectName,
          WBSObject: {
            [wbsId]: {
              wbsName,
              taskObject: { [taskId]: task },
            },
          },
        };
      } else if (!projectsObject[projectId].WBSObject[wbsId]) {
        projectsObject[projectId].WBSObject[wbsId] = {
          wbsName,
          taskObject: { [taskId]: task },
        };
      } else {
        projectsObject[projectId].WBSObject[wbsId].taskObject[taskId] = task;
      }
    });

    // Convert projectsObject to options
    Object.entries(projectsObject).forEach(([projectId, project]) => {
      const { projectName, WBSObject } = project;

      // Add project option
      options.push(
        <option className="responsive-font-size" value={projectId} key={`TimeLog_${projectId}`}>
          {projectName}
        </option>,
      );

      Object.entries(WBSObject).forEach(([wbsId, WBS]) => {
        const { wbsName, taskObject } = WBS;

        // Add WBS option
        options.push(
          <option
            value={wbsId}
            key={`TimeLog_${wbsId}`}
            disabled
            className={`${darkMode ? 'text-white-50' : ''} responsive-font-size`}
          >
            {`\u2003WBS: ${wbsName}`}
          </option>,
        );

        Object.entries(taskObject).forEach(([taskId, task]) => {
          const { taskName } = task;

          // Add task option
          options.push(
            <option className="responsive-font-size" value={taskId} key={`TimeLog_${taskId}`}>
              {`\u2003\u2003 ↳ ${taskName}`}
            </option>,
          );
        });
      });
    });

    return options;
  };

  const generateTimeLogItems = uid => {
    // build the time log component
    const options = buildOptions();
    setProjectOrTaskOptions(options);
    updateTimeEntryItems();
    makeBarData(uid);
  };

  const handleStorageEvent = () => {
    const sessionStorageData = checkSessionStorage();
    setViewingUser(sessionStorageData || false);
    if (sessionStorageData && sessionStorageData.userId !== authUser.userId) {
      setDisplayUserId(sessionStorageData.userId);
    }
  };

  /* ---------------- useEffects -------------- */

  useEffect(() => {
    const mapped = tabMapping[location.hash];
    if (mapped !== undefined) {
      setTimeLogState(s => ({ ...s, activeTab: mapped }));
    }
  }, [location.hash]);

  // Update user ID if it changes in the URL
  useEffect(() => {
    if (urlId) {
      setUserProfileId(urlId);
    }
  }, [urlId]);

  /**
     * made a change here to reset the user viewing to current user and not the displayed user id we were testing
     * component reloads when we click the x icon to close the current viewing
    */

  useEffect(() => {
    // Reset displayUserId when switching btw users
    const newUserId = getUserId();
    if (displayUserId !== newUserId) {
      setDisplayUserId(newUserId);
      loadAsyncData(newUserId); // Reload data for the prev viewing user
    }
  }, [userprofileId, viewingUser]);

  useEffect(() => {
    props.getBadgeCount(displayUserId);
  }, [displayUserId, props]);


  useEffect(() => {
    // Build the time log after new data is loaded
    if (!timeLogState.isTimeEntriesLoading) {
      generateTimeLogItems(displayUserId);
    }
  }, [timeLogState.isTimeEntriesLoading, timeEntries, displayUserId]);

  useEffect(() => {
    loadAsyncData(displayUserId);
  }, [displayUserId]);

  useEffect(() => {
    // Filter the time entries
    updateTimeEntryItems();
  }, [timeLogState.projectsOrTasksSelected]);

  useEffect(() => {
    setDisplayUserId(getUserId());
    // Listens to sessionStorage changes, when setting viewingUser in leaderboard, an event is dispatched called storage. This listener will catch it and update the state.
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const containerStyle = () => {
    if (darkMode) {
      return props.isDashboard ? {} : { padding: '0 15px 300px 15px' };
    }
    return {};
  };

return (
  <div
    className={`container-timelog-wrapper ${darkMode ? 'bg-oxford-blue' : ''}`}
    style={darkMode ? (!props.isDashboard ? { padding: "0 15px 300px 15px" } : {}) : {}}
  >

      {!props.isDashboard ? (
        <Container fluid>
          <SummaryBar
            displayUserId={displayUserId}
            toggleSubmitForm={() => showSummary(isAuthUser)}
            role={authUser}
            summaryBarData={summaryBarData}
          />
          <br />
        </Container>
      ) : (
        <Container style={{ textAlign: 'right', minWidth: '100%' }}>
          {props.isDashboard ? null : (
            <EditableInfoModal
              areaName="DashboardTimelog"
              areaTitle="Timelog"
              fontSize={30}
              isPermissionPage
              role={authUser.role}
              darkMode={darkMode}
            />
          )}
        </Container>
      )}

      {timeLogState.isTimeEntriesLoading ? (
        <LoadingSkeleton template="Timelog" />
      ) : (
        <div className={`${!props.isDashboard ? 'timelogPageContainer' : 'ml-3 min-width-100'}`}>
          {timeLogState.summary ? (
            <div className="my-2">
              <div id="weeklySum">
                <WeeklySummary
                  displayUserId={displayUserId}
                  setPopup={toggleSummary}
                  darkMode={darkMode}
                />
              </div>
            </div>
          ) : null}
          <Row style={{ minWidth: '100%' }}>
            <Col md={12} className="px-0 mx-0">
              <Card className={darkMode ? 'border-0' : ''}>
                <CardHeader
                  className={
                    darkMode
                      ? 'card-header-shadow-dark bg-space-cadet text-light'
                      : 'card-header-shadow'
                  }
                >
                  <Row style={{ minWidth: '100%' }} className="px-0 mx-0">
                    <Col style={{ minWidth: '100%' }} className="px-0 mx-0">
                      <CardTitle tag="h4">
                        <div className="d-flex align-items-center">
                          <span className="taskboard-header-title mb-1 mr-2">
                            Tasks and Timelogs
                          </span>
                          <EditableInfoModal
                            areaName="TasksAndTimelogInfoPoint"
                            areaTitle="Tasks and Timelogs"
                            fontSize={24}
                            isPermissionPage
                            role={authUser.role} // Pass the 'role' prop to EditableInfoModal
                            darkMode={darkMode}
                          />

                          <span className="mr-2" style={{ padding: '1px' }}>
                            <ActiveCell
                              isActive={displayUserProfile.isActive}
                              user={displayUserProfile}
                              onClick={() => {
                                props.updateUserProfile({
                                  ...displayUserProfile,
                                  isActive: !displayUserProfile.isActive,
                                  endDate:
                                    !displayUserProfile.isActive === false
                                      ? moment(new Date()).format('YYYY-MM-DD')
                                      : undefined,
                                });
                              }}
                            />
                          </span>
                          <ProfileNavDot
                            userId={displayUserId}
                            style={{ marginLeft: '2px', padding: '1px' }}
                          />
                        </div>
                      </CardTitle>
                      <CardSubtitle
                        tag="h6"
                        className={`${darkMode ? 'text-azure' : 'text-muted'} responsive-font-size`}
                      >
                        Viewing time entries logged in the last 3 weeks
                      </CardSubtitle>
                    </Col>
                    <Col className="px-0">
                      {isAuthUser ? (
                        <div className="tasks-and-timelog-header-add-time-div mt-2">
                          <div>
                            <div className="followup-tooltip-container">
                              
                              <Button
                                className="btn btn-success"
                                onClick={toggle}
                                style={darkMode ? boxStyleDark : boxStyle}
                              >
                                Add Intangible Time Entry
                                <TooltipPortal
                                darkMode={darkMode}
                                  maxWidth={720}
                                  trigger={<i className="fa fa-info-circle ml-2" aria-label="More info" />}
                                >
                                  {/* your same tooltip HTML goes here; keep the stopPropagation on links if you like */}
                                  <div
                                  style={{
                                    fontSize: "14px",
                                    lineHeight: "1.5",
                                    textAlign: "left",
                                    textColor: darkMode ? "#ffffff" : "#000000",
                                  }}
                                >
                                  <p>
                                    Clicking this button only allows for <strong>“Intangible Time”</strong> to be
                                    added to your time log. You can manually log Intangible Time, but it does not
                                    count towards your weekly time commitment.
                                  </p>

                                  <p>
                                    <strong>“Tangible Time”</strong> is the default for logging time using the timer
                                    at the top of the app. It represents all work done on assigned action items and
                                    counts towards a person’s weekly volunteer time commitment.
                                  </p>

                                  <p>
                                    The only way for a volunteer to log Tangible Time is by using the clock in/out
                                    timer.
                                  </p>

                                  <p>
                                    Intangible Time is almost always used only by the management team. It is used for
                                    weekly Monday night management team calls, monthly management team reviews and
                                    Welcome Team Calls, and non-action-item-related research, classes, and other
                                    learning or meetings that benefit or relate to the project but are not tied to a
                                    specific action item in the{" "}
                                    <a
                                      href="https://www.tinyurl.com/oc-os-wbs"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: "#1d4ed8", textDecoration: "underline" }}
                                    >
                                      One Community Work Breakdown Structure
                                    </a>.
                                  </p>

                                  <p>
                                    Intangible Time may also be logged by a volunteer when in the field or for other
                                    reasons when the timer was not able to be used. In these cases, the volunteer
                                    will use this button to log time as “Intangible Time” and then request that an
                                    Admin manually change the log from Intangible to Tangible.
                                  </p>
                                </div>

                                </TooltipPortal>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        !(
                          viewingUser &&
                          viewingUser.role === 'Owner' &&
                          authUser.role !== 'Owner'
                        ) &&
                        canPutUserProfileImportantInfo && (
                          <div className="tasks-and-timelog-header-add-time-div">
                            <div>
                              <Button color="warning" onClick={toggle} style={boxStyle}>
                                Add Time Entry {!isAuthUser && `for ${fullName}`}
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                      <Modal
                        isOpen={timeLogState.infoModal}
                        toggle={openInfo}
                        className={darkMode ? 'text-light' : ''}
                      >
                        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>Info</ModalHeader>
                        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                          {timeLogState.information}
                        </ModalBody>
                        <ModalFooter className={darkMode ? 'bg-space-cadet' : ''}>
                          <Button
                            onClick={openInfo}
                            color="primary"
                            style={darkMode ? boxStyleDark : boxStyle}
                          >
                            Close
                          </Button>
                          <Button onClick={openInfo} color="secondary">
                            Edit
                          </Button>
                        </ModalFooter>
                      </Modal>
                      {/* This TimeEntryForm is for adding intangible time throught the add intangible time enty button */}
                      <TimeEntryForm
                        from="TimeLog"
                        edit={false}
                        toggle={toggle}
                        isOpen={timeLogState.timeEntryFormModal}
                        data={intangibletimeEntryFormData}
                        userProfile={displayUserProfile}
                        roles={roles}
                      />
                      <ReactTooltip id="registerTip" place="bottom" effect="solid">
                        Click this icon to learn about the timelog.
                      </ReactTooltip>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody
                  className={
                    darkMode ? 'card-header-shadow-dark bg-space-cadet' : 'card-header-shadow'
                  }
                >
                  <Nav tabs className="task-and-timelog-card-nav mb-1 responsive-font-size">
                    <NavItem>
                      <NavLink
                        className={`${classnames({ active: timeLogState.activeTab === 0 })} ${
                          darkMode ? 'dark-mode' : ''
                        }`}
                        onClick={() => {
                          changeTab(0);
                        }}
                        href="#"
                        to="#"
                      >
                        Tasks
                      </NavLink>
                    </NavItem>
                    <NavLink
                      className={`${classnames({ active: timeLogState.activeTab === 1 })} ${
                        darkMode ? 'dark-mode' : ''
                      }`}
                      onClick={() => {
                        changeTab(1);
                      }}
                      href="#"
                      to="#"
                    >
                      Current Week Timelog
                    </NavLink>

                    <NavItem>
                      <NavLink
                        className={`${classnames({ active: timeLogState.activeTab === 2 })} ${
                          darkMode ? 'dark-mode' : ''
                        }`}
                        onClick={() => {
                          changeTab(2);
                        }}
                        href="#"
                        to="#"
                      >
                        Last Week
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={`${classnames({ active: timeLogState.activeTab === 3 })} ${
                          darkMode ? 'dark-mode' : ''
                        }`}
                        onClick={() => {
                          changeTab(3);
                        }}
                        href="#"
                        to="#"
                      >
                        Week Before Last
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={`${classnames({ active: timeLogState.activeTab === 4 })} ${
                          darkMode ? 'dark-mode' : ''
                        }`}
                        onClick={() => {
                          changeTab(4);
                        }}
                        href="#"
                        to="#"
                      >
                        Search by Date Range
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={`${classnames({ active: timeLogState.activeTab === 5 })} ${
                          darkMode ? 'dark-mode' : ''
                        }`}
                        onClick={() => {
                          changeTab(5);
                        }}
                        href="#"
                        to="#"
                      >
                        Weekly Summaries
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={`${classnames({ active: timeLogState.activeTab === 6 })} ${
                          darkMode ? 'dark-mode' : ''
                        }`}
                        onClick={() => {
                          changeTab(6);
                        }}
                        href="#"
                        to="#"
                      >
                        Timestamps
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={`${classnames({ active: timeLogState.activeTab === 7 })} ${
                          darkMode ? 'dark-mode' : ''
                        }`}
                        onClick={() => {
                          changeTab(7);
                        }}
                        href="#"
                        to="#"
                      >
                        Badges
                        <span className="badge badge-pill badge-danger ml-2">
                          {props.badgeCount}
                        </span>
                      </NavLink>
                    </NavItem>
                  </Nav>

                  <TabContent
                    activeTab={timeLogState.activeTab}
                    className={darkMode ? 'bg-space-cadet' : ''}
                  >
                    {renderViewingTimeEntriesFrom()}
                    {timeLogState.activeTab === 4 && (
                      <Form inline className="mb-2">
                        <FormGroup className="mr-2 date-selector-form">
                          <Label
                            for="fromDate"
                            className={`responsive-font-size mr-2 ml-1 ${
                              darkMode ? 'text-light' : ''
                            }`}
                          >
                            From
                          </Label>
                          <Input
                            className={`responsive-font-size ${darkMode ? "bg-darkmode-liblack text-light border-0 calendar-icon-dark" : ''}`}
                            type="date"
                            name="fromDate"
                            id="fromDate"
                            value={timeLogState.fromDate}
                            onChange={handleInputChange}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label
                            for="toDate"
                            className={`responsive-font-size mr-2 ${darkMode ? 'text-light' : ''}`}
                          >
                            To
                          </Label>
                          <Input
                            className={`responsive-font-size ${darkMode ? "bg-darkmode-liblack text-light border-0 calendar-icon-dark" : ''}`}
                            type="date"
                            name="toDate"
                            id="toDate"
                            value={timeLogState.toDate}
                            onChange={handleInputChange}
                          />
                        </FormGroup>
                        <Button
                          color="primary"
                          onClick={handleSearch}
                          className="search-time-entries-btn"
                          style={darkMode ? boxStyleDark : boxStyle}
                        >
                          Search
                        </Button>
                        <Button
                          color="secondary"
                          onClick={downloadPeriodPdf}
                          className="ml-2"
                          style={darkMode ? boxStyleDark : boxStyle}
                          disabled={!Array.isArray(timeEntries?.period) || timeEntries.period.length === 0}
                          title="Download the filtered results as a PDF"
                        >
                          Download as PDF
                        </Button>
                      </Form>
                    )}
                    {timeLogState.activeTab === 0 ||
                    timeLogState.activeTab === 5 ||
                    timeLogState.activeTab === 6 ||
                    timeLogState.activeTab === 7 ? null : (
                      <Form className="mb-2 responsive-font-size">
                        <FormGroup>
                          <Label
                            htmlFor="projectSelected"
                            className={`mr-1 ml-1 mb-1 align-top ${darkMode ? 'text-light' : ''}`}
                          >
                            Filter Entries by Project and Task:
                          </Label>
                          <Input
                            type="select"
                            name="projectSelected"
                            id="projectSelected"
                            value={timeLogState.projectsOrTasksSelected}
                            title="Ctrl + Click to select multiple projects and tasks to filter."
                            onChange={e => {
                              setTimeLogState({
                                ...timeLogState,
                                projectsOrTasksSelected: Array.from(
                                  e.target.selectedOptions,
                                  option => option.value,
                                ),
                              });
                            }}
                            multiple
                            className={darkMode ? 'bg-yinmn-blue text-light' : ''}
                          >
                            {projectOrTaskOptions}
                          </Input>
                        </FormGroup>
                      </Form>
                    )}

                    {timeLogState.activeTab === 0 ||
                    timeLogState.activeTab === 5 ||
                    timeLogState.activeTab === 6 ||
                    timeLogState.activeTab === 7 ? null : (
                      <EffortBar
                        activeTab={timeLogState.activeTab}
                        projectsOrTasksSelected={timeLogState.projectsOrTasksSelected}
                        roles={roles}
                      />
                    )}
                    <TabPane tabId={0}>
                      <TeamMemberTasks 
                      filteredUserTeamIds={props.filteredUserTeamIds} 
                      />
                    </TabPane>
                    <TabPane tabId={1}>{currentWeekEntries}</TabPane>
                    <TabPane tabId={2}>{lastWeekEntries}</TabPane>
                    <TabPane tabId={3}>{beforeLastEntries}</TabPane>
                    <TabPane tabId={4}>{periodEntries}</TabPane>
                    <TabPane tabId={5}>
                      <WeeklySummaries userProfile={displayUserProfile} />
                    </TabPane>
                    <TabPane tabId={6}>
                      <TimestampsTab userId={displayUserId} />
                    </TabPane>
                    <TabPane tabId={7}>
                      <Badge userId={displayUserId} role={authUser.role} />
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}

Timelog.prototype = {
  userId: PropTypes.string,
};

// ...existing code...

const mapStateToProps = state => ({
  authUser: state.auth.user,
  displayUserProfile: state.userProfile,
  timeEntries: state.timeEntries,
  displayUserProjects: state.userProjects.projects,
  disPlayUserTasks: state.userTask,
  roles: state.role.roles,
  badgeCount: state.badge.badgeCount,
});

export default connect(mapStateToProps, {
  getTimeEntriesForWeek,
  getTimeEntriesForPeriod,
  getUserProfile,
  getUserProjects,
  getUserTasks,
  updateUserProfile,
  getAllRoles,
  hasPermission,
  getBadgeCount,
  resetBadgeCount,
})(Timelog);
