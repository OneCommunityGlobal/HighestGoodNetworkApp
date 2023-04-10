import React from 'react';
import './TeamWeeklySummaries.css';
import moment from 'moment';

function TeamWeeklySummaries() {
  const getWeekDates = weekIndex => ({
    fromDate: moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .subtract(weekIndex, 'week')
      .format('MMM-DD-YY'),
    toDate: moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(weekIndex, 'week')
      .format('MMM-DD-YY'),
  });
  return (
    <div className="team-weekly-summaries">
      <div className="team-weekly-header">
        <h6 className="team-weekly-header-date">
          {getWeekDates(0).fromDate} to {getWeekDates(0).toDate}
        </h6>{' '}
        <h6> JinchaoCoreTeam Feng did not submit a summary yet for this week.</h6>
      </div>
      <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
        galley of type and scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
        It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
        passages, and more recently with desktop publishing software like Aldus PageMaker including
        versions of Lorem Ipsum.{' '}
      </p>
    </div>
  );
}

export default TeamWeeklySummaries;
