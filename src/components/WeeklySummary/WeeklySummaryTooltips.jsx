import { useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

function WeeklySummaryContentTooltip({ tabId }) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);
  return (
    <>
      <span id="summaryContentTooltip" data-testid="summary-content-tooltip-icon">
        &nbsp;
        <FontAwesomeIcon icon={faInfoCircle} data-testid={`summary-content-tooltip-${tabId}`} />
      </span>
      <Tooltip
        delay={{ show: 0, hide: 500 }}
        autohide={false}
        placement="right"
        isOpen={tooltipOpen}
        innerClassName="summaryContentTooltip"
        target="summaryContentTooltip"
        toggle={toggle}
        data-testid={`summary-content-tooltip-comp-${tabId}`}
      >
        Weekly summaries are due by Saturday night at midnight Pacific Time. The countdown timer on
        the Dashboard is counting down the time to each week’s closing. To avoid receiving a blue
        square, everything must be submitted before it hits zero. &nbsp;
        <br />
        <br />
        Weekly summaries of your work are needed so we can track your progress and credit you for it
        each week in the&nbsp;
        <a href="https://www.onecommunityglobal.org/one-community-blog/">
          weekly progress updates blog.
        </a>
        &nbsp; When writing your weekly summary, you should&nbsp;
        <u>write it in 3rd person</u>&nbsp; and include the specifics of what you did for the week.
        Please be detailed. Minimum length for a weekly summary is 50 words and the app won’t allow
        you to submit one shorter than this.
        <br />
        <br />
        Here’s an example of how to write your weekly summary in 3rd person:
        <br />
        <br />
        <i>
          This week John continued development of the xxxx by completing aaa, bbb, and ccc. For aaa,
          he xyz. For bbb, he xzy. Ccc is still in process but John was able to complete xyz.
        </i>
      </Tooltip>
    </>
  );
}

function MediaURLTooltip() {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);
  return (
    <>
      <span id="mediaURLTooltip" data-testid="mediaurl-tooltip-icon">
        &nbsp;
        <FontAwesomeIcon icon={faInfoCircle} data-testid="mediaurl-tooltip" />
      </span>
      <Tooltip
        placement="right"
        delay={{ show: 0, hide: 500 }}
        autohide={false}
        isOpen={tooltipOpen}
        innerClassName="mediaURLTooltip"
        target="mediaURLTooltip"
        toggle={toggle}
        data-testid="mediaurl-tooltip-comp"
      >
        You are required to submit screenshots of your work completed each week. You need to submit
        a minimum of 4 pictures (6-10 are better) in your shared DropBox (the link you were invited
        to by email). When adding to DropBox, they should be in a folder with your name on it and in
        a new folder within that folder with the week labeled as “Week 1, 2, etc.”
        <br />
        <br />
        Pictures should cover the details of your work completed for the week: written content,
        mockups, designs, materials researched, etc. They are used for reviewing your work and
        crediting you in the{' '}
        <a href="https://www.onecommunityglobal.org/one-community-blog/">weekly progress updates</a>
        .
        <br />
        <br />
        Each Sunday/Monday after your manager reviews everything, they’ll add any questions or
        feedback they have to your Google Doc, using DropBox comments, on Slack, etc. If anything is
        written on your Google Doc, we’ll always be sure to also comment on the text so you know to
        read and reply to what has been written.
      </Tooltip>
    </>
  );
}

WeeklySummaryContentTooltip.propTypes = {
  tabId: PropTypes.string.isRequired,
};

export { MediaURLTooltip, WeeklySummaryContentTooltip };
