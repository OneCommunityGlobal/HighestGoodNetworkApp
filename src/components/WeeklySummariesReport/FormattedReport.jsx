import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import 'moment-timezone'
import ReactHtmlParser from 'react-html-parser'

const FormattedReport = ({ summaries, weekIndex }) => {

  const emails = [];

  summaries.forEach((summary) => {
    if(summary.email !== undefined && summary.email !== null) {
      emails.push(summary.email);
    }
  });

  //Necessary because our version of node is outdated
  //and doesn't have String.prototype.replaceAll
  let emailString = [...(new Set(emails))].toString();
  while(emailString.includes(',')) emailString = emailString.replace(',', '\n');
  while(emailString.includes('\n')) emailString = emailString.replace('\n', ', ');

  const alphabetize = summaries => {
    return summaries.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastname}`),
    )
  }

  const getMediaUrlLink = summary => {
    if (summary.mediaUrl) {
      return (
        <a href={summary.mediaUrl} target="_blank" rel="noopener noreferrer">
          Open link to media files
        </a>
      )
    } else {
      return 'Not provided!'
    }
  }

  const getWeeklySummaryMessage = summary => {
    if (summary) {
      return (
        <>
          <b>Weekly Summary</b> (for the week ending on
          <b>
            {moment(summary.weeklySummaries[weekIndex]?.dueDate)
              .tz('America/Los_Angeles')
              .format('YYYY-MMM-DD')}
          </b>
          ):
          <div style={{ padding: '10px 20px 0' }}>{summary?.weeklySummaries[weekIndex]?.summary}</div>
        </>
      )
    } else {
      return (
        <p>
          <b>Weekly Summary:</b> Not provided!
        </p>
      )
    }
  }

  const getTotalValidWeeklySummaries = summary => {
    return (
      <p style={summary.weeklySummariesCount === 8 ? {color: 'red'} : {}}>
        <b>Total Valid Weekly Summaries:</b>{' '}
         {summary.weeklySummariesCount || 'No valid submissions yet!'} 
      </p>
    )
  }

  return (
    <>
      {alphabetize(summaries).map((summary, index) => (
        <div
          style={{ padding: '20px 0', marginTop: '5px', borderBottom: '1px solid #DEE2E6' }}
          key={'summary-' + index}
        >
          <p>
            <b>Name:</b> {summary.firstName} {summary.lastName}
          </p>
          <p>
            {' '}
            <b>Media URL:</b> {getMediaUrlLink(summary)}
          </p>
          {getTotalValidWeeklySummaries(summary)}
          <p>
            <b>Committed weekly hours:</b> {summary.weeklyComittedHours}
          </p>
          {getWeeklySummaryMessage(summary)}
        </div>
      ))}
      <h4>Emails</h4>
      <p>{emailString}</p>
    </>
  )
}

FormattedReport.propTypes = {
  summaries: PropTypes.arrayOf(PropTypes.object).isRequired,
  weekIndex: PropTypes.string.isRequired,
}

export default FormattedReport
