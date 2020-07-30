import PropTypes from 'prop-types';
import React from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import moment from 'moment';
import 'moment-timezone';
import { Button } from 'reactstrap';

pdfMake.vfs = pdfFonts.pdfMake.vfs;


const GeneratePdfReport = ({ summaries, weekIndex, weekDates }) => {
  const FormatReportForPdf = () => {
    let wsReport = `<h3>Weekly Summaries Report</h3>
    <div style="margin-bottom: 20px; color: orange;">From <b>${weekDates.fromDate}</b> to <b>${weekDates.toDate}</b></div>`;
    const weeklySummaryNotProvidedMessage = '<div><b>Weekly Summary:</b> Not provided!</div>';
    summaries.forEach((eachSummary) => {
      const {
        firstName, lastName, weeklySummaries, mediaUrl, weeklySummariesCount,
      } = eachSummary;

      const mediaUrlLink = mediaUrl ? `<a href=${mediaUrl}>Open link to media files</a>` : 'Not provided!';
      const totalValidWeeklySummaries = weeklySummariesCount || 'No valid submissions yet!';
      let weeklySummaryMessage = weeklySummaryNotProvidedMessage;
      if (Array.isArray(weeklySummaries) && weeklySummaries.length && weeklySummaries[weekIndex]) {
        const { dueDate, summary } = weeklySummaries[weekIndex];
        if (summary) {
          weeklySummaryMessage = `<div><b>Weekly Summary</b> (for the week ending on <b>${moment(dueDate).tz('America/Los_Angeles').format('YYYY-MMM-DD')}</b>):</div>
                                  <div data-pdfmake="{&quot;margin&quot;:[20,0,20,0]}">${summary}</div>`;
        }
      }

      wsReport += `\n
      <div><b>Name:</b> <span class="name">${firstName} ${lastName}</span></div>
      <div><b>Media URL:</b> ${mediaUrlLink}</div>
      <div><b>Total Valid Weekly Summaries:</b> ${totalValidWeeklySummaries}</div>
      ${weeklySummaryMessage}
      <div style="color:#DEE2E6; margin:10px 0px 20px 0px; text-align:center;">_______________________________________________________________________________________________</div>`;
    });

    return wsReport;
  };

  const formattedReport = FormatReportForPdf();
  const html = htmlToPdfmake(formattedReport);

  const docDefinition = {
    content: [
      html,
    ],
    styles: {
      'html-div': { margin: [0, 4, 0, 4] },
      name: {
        background: 'yellow',
      },
    },
  };

  const pdfDocGenerator = () => {
    pdfMake.createPdf(docDefinition).open();
  };

  return (
    <Button className="px-5 btn--dark-sea-green float-right" onClick={pdfDocGenerator}>Open PDF</Button>
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
