import React from "react";
import { Stub } from "components/common/Stub";
import "./WbsTable.css";

// eslint-disable-next-line import/prefer-default-export
export function WbsTable({ wbs, skip, take, match, canViewWBS, darkMode }) {
  let WbsList = [];
  const projectId = match?.params?.projectId;

  if (wbs.fetched && wbs.WBSItems.length > 0) {
    WbsList = wbs.WBSItems.slice(skip, skip + take).map((item, index) => (
      <div className="wbs-table-row" id={`tr_${item._id}`} key={item._id}>
        <div>{skip + index + 1}</div>
        <div>
          {canViewWBS ? (
            <a href={`/wbs/tasks/${item._id}/${projectId}/${item.wbsName}`} className={darkMode ? "text-light" : ""}>
              {item.wbsName}
            </a>
          ) : (
            <div>{item.wbsName}</div>
          )}
        </div>
        <div className="projects__active--input">
          {item.isActive ? (
            <div className="isActive">
              <i className="fa fa-circle" aria-hidden="true"></i>
            </div>
          ) : (
            <div className="isNotActive">
              <i className="fa fa-circle-o" aria-hidden="true" />
            </div>
          )}
        </div>
        <div>
          {window.innerWidth >= 1100 ? item._id : item._id.substring(0, 10)}
        </div>
      </div>
    ));
  }

  return (
    <div className={`wbs-table ${darkMode ? 'text-light' : ''}`}>
      <h5 style={{ marginBottom: "2.125rem" }} className="wbs-table-title">
        WBS
      </h5>
      <div
        style={{ marginBottom: "0px" }}
        className={`reports-table-head wbs-table-row ${darkMode ? 'bg-space-cadet' : ''}`}
      >
        <div className="wbs-table-cell">#</div>
        <div className="wbs-table-cell">Name</div>
        <div className="wbs-table-cell">Active</div>
        <div className="wbs-table-cell">ID</div>
      </div>
      <div>{WbsList.length > 0 ? WbsList : <Stub color={darkMode ? "white" : ""}/>}</div>
    </div>
  );
}
