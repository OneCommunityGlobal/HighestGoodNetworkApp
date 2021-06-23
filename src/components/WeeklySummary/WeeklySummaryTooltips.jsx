import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const WeeklySummaryContentTooltip = ({ tabId }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);
  return (
    <>
      <span id="summaryContentTooltip"><FontAwesomeIcon icon={faInfoCircle} data-testid={`summary-content-tooltip-${tabId}`} /></span>
      <Tooltip placement="top" isOpen={tooltipOpen} innerClassName="summaryContentTooltip" target="summaryContentTooltip" toggle={toggle}>
        Weekly summaries are due by Saturday night at midnight Pacific Time.  The countdown timer on the Dashboard is counting down the time to each week’s closing. To avoid receiving a blue square, everything must be submitted before it hits zero.
      </Tooltip>
    </>
  );
};

const MediaURLTooltip = () => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);
  return (
    <>
      <span id="mediaURLTooltip"><FontAwesomeIcon icon={faInfoCircle} data-testid="mediaurl-tooltip" /></span>
      <Tooltip placement="top" isOpen={tooltipOpen} innerClassName="mediaURLTooltip" target="mediaURLTooltip" toggle={toggle}>
        This is the link to your Google Doc or shared DropBox where you upload a minimum of 4 pictures (6-10 are better) each week.
        Be sure you also add a screen capture demonstration of your work progress for the week.
        Do this in the folder with your name on it and with a week number matching your volunteer week.
      </Tooltip>
    </>
  );
};


WeeklySummaryContentTooltip.propTypes = {
  tabId: PropTypes.string.isRequired,
};

export { MediaURLTooltip, WeeklySummaryContentTooltip };
