import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'moment-timezone';
import ReactHtmlParser from 'react-html-parser';
import { Link } from 'react-router-dom';
import google_doc_icon from './google_doc_icon.png';
import google_doc_icon_gray from './google_doc_icon_gray.png';
import './WeeklySummariesReport.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { assignStarDotColors, showStar } from 'utils/leaderboardPermissions';
import {
  Input,
  Card,
  CardTitle,
  CardBody,
  CardImg,
  CardText,
  UncontrolledPopover,
  Row,
  Col,
} from 'reactstrap';
import RoleInfoModal from 'components/UserProfile/EditableModal/roleInfoModal';
import BioFunction from './BioFunction';
import TotalValidSummaries from './TotalValidSummaries';

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


const FormattedReport = ({
  summaries,
  weekIndex,
  bioCanEdit,
  canEditSummaryCount,
  allRoleInfo,
  badges,
  canEditTeamCode,
}) => {
  const emails = [];

  summaries.forEach(summary => {
    if (summary.email !== undefined && summary.email !== null) {
      emails.push(summary.email);
    }
  });

  //Necessary because our version of node is outdated
  //and doesn't have String.prototype.replaceAll
  let emailString = [...new Set(emails)].toString();
  while (emailString.includes(',')) emailString = emailString.replace(',', '\n');
  while (emailString.includes('\n')) emailString = emailString.replace('\n', ', ');

  const getMediaUrlLink = summary => {
    if (summary.mediaUrl) {
      return (
        <a href={summary.mediaUrl} target="_blank" rel="noopener noreferrer">
          Open link to media files
        </a>
      );
    } else if (summary.adminLinks) {
      for (const link of summary.adminLinks) {
        if (link.Name === 'Media Folder') {
          return (
            <a href={link.Link} target="_blank" rel="noopener noreferrer">
              Open link to media files
            </a>
          );
        }
      }
    }
    return 'Not provided!';
  };

  const getGoogleDocLink = summary => {
    if (!summary.adminLinks) {
      return undefined;
    }

    const googleDocLink = summary.adminLinks.find(link => link.Name === 'Google Doc');

    return googleDocLink;
  };

  const getWeeklySummaryMessage = summary => {
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
      .format('MMM-DD-YY');
    let summaryDateText = `Weekly Summary (${summaryDate}):`;
    const summaryContent = (() => {
      if (summaryText) {
        const style = {
          color: textColors[summary?.weeklySummaryOption] || textColors['Default'],
        };

        summaryDate = moment(summary.weeklySummaries[weekIndex]?.uploadDate)
          .tz('America/Los_Angeles')
          .format('MMM-DD-YY');
        summaryDateText = `Summary Submitted On (${summaryDate}):`;

        return <div style={style}>{ReactHtmlParser(summaryText)}</div>;
      } else {
        if (
          summary?.weeklySummaryOption === 'Not Required' ||
          (!summary?.weeklySummaryOption && summary.weeklySummaryNotReq)
        ) {
          return <p style={{ color: textColors['Not Required'] }}>Not required for this user</p>;
        } else {
          return <span style={{ color: 'red' }}>Not provided!</span>;
        }
      }
    })();

    return (
      <>
        <p>
          <b>{summaryDateText}</b>
        </p>
        {summaryContent}
      </>
    );
  };

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

  const getUserProfile = async (userId) => {
    const url = ENDPOINTS.USER_PROFILE(userId);
    const response = await axios.get(url);
    return response.data;
  };

  const handleProfileChange = async (userId, newStatus, mode) => {
    const userProfile = await getUserProfile(userId);
    const successMessage = mode == "bio"
      ? 'You have changed the bio announcement status of this user.'
      : 'You have changed the team code of this user.';

    const error = mode == "bio"
      ? 'An error occurred while attempting to save the bioPosted change to the profile.'
      : 'An error occurred while attempting to save the teamCode change to the profile.';

    try {
      const newUserProfile = mode == "bio"
        ? { ...userProfile, bioPosted: newStatus }
        : { ...userProfile, teamCode: newStatus }
      const res = await axios.put(ENDPOINTS.USER_PROFILE(userId), newUserProfile);
      if (res.status === 200) {
        toast.success(successMessage);
      }
    } catch (err) {
      alert(error);
    }
  };

  const getWeeklyBadge = summary => {
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
    let badgeIdThisWeek = [];
    let badgeThisWeek = [];
    summary.badgeCollection.map(badge => {
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
        const badge = badges.filter(badge => badge._id === badgeId)[0];
        badgeThisWeek.push(badge);
      });
    }
    return (
      <table>
        <tbody>
          <tr className="badge-tr" key={weekIndex + 'badge_' + summary._id}>
            {badgeThisWeek.length > 0
              ? badgeThisWeek.map(
                  (value, index) =>
                    value?.showReport && (
                      <td className="badge-td" key={weekIndex + '_' + summary._id + '_' + index}>
                        {' '}
                        <img src={value.imageUrl} id={'popover_' + value._id} />
                        <UncontrolledPopover trigger="hover" target={'popover_' + value._id}>
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
  };

  return (
    <>
      {summaries.map((summary, index) => {
        const hoursLogged = (summary.totalSeconds[weekIndex] || 0) / 3600;

        const googleDocLink = getGoogleDocLink(summary);
        // Determine whether to use grayscale or color icon based on googleDocLink
        const googleDocIcon =
          googleDocLink && googleDocLink.Link.trim() !== ''
            ? google_doc_icon
            : google_doc_icon_gray;
        return (
          <div
            style={{ padding: '20px 0', marginTop: '5px', borderBottom: '1px solid #DEE2E6' }}
            key={'summary-' + index}
          >
            <Row>
              <Col>
                <div style={{ display: 'flex' }}>
                  <b>Name: </b>
                  <Link 
                    style={{ marginLeft: '5px' }}
                    to={`/userProfile/${summary._id}`}
                    title="View Profile"
                  >
                    {summary.firstName} {summary.lastName}
                  </Link>

                  <span onClick={() => handleGoogleDocClick(googleDocLink)}>
                    <img className="google-doc-icon" src={googleDocIcon} alt="google_doc" />
                  </span>
                  <span>
                    <b>&nbsp;&nbsp;{summary.role !== 'Volunteer' && `(${summary.role})`}</b>
                  </span>
                  <div>
                    {(summary.role !== 'Volunteer') && (
                      <RoleInfoModal
                        info={allRoleInfo.find(item => item.infoName === `${summary.role}`+'Info')} 
                      />
                    )}
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
                </div>
              </Col>
              <Col sm="3" xs="3" style={{padding: "0px"}}>
                {canEditTeamCode ? (
                  <Input
                    type="text"
                    name="teamCode"
                    id="teamCode"
                    key={`code_${summary.teamCode}`}
                    defaultValue={summary.teamCode}
                    onBlur={e => {
                      if(e.target.value != summary.teamCode){
                        handleProfileChange(summary._id, e.target.value, "teamCode");
                      }
                    }}
                    placeholder="format: A-AAA"
                  />
                ) : (
                  `${summary.teamCode == ''? "No assigned team code": summary.teamCode}`
                )}
              </Col>
            </Row>
            <div>
              {' '}
              <b>Media URL:</b> {getMediaUrlLink(summary)}
            </div>
            <BioFunction 
              key={`bio_${summary.id}_${summary.bioPosted}`}
              userId={summary._id}
              bioPosted={summary.bioPosted} 
              summary={summary}
              totalTangibleHrs={summary.totalTangibleHrs}
              daysInTeam={summary.daysInTeam}
              textColors={textColors}
              bioCanEdit={bioCanEdit}
              handleProfileChange={handleProfileChange}
            />
            <div className="nonsummary-wrapper">
              <div>
                <TotalValidSummaries 
                  key={`count_${summary.weeklySummariesCount}`}
                  summary={summary} 
                  canEditSummaryCount={canEditSummaryCount}
                  textColors={textColors}
                />
                {hoursLogged >= summary.promisedHoursByWeek[weekIndex] && (
                  <p>
                    <b
                      style={{
                        color: textColors[summary?.weeklySummaryOption] || textColors['Default'],
                      }}
                    >
                      Hours logged:{' '}
                    </b>
                    {hoursLogged.toFixed(2)} / {summary.promisedHoursByWeek[weekIndex]}
                  </p>
                )}
                {hoursLogged < summary.promisedHoursByWeek[weekIndex] && (
                  <p>
                    <b
                      style={{
                        color: textColors[summary?.weeklySummaryOption] || textColors['Default'],
                      }}
                    >
                      Hours logged:
                    </b>{' '}
                    {hoursLogged.toFixed(2)} / {summary.promisedHoursByWeek[weekIndex]}
                  </p>
                )}
              </div>
              <div>{summary.badgeCollection.length > 0 && getWeeklyBadge(summary)}</div>
            </div>
            {getWeeklySummaryMessage(summary)}
          </div>
        );
      })}
      <h4>Emails</h4>
      <p>{emailString}</p>
    </>
  );
};

FormattedReport.propTypes = {
  summaries: PropTypes.arrayOf(PropTypes.object).isRequired,
  weekIndex: PropTypes.number.isRequired,
};

export default FormattedReport;
