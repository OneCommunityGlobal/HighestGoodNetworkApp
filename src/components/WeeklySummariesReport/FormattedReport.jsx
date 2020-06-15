import React from 'react';
import moment from 'moment';
import ReactHtmlParser from 'react-html-parser';

const FormattedReport = ({ summaries, weekIndex }) => {
  let wsReport = '';
  const weeklySummaryNotProvidedMessage = '<div><b>Weekly Summary:</b> Not provided!</div>';
  summaries.forEach((eachSummary) => {
    const {
      firstName, lastName, weeklySummaries, mediaUrl, weeklySummariesCount,
    } = eachSummary;

    const mediaUrlLink = mediaUrl ? `<a href=${mediaUrl} target="_blank" rel="noopener noreferrer">Open link to media files</a>` : 'Not provided!';
    const totalValidWeeklySummaries = weeklySummariesCount || 'No valid submissions yet!';
    let weeklySummaryMessage = weeklySummaryNotProvidedMessage;
    if (Array.isArray(weeklySummaries) && weeklySummaries.length && weeklySummaries[weekIndex]) {
      const { dueDate, summary } = weeklySummaries[weekIndex];
      if (summary) {
        weeklySummaryMessage = `<b>Weekly Summary</b> (for the week ending on <b>${moment(dueDate).format('YYYY-MM-DD')}</b>):<br />
                                <div style="padding: 10px 20px 0;">${summary}</div>`;
      }
    }

    wsReport += `\n
    <div style="padding: 20px 0; margin-top: 5px; border-bottom: 1px solid #DEE2E6;">
      <b>Name:</b> ${firstName} ${lastName}<br />
      <b>Media URL:</b> ${mediaUrlLink}<br />
      <b>Total Valid Weekly Summaries:</b> ${totalValidWeeklySummaries}<br />
      ${weeklySummaryMessage}
    </div>`;
  });

  return (
    <div>{ReactHtmlParser(wsReport)}</div>
  );
};

export default FormattedReport;
