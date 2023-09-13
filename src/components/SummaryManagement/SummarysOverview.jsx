import React from 'react';
import { TOTAL_SUMMARY, ACTIVE_SUMMARY } from '../../languages/en/ui';

const SummarysOverview = props => {
  return (
    <div className="teams__overview--top">
      <div className="card" id="card_team">
        <div className="card-body">
          <h4 className="card-title">{props.numberOfSummaryGroup}</h4>
          <h6 className="card-subtitle">
            <i className="fa fa-users" aria-hidden="true"></i> {TOTAL_SUMMARY}
          </h6>
        </div>
      </div>

      <div className="card" id="card_active">
        <div className="card-body">
          <h4 className="card-title">{props.numberOfActiveSummaryGroup}</h4>
          <h6 className="card-subtitle">
            <div className="isActive">
              <i className="fa fa-circle" aria-hidden="true"></i> {ACTIVE_SUMMARY}
            </div>
          </h6>
        </div>
      </div>
    </div>
  );
};

export default SummarysOverview;
