import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const WeeklySummaryTabsTooltip = () => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);
  return (
    <>
      <span id="summaryTabsTooltip"><FontAwesomeIcon icon={faInfoCircle} data-testid="summary-tabs-tooltip" /></span>
      <Tooltip placement="top" isOpen={tooltipOpen} innerClassName="summaryTabsTooltip" target="summaryTabsTooltip" toggle={toggle}>
        Please note that "Last Week" or "Week Before Last" tabs are not necessarily referring to the last calendar week or
        the week before that respectfully. For example, if you had taken time off, in this case "Last Week" would refer to the
        last time you had submitted a summary.
      </Tooltip>
    </>
  );
};

const WeeklySummaryContentTooltip = ({ tabId }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);
  return (
    <>
      <span id="summaryContentTooltip"><FontAwesomeIcon icon={faInfoCircle} data-testid={`summary-content-tooltip-${tabId}`} /></span>
      <Tooltip placement="top" isOpen={tooltipOpen} innerClassName="summaryContentTooltip" target="summaryContentTooltip" toggle={toggle}>
        Use this section to save your weekly work summary. It will be auto-submitted at the end of the week for review.
        The system will auto-assign a blue square if a summary hasn’t been provided.
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
        This is the link to your shared DropBox where you upload a minimum of 4 pictures (6-10 are better) each week.
        Be sure you also add a screen capture demonstration of your work progress for the week.
        Do this in the folder with your name on it and with a week number matching your volunteer week.
      </Tooltip>
    </>
  );
};


WeeklySummaryContentTooltip.propTypes = {
  tabId: PropTypes.string.isRequired,
};

export { MediaURLTooltip, WeeklySummaryContentTooltip, WeeklySummaryTabsTooltip };
