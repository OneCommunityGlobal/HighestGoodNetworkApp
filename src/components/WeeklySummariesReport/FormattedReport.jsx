/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
// import moment from 'moment';
// import 'moment-timezone';
import moment from 'moment-timezone';
import parse from 'html-react-parser';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { faCopy, faMailBulk } from '@fortawesome/free-solid-svg-icons';
// eslint-disable-next-line no-unused-vars
import { getWeeklySummariesReport } from '../../actions/weeklySummariesReport';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  ListGroup,
  ListGroupItem as LGI,
  Card,
  Tooltip,
  CardTitle,
  CardBody,
  CardImg,
  CardText,
  UncontrolledPopover,
  Row,
  Col,
  Alert,
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { assignStarDotColors, showStar } from '~/utils/leaderboardPermissions';

import { postLeaderboardData } from '~/actions/leaderBoardData';
import { calculateDurationBetweenDates, showTrophyIcon } from '~/utils/anniversaryPermissions';
import { toggleUserBio } from '~/actions/weeklySummariesReport';

import RoleInfoModal from '~/components/UserProfile/EditableModal/RoleInfoModal';
import CopyToClipboard from '~/components/common/Clipboard/CopyToClipboard';
import styles from './WeeklySummariesReport.module.scss';
import hasPermission, { cantUpdateDevAdminDetails } from '../../utils/permissions';
import { ENDPOINTS } from '~/utils/URL';
import ToggleSwitch from '../UserProfile/UserProfileEdit/ToggleSwitch';
import GoogleDocIcon from '../common/GoogleDocIcon';

const textColors = {
  Default: '#000000',
  'Not Required': '#708090',
  Team: '#FF00FF',
  'Team Fabulous': '#FF00FF',
  'Team Marigold': '#FF7F00',
  'Team Luminous': '#C4AF18',
  'Team Lush': '#00FF00',
  'Team Skye': '#29C5F6',
  'Team Azure': '#2B35AF',
  'Team Amethyst': '#9400D3',
};

const isLastWeekReport = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return false;
  const summaryStart = new Date(startDateStr);
  const summaryEnd = new Date(endDateStr);

  const weekStartLA = moment()
    .tz('America/Los_Angeles')
    .startOf('week')
    .subtract(1, 'week')
    .toDate();
  const weekEndLA = moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .subtract(1, 'week')
    .toDate();

  return summaryStart <= weekEndLA && summaryEnd >= weekStartLA;
};

function ListGroupItem({ children, darkMode }) {
  return <LGI className={`px-0 border-0 py-1 ${darkMode ? 'bg-yinmn-blue' : ''}`}>{children}</LGI>;
}

function FormattedReport({
  summaries,
  weekIndex,
  bioCanEdit,
  allRoleInfo,
  badges,
  loadBadges,
  loadTrophies,
  canEditTeamCode,
  auth,
  canSeeBioHighlight,
  darkMode,
  handleTeamCodeChange,
  handleSpecialColorDotClick,
  getWeeklySummariesReport,
}) {
  // Add local state to manage summaries
  const [localSummaries, setLocalSummaries] = useState(summaries);

  // Update local state when props change
  useEffect(() => {
    setLocalSummaries(summaries);
  }, [summaries]);

  const dispatch = useDispatch();
  const isEditCount = dispatch(hasPermission('totalValidWeeklySummaries'));

  // Only proceed if summaries is valid
  if (!summaries || !Array.isArray(summaries) || summaries.length === 0) {
    return (
      <div className="text-center py-4">
        <p>No data available to display</p>
      </div>
    );
  }

  const loggedInUserEmail = auth?.user?.email ? auth.user.email : '';

  // Add local state to manage summaries
  // eslint-disable-next-line react-hooks/rules-of-hooks

  // Update local state when props change
  // eslint-disable-next-line react-hooks/rules-of-hooks

  // Add this function to handle bio updates
  const handleBioUpdate = (userId, newBioStatus) => {
    setLocalSummaries(prevSummaries =>
      prevSummaries.map(summary =>
        summary._id === userId ? { ...summary, bioPosted: newBioStatus } : summary,
      ),
    );
  };

  // Determining if it's the final week:
  // const isFinalWeek =
  //   !summaries.isActive && // backend tells user is inactive
  //   summaries.startDate &&
  //   summaries.endDate &&
  //   isLastWeekReport(summaries.startDate, summaries.endDate) &&
  //   weekIndex === 1; // second report row

  // // Final week date range to show in message
  // const finalWeekStart = moment()
  //   .tz('America/Los_Angeles')
  //   .startOf('week')
  //   .subtract(1, 'week')
  //   .format('MMM D, YYYY');

  // const finalWeekEnd = moment()
  //   .tz('America/Los_Angeles')
  //   .endOf('week')
  //   .subtract(1, 'week')
  //   .format('MMM D, YYYY');

  return (
    <>
      <ListGroup flush>
        {localSummaries.map(summary => {
          // Add safety check for each summary
          if (!summary || !summary.totalSeconds) {
            return null;
          }

          const isFinalWeek =
            !summary.isActive && // THIS now refers to individual user
            summary.startDate &&
            summary.endDate &&
            isLastWeekReport(summary.startDate, summary.endDate) &&
            weekIndex === 1;

          return (
            <ReportDetails
              loggedInUserEmail={loggedInUserEmail}
              key={summary._id}
              summary={summary}
              weekIndex={weekIndex}
              bioCanEdit={bioCanEdit}
              canEditSummaryCount={isEditCount}
              allRoleInfo={allRoleInfo}
              canEditTeamCode={canEditTeamCode}
              badges={badges}
              loadBadges={loadBadges}
              loadTrophies={loadTrophies}
              canSeeBioHighlight={canSeeBioHighlight}
              darkMode={darkMode}
              handleTeamCodeChange={handleTeamCodeChange}
              auth={auth}
              handleSpecialColorDotClick={handleSpecialColorDotClick}
              isFinalWeek={isFinalWeek}
              getWeeklySummariesReport={getWeeklySummariesReport}
              handleBioUpdate={handleBioUpdate}
            />
          );
        })}
      </ListGroup>
      <EmailsList summaries={summaries} auth={auth} />
    </>
  );
}

