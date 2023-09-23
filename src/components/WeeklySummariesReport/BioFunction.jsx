import React, { useState } from 'react';
import './WeeklySummariesReport.css';
import ToggleSwitch from '../UserProfile/UserProfileEdit/ToggleSwitch';

const BioFunction = props => {
  const [bioStatus, setBioStatus] = useState(props.bioPosted);

  const isMeetCriteria = props.totalTangibleHrs > 80 && props.daysInTeam > 60 && props.bioPosted !== "posted"
  const style = {
      color: props.textColors[(props.summary)?.weeklySummaryOption] || props.textColors['Default'],
  };

  return (
    <>
      {props.bioCanEdit
        ?(
          <div style={isMeetCriteria ? {backgroundColor: "yellow"}: {}}> 
            <div className="bio-toggle">
              <b style={style}>Bio announcement:</b>
            </div>
            <div className="bio-toggle">
              <ToggleSwitch
                switchType="bio"
                state={bioStatus}
                handleUserProfile={bio => {
                  setBioStatus(bio);
                  props.handleProfileChange(props.userId, bio, "bio");
                }}
              />
            </div>
          </div>
        ):(
          <div>
            <b style={style}>Bio announcement:</b>
            {props.bioPosted === 'default'
              ? ' Not requested/posted'
              : props.bioPosted === 'posted'
              ? ' Posted'
              : ' Requested'}
          </div>
        )}
    </>
  )
};

export default BioFunction;