import React from 'react';
import './TeamWeeklySummaries.css';
import moment from 'moment';
import parse from 'html-react-parser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

function TeamWeeklySummaries({ name, i, data }) {
  const getWeekDates = weekIndex => ({
    fromDate: moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .subtract(weekIndex, 'week')
      .format('DD-MMM-YY'),
    toDate: moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(weekIndex, 'week')
      .format('DD-MMM-YY'),
  });
  return (
    <div className="team-weekly-summaries" data-testid="team-weekly-summaries">
      <div className="team-weekly-header" >
        <h6 className="team-weekly-header-date">
          {getWeekDates(i).fromDate} to {getWeekDates(i).toDate}
        </h6>{' '}
        <h6>
          {i === 0 && !data.summary && `${name} did not submit a summary yet for this week.`}
          {data.summary && `Viewing ${name}'s summary`}
          {i !== 0 && !data.summary && `${name} did not submit a summary for this week.`}
        </h6>
      </div>
      {data.summary && (
        <div className="team-weekly-summary-container">
          <div className="team-week-summary-text"> {parse(data.summary)}</div>
          <FontAwesomeIcon
            icon={faCopy}
            className="copy-icon"
            data-testid="copy-icon"
            onClick={() => {
              const parsedSummary = data.summary.replace(/<\/?[^>]+>|&nbsp;/g, '');
              navigator.clipboard.writeText(parsedSummary);
              toast.success('Summary Copied!');
            }}
          />
        </div>
      )}
    </div>
  );
}

export default TeamWeeklySummaries;
