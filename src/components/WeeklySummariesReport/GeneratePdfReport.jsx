import PropTypes from 'prop-types';
import React from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import moment from 'moment-timezone';
import { Button } from 'reactstrap';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const GeneratePdfReport = ({ summaries, weekIndex, weekDates }) => {
  const generateFormattedReport = () => {
    const emails = [];

    let wsReport = `<h1>Weekly Summaries Report</h1>
    <div style="margin-bottom: 20px; color: orange;">From <b>${weekDates.fromDate}</b> to <b>${weekDates.toDate}</b></div>`;

    const weeklySummaryNotProvidedMessage =
      '<div><b>Weekly Summary:</b> <span style="color: red;">Not provided!</span></div>';
    const weeklySummaryNotRequiredMessage =
      '<div><b>Weekly Summary:</b> <span style="color: magenta;">Not required for this user</span></div>';

    summaries.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastname}`),
    );

    summaries.forEach((eachSummary) => {
      const {
        firstName,
        lastName,
        weeklySummaries,
        mediaUrl,
        weeklySummariesCount,
        weeklyComittedHours,
        totalSeconds,
      } = eachSummary;

      const hoursLogged = (totalSeconds[weekIndex] || 0) / 3600;

      if (eachSummary.email !== undefined && eachSummary.email !== null) {
        emails.push(eachSummary.email);
      }

      const mediaUrlLink = mediaUrl
        ? `<a href=${mediaUrl}>Open link to media files</a>`
        : '<span style="color: red;">Not provided!</span>';

      const totalValidWeeklySummaries = weeklySummariesCount || 'No valid submissions yet!';

      let weeklySummaryMessage = weeklySummaryNotProvidedMessage;

      if (Array.isArray(weeklySummaries) && weeklySummaries[weekIndex]) {
        const { dueDate, summary } = weeklySummaries[weekIndex];
        if (summary) {
          weeklySummaryMessage = `<div><b>Weekly Summary</b> (for the week ending on <b>${moment(
            dueDate,
          )
            .tz('America/Los_Angeles')
            .format('YYYY-MMM-DD')}</b>):</div>
                                  <div data-pdfmake="{&quot;margin&quot;:[20,0,20,0]}">${summary}</div>`;
        } else if (eachSummary.weeklySummaryNotReq === true) {
          weeklySummaryMessage = weeklySummaryNotRequiredMessage;
        }
      }

      wsReport += `\n
      <div><b>Name:</b> <span class="name">${firstName} ${lastName}</span></div>
      <div><b>Media URL:</b> ${mediaUrlLink}</div>
      <div style="${
        totalValidWeeklySummaries === 8 ? 'text-decoration: underline; color: red;' : ''
      }"><b>Total valid weekly summaries:</b> ${totalValidWeeklySummaries}</div>
      ${
        hoursLogged >= weeklyComittedHours
          ? `<div><b>Hours logged:</b> ${hoursLogged} / ${weeklyComittedHours} </div>`
          : `<div style="color: red;"><b>Hours logged:</b> ${hoursLogged} / ${weeklyComittedHours}</div>`
      }
      ${weeklySummaryMessage}
      <div style="color:#DEE2E6; margin:10px 0px 20px 0px; text-align:center;">_______________________________________________________________________________________________</div>`;
    });

    wsReport += '<h2>Emails</h2>';

    wsReport += [...new Set(emails)] //elimiates duplicate entries if they're somehow present
      .toString()
      .replaceAll(',', ', ');

    return wsReport;
  };

  const generateAndDownloadPdf = () => {
    const html = htmlToPdfmake(generateFormattedReport());

    const docDefinition = {
      content: [html],
      styles: {
        'html-div': { margin: [0, 4, 0, 4] },
        name: {
          background: 'yellow',
        },
      },
    };

    pdfMake
      .createPdf(docDefinition)
      .download(`WeeklySummary-${weekDates.fromDate}-to-${weekDates.toDate}`);
  };

  return (
    <Button className="px-5 btn--dark-sea-green float-right" onClick={generateAndDownloadPdf}>
      Open PDF
    </Button>
  );
};

GeneratePdfReport.propTypes = {
  summaries: PropTypes.arrayOf(PropTypes.object).isRequired,
  weekDates: PropTypes.shape({
    fromDate: PropTypes.string,
    toDate: PropTypes.string,
  }).isRequired,
  weekIndex: PropTypes.string.isRequired,
};

export default GeneratePdfReport;