function EmailsList({ summaries, auth }) {
  const [emailTooltipOpen, setEmailTooltipOpen] = useState(false);
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);
  if (auth?.user?.role) {
    const { role } = auth.user;
    if (role === 'Administrator' || role === 'Owner') {
      const emails = [];
      summaries.forEach(summary => {
        if (summary.email !== undefined && summary.email !== null) {
          emails.push(summary.email);
        }
      });
      const handleEmailButtonClick = () => {
        const batchSize = 90;
        const emailChunks = [];
        for (let i = 0; i < emails.length; i += batchSize) {
          emailChunks.push(emails.slice(i, i + batchSize));
        }
        const openEmailClientWithBatchInNewTab = batch => {
          const emailAddresses = batch.join(', ');
          const mailtoLink = `mailto:?bcc=${emailAddresses}`;
          window.open(mailtoLink, '_blank');
        };
        emailChunks.forEach((batch, index) => {
          setTimeout(() => {
            openEmailClientWithBatchInNewTab(batch);
          }, index * 2000);
        });
      };

      const toggleEmailTooltip = () => {
        setEmailTooltipOpen(!emailTooltipOpen);
      };

      const toggleCopyTooltip = () => {
        setCopyTooltipOpen(!copyTooltipOpen);
      };

      return (
        <>
          <div className="d-flex align-items-center">
            <h4>Emails</h4>
            <Tooltip
              placement="top"
              isOpen={emailTooltipOpen}
              target="emailIcon"
              toggle={toggleEmailTooltip}
            >
              Launch the email client, organizing the recipient email addresses into batches, each
              containing a maximum of 90 addresses.
            </Tooltip>
            <FontAwesomeIcon
              className="mx-2"
              onClick={handleEmailButtonClick}
              icon={faMailBulk}
              size="lg"
              style={{ color: '#0f8aa9', cursor: 'pointer' }}
              id="emailIcon"
            />
            <Tooltip
              placement="top"
              isOpen={copyTooltipOpen}
              target="copytoclipboard"
              toggle={toggleCopyTooltip}
            >
              Click to copy all emails.
            </Tooltip>
            <div id="copytoclipboard">
              <CopyToClipboard writeText={emails.join(', ')} message="Emails Copied!" />
            </div>
          </div>
          <p>{emails.join(', ')}</p>
        </>
      );
    }
    return null;
  }
  return null;
}

function getTextColorForHoursLogged(hoursLogged, promisedHours) {
  const percentage = (hoursLogged / promisedHours) * 100;

  if (percentage < 50) {
    return 'red';
  }
  if (percentage < 100) {
    return '#0B6623';
  }
  return 'black';
}

const shouldShowYellowBar = (bioPosted, summary) => {
  // Not show yellow bar for Owner or Promoted Review roles
  // if (summary?.role === 'Owner' || summary?.role === 'Promoted Review') {
  //   return false;
  // }
  // Show yellow bar for 'requested' or if user qualifies for bio posting
  // const weeklySummaryCount =
  //   summary.weeklySummariesCount ||
  //   summary.weeklySubmissionCount ||
  //   summary.summaryCount ||
  //   summary.totalWeeklySummaries ||
  //   0;
  const isMeetCriteria =
    summary.totalTangibleHrs > 80 && summary.daysInTeam > 60 && summary.bioPosted !== 'posted';
  // weeklySummaryCount > 8;

  return bioPosted === 'requested' || (bioPosted === 'default' && isMeetCriteria);
};

const getBioBackgroundColor = (bioPosted, summary) => {
  const weeklySummaryCount =
    summary.weeklySummariesCount ||
    summary.weeklySubmissionCount ||
    summary.summaryCount ||
    summary.totalWeeklySummaries ||
    0;

  const isMeetCriteria =
    summary.totalTangibleHrs > 80 && summary.daysInTeam > 60 && summary.bioPosted !== 'posted';
  // weeklySummaryCount > 8;

  if (bioPosted === 'requested') {
    return '#fffacd'; //Light yellow (lemon chiffon)
  } else if (bioPosted === 'default' && isMeetCriteria) {
    return '#ffff99'; // Bright yellow for requested for neutral but qualified
  }
  return 'transparent';
};

