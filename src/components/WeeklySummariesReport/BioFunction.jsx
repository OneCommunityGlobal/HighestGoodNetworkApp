/* eslint-disable no-nested-ternary */
import { useState } from 'react';
import ToggleSwitch from '../UserProfile/UserProfileEdit/ToggleSwitch';
import PropTypes from 'prop-types';
import styles from './WeeklySummariesReport.module.scss';

function BioFunction(props) {
  const {
    bioPosted,
    totalTangibleHrs,
    totalValidWeeklySummaries,
    textColors,
    summary,
    bioCanEdit,
    handleProfileChange,
    userId,
  } = props;

  const [bioStatus, setBioStatus] = useState(bioPosted);

  const isMeetCriteria =
    totalTangibleHrs > 80 && totalValidWeeklySummaries >= 8 && bioPosted !== 'posted';
  const style = {
    color: textColors[summary?.weeklySummaryOption] || textColors.Default,
  };

  return bioCanEdit ? (
    <div
      data-testid="bio-announcement"
      id="bio-announcement"
      style={isMeetCriteria ? { backgroundColor: 'yellow', color: '#000000' } : {}}
    >
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

BioFunction.propTypes = {
  bioPosted: PropTypes.string,
  totalTangibleHrs: PropTypes.number,
  totalValidWeeklySummaries: PropTypes.number,
  textColors: PropTypes.object,
  summary: PropTypes.object,
  bioCanEdit: PropTypes.bool,
  handleProfileChange: PropTypes.func,
  userId: PropTypes.string,
};

export default BioFunction;
