/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'moment-timezone';
import ReactHtmlParser from 'react-html-parser';
import { Link } from 'react-router-dom';
import './WeeklySummariesReport.css';
import { toast } from 'react-toastify';
import axios from 'axios';

import { assignStarDotColors, showStar } from 'utils/leaderboardPermissions';
import { updateOneSummaryReport } from 'actions/weeklySummariesReport';
import RoleInfoModal from 'components/UserProfile/EditableModal/roleInfoModal';
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
import { faCopy, faMailBulk } from '@fortawesome/free-solid-svg-icons';
import { ENDPOINTS } from '../../utils/URL';
import ToggleSwitch from '../UserProfile/UserProfileEdit/ToggleSwitch';
import googleDocIconGray from './google_doc_icon_gray.png';
import googleDocIconPng from './google_doc_icon.png';
import CopyToClipboard from 'components/common/Clipboard/CopyToClipboard';

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

function ListGroupItem({ children }) {
  return <LGI className="px-0 border-0 py-1">{children}</LGI>;
}

function FormattedReport({
  summaries,
  weekIndex,
  bioCanEdit,
  canEditSummaryCount,
  allRoleInfo,
  badges,
  loadBadges,
  canEditTeamCode,
}) {
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

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const toggleTooltip = () => {
    setTooltipOpen(!tooltipOpen);
  };

  return (
    <>
      <ListGroup flush>
        {summaries.map(summary => (
          <ReportDetails
            key={summary._id}
            summary={summary}
            weekIndex={weekIndex}
            bioCanEdit={bioCanEdit}
            canEditSummaryCount={canEditSummaryCount}
            allRoleInfo={allRoleInfo}
            canEditTeamCode={canEditTeamCode}
            badges={badges}
            loadBadges={loadBadges}
          />
        ))}
      </ListGroup>
      <div className="d-flex align-items-center">
        <h4>Emails</h4>
        <Tooltip placement="top" isOpen={tooltipOpen} target="emailIcon" toggle={toggleTooltip}>
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
        <CopyToClipboard writeText={emails.join(', ')} message="Emails Copied!"/>
      </div>
      <p>{emails.join(', ')}</p>
    </>
  );
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
}) {
  const ref = useRef(null);

  const hoursLogged = (summary.totalSeconds[weekIndex] || 0) / 3600;
  if(summary.lastName === "lallouache"){
    console.log(summary)
  }
  return (
    <li className="list-group-item px-0" ref={ref}>
      <ListGroup className="px-0" flush>
        <ListGroupItem>
          <Index summary={summary} weekIndex={weekIndex} allRoleInfo={allRoleInfo} />
        </ListGroupItem>
        <Row className="flex-nowrap">
          <Col xs="6" className="flex-grow-0">
            <ListGroupItem>
              <TeamCodeRow canEditTeamCode={canEditTeamCode} summary={summary} />
            </ListGroupItem>
            <ListGroupItem>
              <Bio
                bioCanEdit={bioCanEdit}
                userId={summary._id}
                bioPosted={summary.bioPosted}
                summary={summary}
                totalTangibleHrs={summary.totalTangibleHrs}
                daysInTeam={summary.daysInTeam}
              />
            </ListGroupItem>
            <ListGroupItem>
              <TotalValidWeeklySummaries
                summary={summary}
                canEditSummaryCount={canEditSummaryCount}
              />
            </ListGroupItem>
            <ListGroupItem>
              <b style={{color: textColors[summary?.weeklySummaryOption] || textColors.Default}}>
                Hours logged:
              </b>
              {(hoursLogged >= summary.promisedHoursByWeek[weekIndex])
                ? <p>{hoursLogged.toFixed(2)} / {summary.promisedHoursByWeek[weekIndex]}</p>
                : <span className="ml-2">{hoursLogged.toFixed(2)} / {summary.promisedHoursByWeek[weekIndex]}</span>
              }
            </ListGroupItem>
            <ListGroupItem>
              <WeeklySummaryMessage summary={summary} weekIndex={weekIndex} />
            </ListGroupItem>
          </Col>
          <Col xs="6">
            {loadBadges && summary.badgeCollection?.length > 0 && (
              <WeeklyBadge summary={summary} weekIndex={weekIndex} badges={badges} />
            )}
          </Col>
        </Row>
      </ListGroup>
    </li>
  );
}