function ReportDetails({
  summary,
  weekIndex,
  bioCanEdit,
  canEditSummaryCount,
  allRoleInfo,
  badges,
  loadBadges,
  loadTrophies,
  canEditTeamCode,
  canSeeBioHighlight,
  loggedInUserEmail,
  darkMode,
  handleTeamCodeChange,
  auth,
  handleSpecialColorDotClick,
  getWeeklySummariesReport,
  handleBioUpdate,
  isFinalWeek, // new prop
}) {
  const [filteredBadges, setFilteredBadges] = useState([]);
  const ref = useRef(null);
  const cantEditJaeRelatedRecord = cantUpdateDevAdminDetails(summary.email, loggedInUserEmail);

  const hoursLogged = (summary.totalSeconds[weekIndex] || 0) / 3600;
  const weeklySummaryCount =
    summary.weeklySummariesCount ||
    summary.weeklySubmissionCount ||
    summary.summaryCount ||
    summary.totalWeeklySummaries ||
    0;
  const isMeetCriteria =
    canSeeBioHighlight &&
    summary.totalTangibleHrs > 80 &&
    summary.daysInTeam > 60 &&
    summary.bioPosted !== 'posted';
  // weeklySummaryCount > 8;

  useEffect(() => {
    setFilteredBadges(badges.filter(badge => badge.showReport === true));
  }, []);

  return (
    <li className={`list-group-item px-0 ${darkMode ? 'bg-yinmn-blue' : ''}`} ref={ref}>
      <ListGroup className="px-0" flush>
        <ListGroupItem darkMode={darkMode}>
          <Index
            summary={summary}
            weekIndex={weekIndex}
            allRoleInfo={allRoleInfo}
            auth={auth}
            loadTrophies={loadTrophies}
            handleSpecialColorDotClick={handleSpecialColorDotClick}
            isFinalWeek={isFinalWeek}
          />
        </ListGroupItem>
        <Row className="flex-nowrap">
          <Col xs="6" className="flex-grow-0">
            <ListGroupItem darkMode={darkMode}>
              <TeamCodeRow
                canEditTeamCode={canEditTeamCode && !cantEditJaeRelatedRecord}
                summary={summary}
                handleTeamCodeChange={handleTeamCodeChange}
                darkMode={darkMode}
                getWeeklySummariesReport={getWeeklySummariesReport}
              />
            </ListGroupItem>
            <ListGroupItem darkMode={darkMode}>
              {/* <div style={{ width: '200%', backgroundColor: isMeetCriteria ? 'yellow' : 'none' }}> */}
              <div
                style={{
                  width: '250%',
                  maxWidth: '220%',
                  // display: 'block',
                  // backgroundColor: summary.bioPosted === 'requested' ? 'yellow' : 'transparent',
                  // padding: summary.bioPosted === 'requested' ? '8px' : '0',
                  // borderRadius: summary.bioPosted === 'requested' ? '4px' : '0',
                  backgroundColor: getBioBackgroundColor(summary.bioPosted, summary),
                  padding: shouldShowYellowBar(summary.bioPosted, summary) ? '0px' : '0', // Reduced padding for thinner bar
                  // borderRadius: shouldShowYellowBar(summary.bioPosted, summary) ? '4px' : '0',
                  // border: shouldShowYellowBar(summary.bioPosted, summary)
                  //   ? '1px solid #f0d000'
                  //   : 'none', // Added subtle border for better definition
                  // marginBottom: shouldShowYellowBar(summary.bioPosted, summary) ? '2px' : '0',
                }}
              >
                {/* <div style={{ width: '200%', backgroundColor: isMeetCriteria ? 'yellow' : 'none' }}> */}
                <Bio
                  bioCanEdit={bioCanEdit && !cantEditJaeRelatedRecord}
                  userId={summary._id}
                  bioPosted={summary.bioPosted}
                  summary={summary}
                  getWeeklySummariesReport={getWeeklySummariesReport}
                  handleBioUpdate={handleBioUpdate}
                />
              </div>
            </ListGroupItem>

            <ListGroupItem darkMode={darkMode}>
              <TotalValidWeeklySummaries
                summary={summary}
                canEditSummaryCount={canEditSummaryCount && !cantEditJaeRelatedRecord}
                darkMode={darkMode}
              />
            </ListGroupItem>
            <ListGroupItem darkMode={darkMode}>
              <p
                style={{
                  color: getTextColorForHoursLogged(
                    hoursLogged,
                    summary.promisedHoursByWeek[weekIndex],
                  ),
                  fontWeight: 'bold',
                }}
              >
                Hours logged: {hoursLogged.toFixed(2)} / {summary.promisedHoursByWeek[weekIndex]}
              </p>
            </ListGroupItem>
            <ListGroupItem darkMode={darkMode}>
              <WeeklySummaryMessage summary={summary} weekIndex={weekIndex} />
            </ListGroupItem>
          </Col>
          <Col xs="6">
            {loadBadges && summary.badgeCollection?.length > 0 && (
              <WeeklyBadge summary={summary} weekIndex={weekIndex} badges={filteredBadges} />
            )}
          </Col>
        </Row>
      </ListGroup>
    </li>
  );
}

function WeeklySummaryMessage({ summary, weekIndex }) {
  if (!summary) {
    return (
      <p>
        <b>Weekly Summary:</b> Not provided!
      </p>
    );
  }

  const summaryText = summary?.weeklySummaries[weekIndex]?.summary;
  let summaryDate = moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .subtract(weekIndex, 'week')
    .format('YYYY-MMM-DD');
  let summaryDateText = `Weekly Summary (${summaryDate}):`;
  const summaryContent = (() => {
    if (summaryText) {
      const style = {
        color: textColors[summary?.weeklySummaryOption] || textColors.Default,
      };

      summaryDate = moment(summary.weeklySummaries[weekIndex]?.uploadDate)
        .tz('America/Los_Angeles')
        .format('MMM-DD-YY');
      summaryDateText = `Summary Submitted On (${summaryDate}):`;

      return (
        <div style={style} className={styles.weeklySummaryReportContainer}>
          <div className={styles.weeklySummaryText}>{parse(summaryText)}</div>
          <FontAwesomeIcon
            icon={faCopy}
            className={styles.copyIcon}
            onClick={() => {
              const parsedSummary = summaryText.replace(/<\/?[^>]+>|&nbsp;/g, '');
              navigator.clipboard.writeText(parsedSummary);
              toast.success('Summary Copied!');
            }}
          />
        </div>
      );
    }
    if (
      summary?.weeklySummaryOption === 'Not Required' ||
      (!summary?.weeklySummaryOption && summary.weeklySummaryNotReq)
    ) {
      return <p style={{ color: textColors['Not Required'] }}>Not required for this user</p>;
    }
    return <span style={{ color: 'red' }}>Not provided!</span>;
  })();

  return (
    <>
      <p>
        <b>{summaryDateText}</b>
      </p>
      {summaryContent}
    </>
  );
}

