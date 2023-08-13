import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'moment-timezone';
import ReactHtmlParser from 'react-html-parser';
import { Link } from 'react-router-dom';
import google_doc_icon from './google_doc_icon.png';
import './WeeklySummariesReport.css';
import { toast } from 'react-toastify';
import ToggleSwitch from '../UserProfile/UserProfileEdit/ToggleSwitch';
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
} from 'reactstrap';

const textColors = {
  Default: '#000000',
  'Not Required': '#708090',
  Team: '#FF00FF',
  'Team Fabulous': '#FF00FF',
  'Team Marigold': '#FF7F00',
  'Team Luminous': '#C4AF18',
  'Team Lush': '#00FF00',
  'Team Sky': '#0000FF',
  'Team Azure': '#4B0082',
  'Team Amethyst': '#9400D3',
};

const FormattedReport = ({ summaries, weekIndex, bioCanEdit, canEditSummaryCount, badges }) => {
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
    } else {
      return 'Not provided!';
    }
  };

  const getGoogleDocLink = summary => {
    if (!summary.adminLinks) {
      return undefined;
    }

    const googleDocLink = summary.adminLinks.find(link => link.Name === 'Google Doc');

    return googleDocLink;
  };

  const getWeeklySummaryMessage = summary => {
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
          color: textColors[summary?.weeklySummaryOption] || textColors['Default'],
        };

        summaryDate = moment(summary.weeklySummaries[weekIndex]?.uploadDate)
          .tz('America/Los_Angeles')
          .format('YYYY-MMM-DD');
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

  const getTotalValidWeeklySummaries = summary => {
    const style = {
      color: textColors[summary?.weeklySummaryOption] || textColors['Default'],
    };

    const [weeklySummariesCount, setWeeklySummariesCount] = useState(
      parseInt(summary.weeklySummariesCount),
    );

    const handleOnChange = async (userProfileSummary, count) => {
      const url = ENDPOINTS.USER_PROFILE_PROPERTY(userProfileSummary._id);
      try {
        await axios.patch(url, { key: 'weeklySummariesCount', value: count });
      } catch (err) {
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
            <b style={style}>Total Valid Weekly Summaries:</b>{' '}
          </div>
        )}
        {canEditSummaryCount ? (
          <div style={{ width: '150px', paddingLeft: '5px' }}>
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
      alert('An error occurred while attempting to save the bioPosted change to the profile.');
    }
  };

  const BioSwitch = (userId, bioPosted, summary) => {
    const [bioStatus, setBioStatus] = useState(bioPosted);
    const style = {
      color: textColors[summary?.weeklySummaryOption] || textColors['Default'],
    };
    return (
      <div>
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
  };

  const BioLabel = (userId, bioPosted, summary) => {
    const style = {
      color: textColors[summary?.weeklySummaryOption] || textColors['Default'],
    };
    return (
      <div>
        <b style={style}>Bio announcement:</b>
        {bioPosted === 'default'
          ? ' Not requested/posted'
          : bioPosted === 'posted'
          ? ' Posted'
          : ' Requested'}
      </div>
    );
  };

  const bioFunction = bioCanEdit ? BioSwitch : BioLabel;

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
          {badgeThisWeek.length > 0
            ? badgeThisWeek.map(
                (value, index) =>
                  value?.showReport && (
                    <tr key={index + '_' + value._id}>
                      <td className="badge_image_sm">
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
                      <td>{value.badgeName}</td>
                    </tr>
                  ),
              )
            : null}
        </tbody>
      </table>
    );
  };

  return (
    <>
      {summaries.map((summary, index) => {
        const hoursLogged = (summary.totalSeconds[weekIndex] || 0) / 3600;

        const googleDocLink = getGoogleDocLink(summary);
        return (
          <div
            style={{ padding: '20px 0', marginTop: '5px', borderBottom: '1px solid #DEE2E6' }}
            key={'summary-' + index}
          >
            <div>
              <b>Name: </b>
              <Link to={`/userProfile/${summary._id}`} title="View Profile">
                {summary.firstName} {summary.lastName}
              </Link>

              <span onClick={() => handleGoogleDocClick(googleDocLink)}>
                <img className="google-doc-icon" src={google_doc_icon} alt="google_doc" />
              </span>
              <span>
                <b>&nbsp;&nbsp;{summary.role !== 'Volunteer' && `(${summary.role})`}</b>
              </span>
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
            {summary.badgeCollection.length > 0 && getWeeklyBadge(summary)}
            <div>
              {' '}
              <b>Media URL:</b> {getMediaUrlLink(summary)}
            </div>
            {bioFunction(summary._id, summary.bioPosted, summary)}
            {getTotalValidWeeklySummaries(summary)}
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
