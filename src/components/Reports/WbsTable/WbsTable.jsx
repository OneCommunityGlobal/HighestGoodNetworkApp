import { Stub } from 'components/common/Stub';
import React from 'react';
import './WbsTable.css';

export const WbsTable = ({ wbs, skip, take }) => {
  let WbsList = [];
  if (wbs.fetched) {
    if (wbs.WBSItems.length > 0) {
      WbsList = wbs.WBSItems.slice(skip, skip + take).map((item, index) => (
        <div className="wbs-table-row" id={'tr_' + item._id} key={item._id}>
          <div>{skip + index + 1}</div>
          <div>{item.wbsName}</div>
          <div className="projects__active--input">
            {item.isActive ? (
              <tasks className="isActive">
                <i className="fa fa-circle" aria-hidden="true"></i>
              </tasks>
            ) : (
              <div className="isNotActive">
                <i className="fa fa-circle-o" aria-hidden="true"></i>
              </div>
            )}
          </div>
          <div>{item._id}</div>
        </div>
      ));
    }
  }

  return (
    <div>
      <h5 className="wbs-table-title">WBS</h5>
      <div className="reports-table-head wbs-table-row">
        <div id="projects__order">#</div>
        <div>Name</div>
        <div id="projects__active">Active</div>
        <div id="projects__active">ID</div>
      </div>
      <div>{WbsList.length > 0 ? WbsList : <Stub />}</div>
    </div>
  );
};
