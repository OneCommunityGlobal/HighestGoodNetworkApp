/* eslint-disable no-nested-ternary */
import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './WeeklySummariesReport.module.scss';
import ToggleSwitch from '../UserProfile/UserProfileEdit/ToggleSwitch';

function BioFunction(props) {
  const {
    bioPosted,
    totalTangibleHrs,
    textColors,
    summary,
    bioCanEdit,
    handleProfileChange,
    userId,
  } = props;

  const [bioStatus, setBioStatus] = useState(bioPosted);

  const isMeetCriteria =
    totalTangibleHrs > 80 && summary?.weeklySummariesCount >= 8 && bioPosted !== 'posted';
  const style = {
    color: textColors[summary?.weeklySummaryOption] || textColors.Default,
  };

  return bioCanEdit ? (
    <div
      data-testid="bio-announcement"
      id="bio-announcement"
      style={isMeetCriteria ? { backgroundColor: 'yellow' } : {}}
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
  bioPosted: PropTypes.string.isRequired,
  totalTangibleHrs: PropTypes.number.isRequired,
  textColors: PropTypes.object.isRequired,
  summary: PropTypes.shape({
    weeklySummariesCount: PropTypes.number,
    weeklySummaryOption: PropTypes.string,
  }).isRequired,
  bioCanEdit: PropTypes.bool.isRequired,
  handleProfileChange: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default BioFunction;
