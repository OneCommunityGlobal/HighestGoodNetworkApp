/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'moment-timezone';
import ReactHtmlParser from 'react-html-parser';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

import { assignStarDotColors, showStar } from 'utils/leaderboardPermissions';
import { toggleUserBio } from 'actions/weeklySummariesReport';
import RoleInfoModal from 'components/UserProfile/EditableModal/RoleInfoModal';
import {
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
import { faMailBulk } from '@fortawesome/free-solid-svg-icons';
import CopyToClipboard from 'components/common/Clipboard/CopyToClipboard';
import styles from './WeeklySummariesReport.module.scss';
import hasPermission from '../../utils/permissions';
import { ENDPOINTS } from '../../utils/URL';
import ToggleSwitch from '../UserProfile/UserProfileEdit/ToggleSwitch';
import GoogleDocIcon from '../common/GoogleDocIcon';
import { cantUpdateDevAdminDetails } from '../../utils/permissions';

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
  canEditTeamCode,
  auth,
  canSeeBioHighlight,
  darkMode,
  handleTeamCodeChange,
  handleSpecialColorDotClick,
}) {
  const loggedInUserEmail = auth?.user?.email ? auth.user.email : '';

  const dispatch = useDispatch();
  const isEditCount = dispatch(hasPermission('totalValidWeeklySummaries'));

  return (
    <>
      <ListGroup flush>
        {summaries.map(summary => (
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
            loadBzadges={loadBadges}
            canSeeBioHighlight={canSeeBioHighlight}
            darkMode={darkMode}
            handleTeamCodeChange={handleTeamCodeChange}
            auth={auth}
            handleSpecialColorDotClick={handleSpecialColorDotClick}
          />
        ))}
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

function ReportDetails({
  summary,
  weekIndex,
  bioCanEdit,
  canEditSummaryCount,
  allRoleInfo,
  badges,
  loadBadges,
  canEditTeamCode,
  canSeeBioHighlight,
  loggedInUserEmail,
  darkMode,
  handleTeamCodeChange,
  auth,
  handleSpecialColorDotClick,
}) {
  const [filteredBadges, setFilteredBadges] = useState([]);
  const ref = useRef(null);
  const cantEditJaeRelatedRecord = cantUpdateDevAdminDetails(summary.email, loggedInUserEmail);

  const hoursLogged = (summary.totalSeconds[weekIndex] || 0) / 3600;
  const isMeetCriteria =
    canSeeBioHighlight &&
    summary.totalTangibleHrs > 80 &&
    summary.daysInTeam > 60 &&
    summary.bioPosted !== 'posted';

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
            handleSpecialColorDotClick={handleSpecialColorDotClick}
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
              />
            </ListGroupItem>
            <ListGroupItem darkMode={darkMode}>
              <div style={{ width: '200%', backgroundColor: isMeetCriteria ? 'yellow' : 'none' }}>
                <Bio
                  bioCanEdit={bioCanEdit && !cantEditJaeRelatedRecord}
                  userId={summary._id}
                  bioPosted={summary.bioPosted}
                  summary={summary}
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
          <div className={styles.weeklySummaryText}>{ReactHtmlParser(summaryText)}</div>
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

function TeamCodeRow({ canEditTeamCode, summary, handleTeamCodeChange, darkMode }) {
  const [teamCode, setTeamCode] = useState(summary.teamCode);
  const [hasError, setHasError] = useState(false);
  const fullCodeRegex = /^.{5,7}$/;

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
          <div style={{ width: '107px', paddingRight: '5px' }}>
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
        <div>&nbsp;{weeklySummariesCount || 'No valid submissions yet!'}</div>
      )}
    </div>
  );
}

function Bio({ bioCanEdit, ...props }) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return bioCanEdit ? <BioSwitch {...props} /> : <BioLabel {...props} />;
}

function BioSwitch({ userId, bioPosted, summary }) {
  const [bioStatus, setBioStatus] = useState(bioPosted);
  const dispatch = useDispatch();
  const style = { color: textColors[summary?.weeklySummaryOption] || textColors.Default };

  // eslint-disable-next-line no-shadow
  const handleChangeBioPosted = async (userId, bioStatus) => {
    const res = await dispatch(toggleUserBio(userId, bioStatus));
    if (res.status === 200) {
      toast.success('You have changed the bio announcement status of this user.');
    }
  };

  return (
    <div>
      <div className={styles.bioToggle}>
        <b style={style}>Bio announcement:</b>
      </div>
      <div className={styles.bioToggle}>
        <ToggleSwitch
          switchType="bio"
          state={bioStatus}
          handleUserProfile={bio => {
            setBioStatus(bio);
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
    <div>
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

function Index({ summary, weekIndex, allRoleInfo, auth, handleSpecialColorDotClick }) {
  const hoursLogged = (summary.totalSeconds[weekIndex] || 0) / 3600;
  const currentDate = moment.tz('America/Los_Angeles').startOf('day');
  const colors = ['purple', 'green', 'navy'];

  const googleDocLink = summary.adminLinks?.reduce((targetLink, currentElement) => {
    if (currentElement.Name === 'Google Doc') {
      // eslint-disable-next-line no-param-reassign
      targetLink = currentElement.Link;
    }
    return targetLink;
  }, undefined);

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
            <b>&nbsp;&nbsp;{summary.role !== 'Volunteer' && `(${summary.role})`}</b>
          </span>
          {summary.role !== 'Volunteer' && (
            <RoleInfoModal
              info={allRoleInfo.find(item => item.infoName === `${summary.role}Info`)}
              auth={auth}
            />
          )}
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
