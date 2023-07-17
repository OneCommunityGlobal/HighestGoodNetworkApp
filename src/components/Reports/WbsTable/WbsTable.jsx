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
          <div>{window.innerWidth >= 1100 ? item._id : item._id.substring(0, 10)}</div>
        </div>
      ));
    }
  }

  return (
    <div className="wbs-table">
      <h5 style={{marginBottom: '2.125rem'}} className="wbs-table-title">WBS</h5>
      <div style={{marginBottom: '0px'}} className="reports-table-head wbs-table-row">
        <div className="wbs-table-cell">#</div>
        <div className="wbs-table-cell">Name</div>
        <div className="wbs-table-cell">Active</div>
        <div className="wbs-table-cell">ID</div>
      </div>
      <div>{WbsList.length > 0 ? WbsList : <Stub />}</div>
    </div>
  );
};
