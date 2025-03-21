/* eslint-disable no-nested-ternary */
import { useState } from 'react';
import styles from './WeeklySummariesReport.module.scss';
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
    <div id="bio-announcement" style={isMeetCriteria ? { backgroundColor: 'yellow' } : {}}>
      <div className={styles.bioToggle}>
        <b style={style}>Bio announcement:</b>
      </div>
      <div className={styles.bioToggle}>
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