function TeamCodeRow({
  canEditTeamCode,
  summary,
  handleTeamCodeChange,
  darkMode,
  getWeeklySummariesReport,
}) {
  const [teamCode, setTeamCode] = useState(summary.teamCode);
  const [hasError, setHasError] = useState(false);
  const fullCodeRegex = /^.{5,7}$/;
  const dispatch = useDispatch();

  const handleOnChange = async (userProfileSummary, newStatus) => {
    const url = ENDPOINTS.USERS_ALLTEAMCODE_CHANGE;

    try {
      await axios.patch(url, { userIds: [userProfileSummary._id], replaceCode: newStatus });
      handleTeamCodeChange(userProfileSummary.teamCode, newStatus, {
        [userProfileSummary._id]: true,
      }); // Update the team code dynamically
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(
        `An error occurred while attempting to save the new team code change to the profile.${err}`,
      );
    }
  };

  const handleCodeChange = e => {
    const { value } = e.target;
    if (value.length <= 7) {
      const regexTest = fullCodeRegex.test(value);
      if (regexTest) {
        setHasError(false);
        setTeamCode(value);
        handleOnChange(summary, value);
      } else {
        setTeamCode(value);
        setHasError(true);
      }
    }
  };

  useEffect(() => {
    setTeamCode(summary?.teamCode);
  }, [summary.teamCode]);

  return (
    <>
      <div className={styles.teamcodeWrapper}>
        {canEditTeamCode ? (
          <div style={{ width: '107px', paddingRight: '5px', position: 'relative' }}>
            <Input
              id="codeInput"
              value={teamCode}
              onChange={e => {
                if (e.target.value !== teamCode) {
                  handleCodeChange(e);
                }
              }}
              placeholder="X-XXX"
              className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
            />
          </div>
        ) : (
          <div style={{ paddingRight: '5px' }}>
            {teamCode === '' ? 'No assigned team code!' : teamCode}
          </div>
        )}
        <b>Media URL:</b>
        <MediaUrlLink summary={summary} />
      </div>
      {hasError ? (
        <Alert className={styles.codeAlert} color="danger">
          NOT SAVED! The code must be between 5 and 7 characters long.
        </Alert>
      ) : null}
    </>
  );
}

function MediaUrlLink({ summary }) {
  if (summary.mediaUrl) {
    return (
      <a
        href={summary.mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ paddingLeft: '5px', color: '#007BFF' }}
      >
        Open link to media files
      </a>
    );
  }

  if (summary.adminLinks) {
    const link = summary.adminLinks.find(item => item.Name === 'Media Folder');
    if (link) {
      return (
        <a
          href={link.Link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ paddingLeft: '5px' }}
        >
          Open link to media files
        </a>
      );
    }
  }
  return <div style={{ paddingLeft: '5px' }}>Not provided!</div>;
}

function TotalValidWeeklySummaries({ summary, canEditSummaryCount, darkMode }) {
  const style = {
    color: textColors[summary?.weeklySummaryOption] || textColors.Default,
  };

  const [weeklySummariesCount, setWeeklySummariesCount] = useState(
    // parseInt() returns an integer or NaN, convert to 0 if it's NaM
    parseInt(summary.weeklySummariesCount, 10) || 0,
  );

  const handleOnChange = async (userProfileSummary, count) => {
    const url = ENDPOINTS.USER_PROFILE_PROPERTY(userProfileSummary._id);
    try {
      await axios.patch(url, { key: 'weeklySummariesCount', value: count });
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(
        'An error occurred while attempting to save the new weekly summaries count change to the profile.',
      );
    }
  };

  const handleWeeklySummaryCountChange = e => {
    setWeeklySummariesCount(e.target.value);
    handleOnChange(summary, e.target.value);
  };

  return (
    <div className={styles.totalValidWrapper}>
      {weeklySummariesCount === 8 ? (
        <div className="total-valid-text" style={style}>
          <b>Total Valid Weekly Summaries:</b>{' '}
        </div>
      ) : (
        <div className="total-valid-text">
          <b style={style}>Total Valid Weekly Summaries:</b>
        </div>
      )}
      {canEditSummaryCount ? (
        <div className="pl-2" style={{ width: '150px' }}>
          <Input
            type="number"
            name="weeklySummaryCount"
            step="1"
            value={weeklySummariesCount}
            onChange={e => handleWeeklySummaryCountChange(e)}
            className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
            min="0"
          />
        </div>
      ) : (
        <div>
          &nbsp;
          {weeklySummariesCount || 'No valid submissions yet!'}
        </div>
      )}
    </div>
  );
}

function Bio({ bioCanEdit, getWeeklySummariesReport, handleBioUpdate, ...props }) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return bioCanEdit ? (
    <BioSwitch
      {...props}
      getWeeklySummariesReport={getWeeklySummariesReport}
      handleBioUpdate={handleBioUpdate}
    />
  ) : (
    <BioLabel {...props} />
  );
  // return bioCanEdit ? (
  //   <BioSwitch {...props} getWeeklySummariesReport={getWeeklySummariesReport} />
  // ) : (
  //   <BioLabel {...props} />
  // );
}