function WeeklySummaryMessage({ summary, weekIndex }) {

  const summaryText = summary?.weeklySummaries[weekIndex]?.summary;
  let summaryDate = moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .subtract(weekIndex, 'week')
    .format('YYYY-MMM-DD');

  let summaryDateText = `Weekly Summary (${summaryDate}):`;

  const isSummaryNotRequiredOrNotProvided =
    summary?.weeklySummaryOption === 'Not Required' ||
    (!summary?.weeklySummaryOption && summary.weeklySummaryNotReq);

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
        <div style={style} className="weekly-summary-report-container">
          <div className="weekly-summary-text">{ReactHtmlParser(summaryText)}</div>
          {!isSummaryNotRequiredOrNotProvided && summaryText && (<FontAwesomeIcon
            icon={faCopy}
            className="copy-icon "
            onClick={() => {
              const parsedSummary = summaryText.replace(/<\/?[^>]+>|&nbsp;/g, '');
              navigator.clipboard.writeText(parsedSummary);
              toast.success('Summary Copied!');
            }}
          />
          )}

        </div>
      );
    }

    if (isSummaryNotRequiredOrNotProvided) {
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


function copyToClipboard(htmlString) {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = htmlString;
  const textToCopy = tempElement.textContent || tempElement.innerText || '';

  navigator.clipboard.writeText(textToCopy).then(
    () => {
      toast.success('Weekly Summary Copied!');
    },
    (err) => {
      console.error('Failed to copy: ', err);
    }
  );
}

function TeamCodeRow({ canEditTeamCode, summary }) {
  const [teamCode, setTeamCode] = useState(summary.teamCode);
  const [hasError, setHasError] = useState(false);
  const fullCodeRegex = /^([a-zA-Z]-[a-zA-Z]{3}|[a-zA-Z]{5})$/;

  const handleOnChange = async (userProfileSummary, newStatus) => {
    const url = ENDPOINTS.USER_PROFILE_PROPERTY(userProfileSummary._id);
    try {
      await axios.patch(url, { key: 'teamCode', value: newStatus });
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(
        `An error occurred while attempting to save the new team code change to the profile.${err}`,
      );
    }
  };

  const handleCodeChange = e => {
    const { value } = e.target;

    if (value.length <= 5) {
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

  return (
    <>
      <div className="teamcode-wrapper">
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
        <Alert className="code-alert" color="danger">
          NOT SAVED! The code format must be A-AAA or AAAAA.
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
        style={{ paddingLeft: '5px' }}
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
  return 'Not provided!';
}

function TotalValidWeeklySummaries({ summary, canEditSummaryCount }) {
  const style = {
    color: textColors[summary?.weeklySummaryOption] || textColors.Default,
  };

  const [weeklySummariesCount, setWeeklySummariesCount] = useState(
    // eslint-disable-next-line radix
    parseInt(summary.weeklySummariesCount),
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
    <div className="total-valid-wrapper">
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

function BioSwitch({ userId, bioPosted, summary, totalTangibleHrs, daysInTeam }) {
  const [bioStatus, setBioStatus] = useState(bioPosted);
  const dispatch = useDispatch();
  const isMeetCriteria = totalTangibleHrs > 80 && daysInTeam > 60 && bioPosted !== 'posted';
  const style = { color: textColors[summary?.weeklySummaryOption] || textColors.Default };

  // eslint-disable-next-line no-shadow
  const handleChangeBioPosted = async (userId, bioStatus) => {
    const res = await dispatch(updateOneSummaryReport(userId, { bioPosted: bioStatus }));
    if (res.status === 200) {
      toast.success('You have changed the bio announcement status of this user.');
    }
  };

  return (
    <div style={{ width: '200%', backgroundColor: isMeetCriteria ? 'yellow' : 'none' }}>
      <div className="bio-toggle">
        <b style={style}>Bio announcement:</b>
      </div>
      <div className="bio-toggle">
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
    text = ' Not requested/posted';
  } else if (bioPosted === 'posted') {
    text = 'Posted';
  } else {
    text = 'Requested';
  }
  return (
    <div>
      <b style={style}>Bio announcement:</b>
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
          <div className="badge-td" key={`${weekIndex}_${summary._id}_${index}`}>
            {' '}
            <img src={value.imageUrl} id={`popover_${value._id}`} alt='""' />
            <UncontrolledPopover trigger="hover" target={`popover_${value._id}`}>
              <Card className="text-center">
                <CardImg className="badge_image_lg" src={value?.imageUrl} />
                <CardBody>
                  <CardTitle
                    style={{
                      fontWeight: 'bold',
                      fontSize: 18,
                      color: '#285739',
                      marginBottom: 15,
                    }}
                  >
                    {value?.badgeName}
                  </CardTitle>
                  <CardText>{value?.description}</CardText>
                </CardBody>
              </Card>
            </UncontrolledPopover>
          </div>
        ))}
      </ListGroupItem>
    )
  );
}

function Index({ summary, weekIndex, allRoleInfo }) {
  const handleGoogleDocClick = googleDocLink => {
    const toastGoogleLinkDoesNotExist = 'toast-on-click';
    if (googleDocLink && googleDocLink.Link && googleDocLink.Link.trim() !== '') {
      window.open(googleDocLink.Link);
    } else {
      toast.error(
        'Uh oh, no Google Doc is present for this user! Please contact an Admin to find out why.',
        {
          toastId: toastGoogleLinkDoesNotExist,
          pauseOnFocusLoss: false,
          autoClose: 3000,
        },
      );
    }
  };

  // eslint-disable-next-line no-shadow
  const getGoogleDocLink = summary => {
    if (!summary.adminLinks) {
      return undefined;
    }
    const googleDocLink = summary.adminLinks.find(link => link.Name === 'Google Doc');
    return googleDocLink;
  };

  const hoursLogged = (summary.totalSeconds[weekIndex] || 0) / 3600;

  const googleDocLink = getGoogleDocLink(summary);
  // Determine whether to use grayscale or color icon based on googleDocLink
  const googleDocIcon =
    googleDocLink && googleDocLink.Link.trim() !== '' ? googleDocIconPng : googleDocIconGray;

  return (
    <>
      <b>Name: </b>
      <Link className="ml-2" to={`/userProfile/${summary._id}`} title="View Profile">
        {summary.firstName} {summary.lastName}
      </Link>

      <span onClick={() => handleGoogleDocClick(googleDocLink)}>
        <img className="google-doc-icon" src={googleDocIcon} alt="google_doc" />
      </span>
      <span>
        <b>&nbsp;&nbsp;{summary.role !== 'Volunteer' && `(${summary.role})`}</b>
      </span>
      {summary.role !== 'Volunteer' && (
        <RoleInfoModal info={allRoleInfo.find(item => item.infoName === `${summary.role}Info`)} />
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
