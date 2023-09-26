import React, { useState } from 'react';
import './WeeklySummariesReport.css';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { Input } from 'reactstrap';

const TotalValidSummaries = props => {
  const [weeklySummariesCount, setWeeklySummariesCount] = useState(parseInt(props.summary.weeklySummariesCount));

  const style = {
    color: props.textColors[props.summary?.weeklySummaryOption] || props.textColors['Default'],
  };

  const handleOnChange = async (userProfileSummary, count) => {
    const url = ENDPOINTS.USER_PROFILE_PROPERTY(userProfileSummary._id)
    try {
      await axios.patch(url, {key: 'weeklySummariesCount', value: count});
    } catch (err) {
      alert('An error occurred while attempting to save the new weekly summaries count change to the profile.');
    }
  };

  const handleWeeklySummaryCountChange = e => {
      setWeeklySummariesCount(e.target.value);
      handleOnChange(props.summary, e.target.value);
    }

  return (
    <div className='total-valid-wrapper'>
      {weeklySummariesCount === 8 ? 
      <div className='total-valid-text' style={style}>
        <b>Total Valid Weekly Summaries:</b>{' '}
      </div> : 
      <div className='total-valid-text'>
        <b style={style}>
          Total Valid Weekly Summaries:
        </b>{' '}
      </div>
      }
      {props.canEditSummaryCount ? 
      <div style={{width: '150px', paddingLeft: "5px"}}>
        <Input 
            type='number' 
            name='weeklySummaryCount' 
            step='1'
            value={weeklySummariesCount} 
            onChange={e => handleWeeklySummaryCountChange(e)}
            min='0'
        />
      </div> : 
      <div>&nbsp;{weeklySummariesCount || 'No valid submissions yet!'}</div>
      } 
    </div>
  )
};

export default TotalValidSummaries;