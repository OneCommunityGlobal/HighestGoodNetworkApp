/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'moment-timezone';
import ReactHtmlParser from 'react-html-parser';
import { Link } from 'react-router-dom';
import './WeeklySummariesReport.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assignStarDotColors, showStar } from 'utils/leaderboardPermissions';
import RoleInfoModal from 'components/UserProfile/EditableModal/roleInfoModal';
import useIsInViewPort from 'utils/useIsInViewPort';
import {
  Input,
  ListGroup,
  ListGroupItem as LGI,
  Card,
  CardTitle,
  CardBody,
  CardImg,
  CardText,
  UncontrolledPopover,
} from 'reactstrap';
import { ENDPOINTS } from '../../utils/URL';
import ToggleSwitch from '../UserProfile/UserProfileEdit/ToggleSwitch';
import googleDocIconGray from './google_doc_icon_gray.png';
import googleDocIconPng from './google_doc_icon.png';

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
}) {
  const emails = [];

  summaries.forEach(summary => {
    if (summary.email !== undefined && summary.email !== null) {
      emails.push(summary.email);
    }
  });

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
            badges={badges}
            loadBadges={loadBadges}
          />
        ))}
      </ListGroup>
      <h4>Emails</h4>
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
}) {
  const ref = useRef(null);
  const isInViewPort = useIsInViewPort(ref);

  const hoursLogged = (summary.totalSeconds[weekIndex] || 0) / 3600;

  return (
    <li className="list-group-item px-0" ref={ref}>
      <ListGroup className="px-0" flush>
        <ListGroupItem>
          <Index summary={summary} weekIndex={weekIndex} allRoleInfo={allRoleInfo} />
        </ListGroupItem>
        {isInViewPort && (
          <>
            <ListGroupItem>
              <b>Media URL:</b> <MediaUrlLink summary={summary} />
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
            {hoursLogged >= summary.promisedHoursByWeek[weekIndex] && (
              <ListGroupItem>
                <p>
                  <b
                    style={{
                      color: textColors[summary?.weeklySummaryOption] || textColors.Default,
                    }}
                  >
                    Hours logged:{' '}
                  </b>
                  {hoursLogged.toFixed(2)} / {summary.promisedHoursByWeek[weekIndex]}
                </p>
              </ListGroupItem>
            )}
            {hoursLogged < summary.promisedHoursByWeek[weekIndex] && (
              <ListGroupItem>
                <b
                  style={{
                    color: textColors[summary?.weeklySummaryOption] || textColors.Default,
                  }}
                >
                  Hours logged:
                </b>
                <span className="ml-2">
                  {hoursLogged.toFixed(2)} / {summary.promisedHoursByWeek[weekIndex]}
                </span>
              </ListGroupItem>
            )}
            {loadBadges && summary.badgeCollection?.length > 0 && (
              <ListGroupItem>
                <WeeklyBadge summary={summary} weekIndex={weekIndex} badges={badges} />
              </ListGroupItem>
            )}
            <ListGroupItem>
              <WeeklySummaryMessage summary={summary} weekIndex={weekIndex} />
            </ListGroupItem>
          </>
        )}
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

      return <div style={style}>{ReactHtmlParser(summaryText)}</div>;
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

function MediaUrlLink({ summary }) {
  if (summary.mediaUrl) {
    return (
      <a href={summary.mediaUrl} target="_blank" rel="noopener noreferrer">
        Open link to media files
      </a>
    );
  }

  if (summary.adminLinks) {
    const link = summary.adminLinks.find(item => item.Name === 'Media Folder');
    if (link) {
      return (
        <a href={link.Link} target="_blank" rel="noopener noreferrer">
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
  const isMeetCriteria = totalTangibleHrs > 80 && daysInTeam > 60 && bioPosted !== 'posted';
  const style = { color: textColors[summary?.weeklySummaryOption] || textColors.Default };

  // eslint-disable-next-line no-shadow
  const handleChangeBioPosted = async (userId, bioStatus) => {
    try {
      const url = ENDPOINTS.USER_PROFILE(userId);
      const response = await axios.get(url);
      const userProfile = response.data;
      const res = await axios.put(url, {
        ...userProfile,
        bioPosted: bioStatus,
      });
      if (res.status === 200) {
        toast.success('You have changed the bio announcement status of this user.');
      }
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('An error occurred while attempting to save the bioPosted change to the profile.');
    }
  };

  return (
    <div style={isMeetCriteria ? { backgroundColor: 'yellow' } : {}}>
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
      if (badge.earnedDate[0] <= badgeEndDate && badge.earnedDate[0] >= badgeStartDate) {
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
      const badge = badges.filter(badge => badge._id === badgeId)[0];
      badgeThisWeek.push(badge);
    });
  }
  return (
    <table>
      <tbody>
        <tr className="badge-tr" key={`${weekIndex}badge_${summary._id}`}>
          {badgeThisWeek.length > 0
            ? badgeThisWeek.map(
                (value, index) =>
                  value?.showReport && (
                    // eslint-disable-next-line react/no-array-index-key
                    <td className="badge-td" key={`${weekIndex}_${summary._id}_${index}`}>
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
                    </td>
                  ),
              )
            : null}
        </tr>
      </tbody>
    </table>
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