function BioSwitch({ userId, bioPosted, summary, getWeeklySummariesReport, handleBioUpdate }) {
  const [bioStatus, setBioStatus] = useState(bioPosted);
  // const [isUpdating, setIsUpdating] = useState(false);
  const [hasLocalChange, setHasLocalChange] = useState(false);
  const dispatch = useDispatch();
  const style = { color: textColors[summary?.weeklySummaryOption] || textColors.Default };

  // useEffect(() => {
  //   // eslint-disable-next-line no-console
  //   if (!isUpdating) {
  //     // eslint-disable-next-line no-console
  //     console.log('🔍 bioPosted prop changed:', bioPosted);
  //     setBioStatus(bioPosted);
  //   }
  // }, [bioPosted, isUpdating]);

  // useEffect(() => {
  //   // eslint-disable-next-line no-console
  //   console.log('🔍 PARENT IS SENDING:', { bioPosted, summaryBioPosted: summary.bioPosted });
  // }, [bioPosted, summary.bioPosted]);
  // eslint-disable-next-line no-shadow
  //old
  // useEffect(() => {
  //   if (!hasLocalChange) {
  //     // eslint-disable-next-line no-console
  //     console.log('🔍 bioPosted prop changed:', bioPosted);
  //     setBioStatus(bioPosted);
  //   }
  // }, [bioPosted, hasLocalChange]);
  // old working
  // const handleChangeBioPosted = async (userId, bioStatus) => {
  //   // eslint-disable-next-line no-console
  //   // console.log('🎯 Changing from', bioStatus, 'to', bioStatus);
  //   // setIsUpdating(true);
  //   // setBioStatus(bioStatus);
  //   // setHasLocalChange(true); // Lock against prop updates
  //   setBioStatus(bioStatus); // Update local state

  //   // Update parent immediately
  //   // if (handleBioUpdate) {
  //   //   handleBioUpdate(userId, bioStatus);
  //   // }
  //   // setBioStatus(bioStatus);

  //   const res = await dispatch(toggleUserBio(userId, bioStatus));
  //   // try {
  //   //   const res = await dispatch(toggleUserBio(userId, bioStatus));
  //   if (res.status === 200) {
  //     toast.success('You have changed the bio announcement status of this user.');

  //     // try {
  //     //   // Refresh parent data
  //     //   setTimeout(async () => {
  //     //     const { getWeeklySummariesReport } = await import('../../actions/weeklySummariesReport');
  //     //     await dispatch(getWeeklySummariesReport());
  //     //     // eslint-disable-next-line no-console
  //     //     console.log('🔄 Delayed refresh completed');
  //     //   }, 2000);

  //     //   // Small delay to let parent update
  //     //   // setTimeout(() => {
  //     //   //   setIsUpdating(false);
  //     //   // }, 1000);
  //     // } catch (error) {
  //     //   // eslint-disable-next-line no-console
  //     //   console.error('❌ Failed to refresh:', error);
  //     //   // setBioStatus(bioPosted); // Revert
  //     //   // setIsUpdating(false);
  //     //   // Revert on error
  //     //   if (handleBioUpdate) {
  //     //     handleBioUpdate(userId, bioPosted);
  //     //   }
  //     // }
  //     // Reset the lock after a delay
  //     // setTimeout(() => {
  //     //   setHasLocalChange(false);
  //     // }, 3000);
  //   } else {
  //     // // Revert on failure
  //     // setBioStatus(bioPosted);
  //     // setIsUpdating(false);
  //     // setHasLocalChange(false);
  //     setBioStatus(bioPosted);
  //     // Revert on API failure
  //     // if (handleBioUpdate) {
  //     //   handleBioUpdate(userId, bioPosted);
  //     // }
  //     // setBioStatus(bioPosted);
  //   }

  //   // } catch (error) {
  //   //   // eslint-disable-next-line no-console
  //   //   console.error('❌ Failed to update:', error);
  //   //   setBioStatus(bioPosted); // Revert
  //   //   setIsUpdating(false);
  //   // }
  //   // const res = await dispatch(toggleUserBio(userId, bioStatus));
  //   // if (res.status === 200) {
  //   //   toast.success('You have changed the bio announcement status of this user.');

  //   //   // Update local state immediately for instant feedback
  //   //   setBioStatus(bioStatus);

  //   //   try {
  //   //     const { getWeeklySummariesReport } = await import('../../actions/weeklySummariesReport');
  //   //     await dispatch(getWeeklySummariesReport());

  //   //     // Call the parent's refresh function
  //   //     if (getWeeklySummariesReport) {
  //   //       await getWeeklySummariesReport(); // This should update parent's data
  //   //     }
  //   //   } catch (error) {
  //   //     // eslint-disable-next-line no-console
  //   //     console.error('❌ Failed to refresh:', error);
  //   //   }
  //   // Check what the weekly summaries endpoint returns AFTER update
  //   // eslint-disable-next-line no-console
  //   // console.log('🔍 getWeeklySummariesReport function exists?', typeof getWeeklySummariesReport);
  //   // // eslint-disable-next-line no-console
  //   // console.log('🔍 Function content:', getWeeklySummariesReport.toString());

  //   // // CRITICAL FIX: Update the parent data
  //   // if (getWeeklySummariesReport) {
  //   //   // eslint-disable-next-line no-console
  //   //   console.log('🔄 Calling refresh...');
  //   //   await getWeeklySummariesReport();
  //   //   // eslint-disable-next-line no-console
  //   //   console.log('✅ Refresh completed! Data should now be updated.');
  //   // }
  //   // CORRECT WAY: Dispatch the action to actually make the API call

  //   // try {
  //   //   // eslint-disable-next-line no-console
  //   //   console.log('🔄 Refreshing weekly summaries data...');
  //   //   const refreshResult = await dispatch(getWeeklySummariesReport());
  //   //   // eslint-disable-next-line no-console
  //   //   console.log('✅ Weekly summaries refreshed:', refreshResult);
  //   // } catch (error) {
  //   //   // eslint-disable-next-line no-console
  //   //   console.error('❌ Failed to refresh weekly summaries:', error);
  //   // }
  //   // SIMPLE FIX: Just dispatch the action creator
  //   // try {
  //   //   // eslint-disable-next-line no-console
  //   //   console.log('🔄 Refreshing weekly summaries data...');
  //   //   const { getWeeklySummariesReport } = await import('../../actions/weeklySummariesReport');
  //   //   // eslint-disable-next-line no-console
  //   //   console.log('🔍 Import check:', { getWeeklySummariesReport });
  //   //   const refreshResult = await dispatch(getWeeklySummariesReport());
  //   //   // eslint-disable-next-line no-console
  //   //   console.log('✅ Weekly summaries refreshed:', refreshResult);
  //   //   // DEBUG: Check Redux state after refresh
  //   //   const currentState = store.getState(); // You'll need to import store
  //   //   // eslint-disable-next-line no-console
  //   //   console.log('🏪 Redux state after refresh:', currentState.weeklySummariesReport);
  //   //   // eslint-disable-next-line no-console
  //   //   // console.log('🌐 Check network tab - you should see the API call now');
  //   // } catch (error) {
  //   //   // eslint-disable-next-line no-console
  //   //   console.error('❌ Failed to refresh weekly summaries:', error);
  //   // }
  //   // // Clear existing data first
  //   // dispatch(fetchWeeklySummariesReportBegin()); // This should clear current data

  //   // // Then fetch fresh data
  //   // await dispatch(getWeeklySummariesReport());
  // };

  const handleChangeBioPosted = async (userId, bioStatusValue) => {
    // eslint-disable-next-line no-console
    console.log('🎯 handleChangeBioPosted called with:', bioStatusValue);
    // eslint-disable-next-line no-console
    // console.log('🎯 Current bioStatus before update:', bioStatus);

    //  SET THE LOCK FIRST!
    setHasLocalChange(true);
    // Force immediate state update
    setBioStatus(bioStatusValue);
    // eslint-disable-next-line no-console
    // console.log('🎯 setBioStatus called with:', bioStatusValue);
    // Update parent
    if (handleBioUpdate) {
      handleBioUpdate(userId, bioStatusValue);
    }
    // Force re-render to make sure state sticks
    // setTimeout(() => {
    //   // eslint-disable-next-line no-console
    //   console.log('🎯 bioStatus after timeout:', bioStatus);
    // }, 100);

    // Update parent optimistically
    // if (handleBioUpdate) {
    //   handleBioUpdate(userId, bioStatusValue);
    // }
    const res = await dispatch(toggleUserBio(userId, bioStatusValue));
    if (res.status === 200) {
      toast.success('You have changed the bio announcement status of this user.');
    }
    // try {
    //   const res = await dispatch(toggleUserBio(userId, bioStatusValue));
    //   if (res.status === 200) {
    //     toast.success('You have changed the bio announcement status of this user.');
    //   } else {
    //     // Revert on failure
    //     setBioStatus(bioPosted);
    //   }
    // } catch (error) {
    //   // eslint-disable-next-line no-console
    //   console.error('❌ Failed to update:', error);
    //   setBioStatus(bioPosted); // Revert
    // }
  };
  // Prevent prop updates during our update
  // useEffect(() => {
  //   if (!isUpdating) {
  //     setBioStatus(bioPosted);
  //   }
  // }, [bioPosted, isUpdating]);
  // setTimeout(() => {
  //   window.location.reload();
  // }, 1000);
  // };

  //debugging version
  // const handleChangeBioPosted = async (userId, bioStatus) => {
  //   // eslint-disable-next-line no-console
  //   console.log('🔄 Sending request:', { userId, bioStatus });

  //   try {
  //     const res = await dispatch(toggleUserBio(userId, bioStatus));

  //     // Log the FULL response
  //     // eslint-disable-next-line no-console
  //     console.log('📦 Full response object:', res);
  //     // eslint-disable-next-line no-console
  //     console.log('📦 Response status:', res?.status);
  //     // eslint-disable-next-line no-console
  //     console.log('📦 Response data:', res?.data);
  //     // eslint-disable-next-line no-console
  //     console.log('📦 Response payload:', res?.payload);

  //     if (res.status === 200) {
  //       toast.success('You have changed the bio announcement status of this user.');

  //       // Don't refresh - let's see what the server actually returned
  //       // eslint-disable-next-line no-console
  //       console.log("✅ Server said 200, but let's verify the actual data was saved");
  //     } else {
  //       // eslint-disable-next-line no-console
  //       console.log('❌ Server returned non-200 status:', res);
  //       toast.error('Failed to update bio status.');
  //     }
  //   } catch (error) {
  //     // eslint-disable-next-line no-console
  //     console.error('❌ Error occurred:', error);
  //     toast.error('Error updating bio status.');
  //   }
  // };
  // const handleChangeBioPosted = async (userId, bioStatus) => {
  //   // eslint-disable-next-line no-console
  //   console.log('🔄 Attempting to update bio status:', { userId, bioStatus });
  //   try {
  //     const res = await dispatch(toggleUserBio(userId, bioStatus));
  //     // eslint-disable-next-line no-console
  //     console.log('📊 Full API Response:', res);
  //     if (res && (res.status === 200 || res.type)) {
  //       // eslint-disable-next-line no-console
  //       console.log('✅ Bio status updated successfully');
  //       toast.success('You have changed the bio announcement status of this user.');

  //       // SOLUTION: Refresh the weekly summaries data after successful update
  //       if (getWeeklySummariesReport && typeof getWeeklySummariesReport === 'function') {
  //         // eslint-disable-next-line no-console
  //         console.log('🔄 Refreshing weekly summaries data...');
  //         try {
  //           await getWeeklySummariesReport();
  //           // eslint-disable-next-line no-console
  //           console.log('✅ Data refreshed successfully');
  //         } catch (refreshError) {
  //           // eslint-disable-next-line no-console
  //           console.error('❌ Error refreshing data:', refreshError);
  //         }
  //       } else {
  //         // eslint-disable-next-line no-console
  //         console.log('⚠️ getWeeklySummariesReport function not available', res);
  //         // throw new Error(`Unexpected response: ${JSON.stringify(res)}`);
  //       }
  //     } else {
  //       // eslint-disable-next-line no-console
  //       console.log('❌ Unexpected response structure:', res);
  //       toast.error('Failed to update bio status. Please try again.');
  //       setBioStatus(bioPosted); // Revert on failure
  //     }
  //   } catch (error) {
  //     // eslint-disable-next-line no-console
  //     console.error('❌ Error updating bio status:', error);
  //     toast.error('Failed to update bio status. Please try again.');
  //     setBioStatus(bioPosted); // Revert local state if API call failed
  //   }
  // };
  // const handleChangeBioPosted = async (userId, bioStatus) => {
  //   // eslint-disable-next-line no-console
  //   console.log('🔄 Attempting to update bio status:', { userId, bioStatus });

  //   const res = await dispatch(toggleUserBio(userId, bioStatus));
  //   // eslint-disable-next-line no-console
  //   console.log('📊 API Response:', res);

  //   if (res.status === 200) {
  //     toast.success('You have changed the bio announcement status of this user.');
  //   }
  // };

  // Sync local state with props when data is refreshed
  // useEffect(() => {
  //   setBioStatus(bioPosted);
  // }, [bioPosted]);

  return (
    // <div>
    // <div
    //   style={{
    //     backgroundColor: bioStatus === 'requested' ? 'yellow' : 'transparent',
    //     padding: bioStatus === 'requested' ? '1px' : '0',
    //     // borderRadius: bioStatus === 'requested' ? '2px' : '0',
    //     width: '100vw',
    //     maxWidth: '200%',
    //     margin: '0 auto',
    //   }}
    // >
    <div
      style={{
        backgroundColor: getBioBackgroundColor(bioStatus, summary),
        padding: shouldShowYellowBar(bioStatus, summary) ? '2px 12px' : '0',
        borderRadius: shouldShowYellowBar(bioStatus, summary) ? '4px' : '0',
        width: '100%',
        // border: shouldShowYellowBar(bioStatus, summary) ? '1px solid #f0d000' : 'none',
      }}
    >
      {/* <div> */}
      <div className={styles.bioToggle}>
        <b style={style}>Bio announcement:</b>
      </div>
      <div className={styles.bioToggle}>
        <ToggleSwitch
          switchType="bio"
          state={bioStatus}
          handleUserProfile={bio => {
            // eslint-disable-next-line no-console
            console.log('🎛️ Toggle clicked, bio=', bio);
            // eslint-disable-next-line no-console
            console.log('🎛️ Current bioStatus=', bioStatus);
            // setBioStatus(bio);
            handleChangeBioPosted(userId, bio);
          }}
        />
      </div>
    </div>
  );
}

