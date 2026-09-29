/*********************************************************************************
 * Component: OVERVIEW
 * Author: Henry Ng - 01/17/20
 * This component display the number of projects and active projects
 ********************************************************************************/
import React from 'react';
import { TOTAL_PROJECTS, ACTIVE_PROJECTS, ARCHIVED_PROJECTS } from './../../../languages/en/ui';
import styles from "./Overview.module.css"

const Overview = props => {
  // The second card describes whichever list is on screen: active projects in
  // the default view, archived projects once the archived view is opened.
  const secondCardLabel = props.showArchived ? ARCHIVED_PROJECTS : ACTIVE_PROJECTS;
  const secondCardCount = props.showArchived ? props.numberOfArchived : props.numberOfActive;

  return (
    <div className="projects__overview--top">
      <div className={`${styles["card_project"]} m-2`} id="card_project">
        <div className={`${styles["card-body"]} card-body`}>
          <h6 className={`${styles["card-text"]} card-text ml-3`}>
            <i className="fa fa-folder" aria-hidden="true"></i> {TOTAL_PROJECTS}: {props.numberOfProjects}
          </h6>
        </div>
      </div>

      <div className={`${styles["card_active"]} m-2`} id="card_active">
        <div className={`${styles["card-body"]} card-body`}>
          <h6 className={`${styles["card-text"]} card-text ml-3`}>
            <i className="fa fa-circle fa-circle-isActive" aria-hidden="true"></i> {secondCardLabel}: {secondCardCount}
          </h6>
        </div>
      </div>
    </div>
  );
};

export default Overview