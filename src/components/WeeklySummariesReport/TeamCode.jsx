import React from 'react';
import './WeeklySummariesReport.css';
import { Input } from 'reactstrap';

const TeamCode = props => {
  return (
    <>
      {props.canEditTeamCode ?
        <div style={{width: '85px', paddingLeft: "5px"}}>
          <Input
            type="text"
            name="teamCode"
            id="teamCode"
            defaultValue={props.summary.teamCode}
            onBlur={e => {
              if(e.target.value != props.summary.teamCode){
                props.handleProfileChange(props.summary._id, e.target.value, "teamCode");
              }
            }}
            placeholder="X-XXX"
          />
        </div>
      : 
        <div style={{paddingLeft: "5px"}}>
          {props.summary.teamCode == ''? "No assigned team code!": props.summary.teamCode}
        </div>
      }
    </>
  )
};

export default TeamCode;