function BioLabel({ bioPosted, summary }) {
  const style = {
    color: textColors[summary?.weeklySummaryOption] || textColors.Default,
  };

  let text = '';
  if (bioPosted === 'default') {
    text = 'Not requested/posted';
  } else if (bioPosted === 'posted') {
    text = 'Posted';
  } else {
    text = 'Requested';
  }
  return (
    <div
      style={{
        backgroundColor: bioPosted === 'requested' ? 'yellow' : 'transparent',
        padding: bioPosted === 'requested' ? '2px' : '0',
        // borderRadius: bioPosted === 'requested' ? '2px' : '0',
        width: '100vw',
        // border: shouldShowYellowBar(bioPosted, summary) ? '1px solid #f0d000' : 'none',
      }}
    >
      {/* <div> */}
      <b style={style}>Bio announcement: </b>
      {text}
    </div>
  );
}

function WeeklyBadge({ summary, weekIndex, badges }) {
  const badgeEndDate = moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .subtract(weekIndex, 'week')
    .format('YYYY-MM-DD');
  const badgeStartDate = moment()
    .tz('America/Los_Angeles')
    .startOf('week')
    .subtract(weekIndex, 'week')
    .format('YYYY-MM-DD');
  const badgeIdThisWeek = [];
  const badgeThisWeek = [];
  summary.badgeCollection.forEach(badge => {
    if (badge.earnedDate) {
      const { length } = badge.earnedDate;
      const earnedDate = moment(badge.earnedDate[length - 1]);
      if (earnedDate.isBetween(badgeStartDate, badgeEndDate, 'days', '[]')) {
        badgeIdThisWeek.push(badge.badge);
      }
    } else {
      const modifiedDate = badge.lastModified.substring(0, 10);
      if (modifiedDate <= badgeEndDate && modifiedDate >= badgeStartDate) {
        badgeIdThisWeek.push(badge.badge);
      }
    }
  });
  if (badgeIdThisWeek.length > 0) {
    badgeIdThisWeek.forEach(badgeId => {
      // eslint-disable-next-line no-shadow
      const badge = badges.find(badge => badge._id === badgeId);
      badgeThisWeek.push(badge);
    });
  }
  return (
    badgeThisWeek.length > 0 && (
      <ListGroupItem className="row">
        {badgeThisWeek.map((value, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className={styles.badgeTd} key={`${weekIndex}_${summary._id}_${index}`}>
            {' '}
            {value && value.imageUrl && value._id && (
              <>
                <img src={value.imageUrl} id={`popover_${value._id}`} alt="" />
                <UncontrolledPopover trigger="hover" target={`popover_${value._id}`}>
                  <Card className="text-center">
                    <CardImg className="badge_image_lg" src={value.imageUrl} />
                    <CardBody>
                      <CardTitle
                        style={{
                          fontWeight: 'bold',
                          fontSize: 18,
                          color: '#285739',
                          marginBottom: 15,
                        }}
                      >
                        {value.badgeName}
                      </CardTitle>
                      <CardText>{value.description}</CardText>
                    </CardBody>
                  </Card>
                </UncontrolledPopover>
              </>
            )}
          </div>
        ))}
      </ListGroupItem>
    )
  );
}

