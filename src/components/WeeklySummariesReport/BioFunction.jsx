/* eslint-disable no-nested-ternary */
import { useState } from 'react';
import './WeeklySummariesReport.css';
import ToggleSwitch from '../UserProfile/UserProfileEdit/ToggleSwitch';

function BioFunction(props) {
  const {
    bioPosted,
    totalTangibleHrs,
    daysInTeam,
    textColors,
    summary,
    bioCanEdit,
    handleProfileChange,
    userId,
  } = props;

  const [bioStatus, setBioStatus] = useState(bioPosted);

  const isMeetCriteria = totalTangibleHrs > 80 && daysInTeam > 60 && bioPosted !== 'posted';
  const style = {
    color: textColors[summary?.weeklySummaryOption] || textColors.Default,
  };

  return bioCanEdit ? (
    <div style={isMeetCriteria ? { backgroundColor: 'yellow' } : {}}>
      <div className="bio-toggle">
        <b style={style}>Bio announcement:</b>
      </div>
      <div className="bio-toggle">
        <ToggleSwitch
          switchType="bio"
          state={bioStatus}
          handleUserProfile={bio => {
            setBioStatus(bio);
            handleProfileChange(userId, bio, 'bio');
          }}
        />
      </div>
    </div>
  ) : (
    <div>
      <b style={style}>Bio announcement:</b>
      {bioPosted === 'default'
        ? ' Not requested/posted'
        : bioPosted === 'posted'
        ? ' Posted'
        : ' Requested'}
    </div>
  );
}

export default BioFunction;
