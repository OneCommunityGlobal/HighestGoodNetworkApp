/*********************************************************************************
 * Component: OVERVIEW
 * Author: Henry Ng - 01/17/20
 * This component display the number of projects and active projects
 ********************************************************************************/
import React from 'react';
import { TOTAL_PROJECTS, ACTIVE_PROJECTS } from './../../../languages/en/ui';
import "./Overview.css"

const Overview = props => {
  return (
    <div className="projects__overview--top">
      <div className="card" id="card_project">
        <div className="card-body">
          <h6 className='card-text'>
            <i className="fa fa-folder" aria-hidden="true"></i> {TOTAL_PROJECTS}: {props.numberOfProjects}
          </h6>
        </div>
      </div>

      <div className="card" id="card_active">
        <div className="card-body">
          <h6 className='card-text'>
            <i className="fa fa-circle fa-circle-isActive" aria-hidden="true"></i> {ACTIVE_PROJECTS}: {props.numberOfActive}
          </h6>
        </div>
      </div>
    </div>
  );
};

export default Overview;