function Index({
  summary,
  weekIndex,
  allRoleInfo,
  auth,
  loadTrophies,
  handleSpecialColorDotClick,
  isFinalWeek,
}) {
  const colors = ['purple', 'green', 'navy'];
  const hoursLogged = (summary.totalSeconds[weekIndex] || 0) / 3600;
  const currentDate = moment.tz('America/Los_Angeles').startOf('day');
  const [setTrophyFollowedUp] = useState(summary?.trophyFollowedUp);
  const dispatch = useDispatch();

  const [modalOpen, setModalOpen] = useState(false);

  const trophyIconToggle = () => {
    if (auth?.user?.role === 'Owner' || auth?.user?.role === 'Administrator') {
      setModalOpen(prevState => (prevState ? false : summary._id));
    }
  };

  const handleChangingTrophyIcon = async newTrophyStatus => {
    setModalOpen(false);
    await dispatch(postLeaderboardData(summary._id, newTrophyStatus));

    setTrophyFollowedUp(newTrophyStatus);

    toast.success('Trophy status updated successfully');
  };

  const googleDocLink = summary.adminLinks?.reduce((targetLink, currentElement) => {
    if (currentElement.Name === 'Google Doc') {
      // eslint-disable-next-line no-param-reassign
      targetLink = currentElement.Link;
    }
    return targetLink;
  }, undefined);

  const summarySubmissionDate = moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .subtract(weekIndex, 'week')
    .format('YYYY-MM-DD');

  const durationSinceStarted = calculateDurationBetweenDates(
    summarySubmissionDate,
    summary?.startDate?.split('T')[0] || null,
  );

  const handleIconContent = duration => {
    if (duration.months >= 5.8 && duration.months <= 6.2) {
      return '6M';
    }
    if (duration.years >= 0.9) {
      return `${Math.round(duration.years)}Y`;
    }
    return null;
  };

  // if (isLastWeekReport(weekIndex)) {
  //   return <b style={{ fontWeight: 'bold', fontSize: '1.2em' }}>FINAL WEEK REPORTING</b>;
  // }

  // const isFinalWeek = isLastWeekReport(weekIndex);
  // const isFinalWeek = weekIndex === 0 && isLastWeekReport(summary.startDate, summary.endDate);

  const finalWeekStart = moment()
    .tz('America/Los_Angeles')
    .startOf('week')
    .subtract(1, 'week')
    .format('MMM D, YYYY');
  const finalWeekEnd = moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .subtract(1, 'week')
    .format('MMM D, YYYY');

  return (
    <>
      <b>Name: </b>
      <Link
        className="ml-2"
        to={`/userProfile/${summary._id}`}
        style={{
          color:
            currentDate.isSameOrAfter(moment(summary.timeOffFrom, 'YYYY-MM-DDTHH:mm:ss.SSSZ')) &&
            currentDate.isBefore(moment(summary.timeOffTill, 'YYYY-MM-DDTHH:mm:ss.SSSZ'))
              ? 'rgba(128, 128, 128, 0.5)'
              : '#007BFF',
        }}
        title="View Profile"
      >
        {summary.firstName} {summary.lastName}
      </Link>

      <div style={{ display: 'inline-block' }}>
        <div style={{ display: 'flex' }}>
          <GoogleDocIcon link={googleDocLink} />
          <span>
            <b>
              &nbsp;&nbsp;
              {summary.role !== 'Volunteer' && `(${summary.role})`}
            </b>
          </span>
          {summary.role !== 'Volunteer' && (
            <RoleInfoModal
              info={allRoleInfo.find(item => item.infoName === `${summary.role}Info`)}
              auth={auth}
            />
          )}
          {loadTrophies &&
            showTrophyIcon(summarySubmissionDate, summary?.startDate?.split('T')[0] || null) && (
              <i
                className="fa fa-trophy"
                style={{
                  marginLeft: '10px',
                  fontSize: '25px',
                  cursor: 'pointer',
                  color: summary?.trophyFollowedUp === true ? '#ffbb00' : '#FF0800',
                }}
                onClick={trophyIconToggle}
              >
                <p style={{ fontSize: '10px', marginLeft: '5px' }}>
                  {handleIconContent(durationSinceStarted)}
                </p>
              </i>
            )}
          <Modal isOpen={modalOpen === summary._id} toggle={trophyIconToggle}>
            <ModalHeader toggle={trophyIconToggle}>Followed Up?</ModalHeader>
            <ModalBody>
              <p>Are you sure you have followed up this icon?</p>
            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" onClick={trophyIconToggle}>
                Cancel
              </Button>{' '}
              <Button
                color="primary"
                onClick={() => {
                  handleChangingTrophyIcon(true);
                }}
              >
                Confirm
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>

      <div style={{ display: 'inline-block', marginLeft: '10px' }}>
        {colors.map(color => (
          <span
            key={color}
            onClick={() => handleSpecialColorDotClick(summary._id, color)}
            style={{
              display: 'inline-block',
              width: '15px',
              height: '15px',
              margin: '0 5px',
              borderRadius: '50%',
              backgroundColor: summary.filterColor === color ? color : 'transparent',
              border: `3px solid ${color}`,
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      {/* This conditional message ONLY on last week tab */}
      {/* {isFinalWeek && (
        <p style={{ color: '#8B0000', fontWeight: 'bold', marginTop: '5px' }}>
          FINAL WEEK REPORTING: This team member is no longer active
        </p>
      )} */}
      {isFinalWeek && (
        <p style={{ color: '#8B0000', fontWeight: 'bold', marginTop: '5px' }}>
          FINAL WEEK REPORTING: This team member is no longer active
          <br />
          <small>
            (Final Week: {finalWeekStart} - {finalWeekEnd})
          </small>
        </p>
      )}

      {showStar(hoursLogged, summary.promisedHoursByWeek[weekIndex]) && (
        <i
          className="fa fa-star"
          title={`Weekly Committed: ${summary.promisedHoursByWeek[weekIndex]} hours`}
          style={{
            color: assignStarDotColors(hoursLogged, summary.promisedHoursByWeek[weekIndex]),
            fontSize: '55px',
            marginLeft: '10px',
            verticalAlign: 'middle',
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '10px',
            }}
          >
            +{Math.round((hoursLogged / summary.promisedHoursByWeek[weekIndex] - 1) * 100)}%
          </span>
        </i>
      )}
    </>
  );
}

FormattedReport.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  summaries: PropTypes.arrayOf(PropTypes.object).isRequired,
  weekIndex: PropTypes.number.isRequired,
};

export default FormattedReport;
