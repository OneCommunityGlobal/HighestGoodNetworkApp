import React from 'react';
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
import { useState } from 'react';
import { assignStarDotColors, showStar } from 'utils/leaderboardPermissions';

const FormattedReport = ({ summaries, weekIndex, bioCanEdit }) => {
  const emails = [];
  //const bioCanEdit = role === 'Owner' || role === 'Administrator';

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

  const alphabetize = summaries => {
    const temp = [...summaries]
    return temp.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastname}`),
    );
  };

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

    const summaryContent = (() => {
      if (summaryText) {
        const style = {};
        switch (summary?.weeklySummaryOption) {
          case 'Team':
            style.color = 'magenta';
            break;
          case 'Not Required':
            style.color = 'green';
            break;
          case 'Required':
            break;
          default:
            if (summary.weeklySummaryNotReq) {
              style.color = 'green';
            }
            break;
        }
        return <div style={style}>{ReactHtmlParser(summaryText)}</div>;
      } else {
        if (
          summary?.weeklySummaryOption === 'Not Required' ||
          (!summary?.weeklySummaryOption && summary.weeklySummaryNotReq)
        ) {
          return <p style={{ color: 'green' }}>Not required for this user</p>;
        } else {
          return <span style={{ color: 'red' }}>Not provided!</span>;
        }
      }
    })();

    return (
      <>
        <p>
          <b>Weekly Summary</b> (
          {moment(summary.weeklySummaries[weekIndex]?.dueDate)
            .tz('America/Los_Angeles')
            .format('YYYY-MMM-DD')}
          ):
        </p>
        {summaryContent}
      </>
    );
  };

  const getTotalValidWeeklySummaries = summary => {
    return (
      <p style={summary.weeklySummariesCount === 8 ? { color: 'blue' } : {}}>
        <b>Total Valid Weekly Summaries:</b>{' '}
        {summary.weeklySummariesCount || 'No valid submissions yet!'}
      </p>
    );
  };

  const handleGoogleDocClick = googleDocLink => {
    const toastGoogleLinkDoesNotExist = 'toast-on-click';
    if (googleDocLink) {
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

  const bioSwitch = (userId, bioPosted) => {
    const [bioStatus, setBioStatus] = useState(bioPosted);
    return (
      <div>
        <div className="bio-toggle">
          <b>Bio announcement:</b>
        </div>
        <div className="bio-toggle">
          <ToggleSwitch
            switchType="bio"
            state={bioStatus}
            handleUserProfile={(bio) => {
              setBioStatus(bio);
              handleChangeBioPosted(userId, bio);
            }}
          />
        </div>
      </div>
    );
  };

  const bioLabel = (userId, bioPosted) => {
    return (
      <div>
        <b>Bio announcement:</b>
        {bioPosted === 'default' ? ' Not requested/posted' :
         bioPosted === 'posted' ? ' Posted' : 
         ' Requested'}
      </div>
    );
  };

  const bioFunction = bioCanEdit ? bioSwitch : bioLabel;

  return (
    <>
      {alphabetize(summaries).map((summary, index) => {
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
              {showStar(hoursLogged, summary.weeklycommittedHours) && (
                <i
                  className="fa fa-star"
                  title={`Weekly Committed: ${summary.weeklycommittedHours} hours`}
                  style={{
                    color: assignStarDotColors(hoursLogged, summary.weeklycommittedHours),
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
                    +{Math.round((hoursLogged / summary.weeklycommittedHours - 1) * 100)}%
                  </span>
                </i>
              )}
            </div>
            <div>
              {' '}
              <b>Media URL:</b> {getMediaUrlLink(summary)}
            </div>
            {bioFunction(summary._id, summary.bioPosted)}
            {getTotalValidWeeklySummaries(summary)}
            {hoursLogged >= summary.weeklycommittedHours && (
              <p>
                <b>Hours logged:</b> {hoursLogged.toFixed(2)} / {summary.weeklycommittedHours}
              </p>
            )}
            {hoursLogged < summary.weeklycommittedHours && (
              <p style={{ color: 'red' }}>
                <b>Hours logged:</b> {hoursLogged.toFixed(2)} / {summary.weeklycommittedHours}
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
