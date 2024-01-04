import { Stub } from 'components/common/Stub';
import React from 'react';
import './WbsTable.css';
import {useState} from 'react';
import { Link, useParams } from 'react-router-dom'


export const WbsTable = ({ wbs, skip, take }) => {
  const [copyMessage, setCopyMessage ] = useState("Copy id to clipboard");
  const {projectId} = useParams();

  const copyContent = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Id copied to clipboard');
      setCopyMessage("Copied!")
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  let WbsList = [];
  if (wbs.fetched) {
    if (wbs.WBSItems.length > 0) {
      WbsList = wbs.WBSItems.slice(skip, skip + take).map((item, index) => {
        return (
        <div className="wbs-table-row" id={'tr_' + item._id} key={item._id}>
          <div>{skip + index + 1}</div>
          <div>   
          <Link to={`/wbs/tasks/${item._id}/${projectId}/${item.wbsName}`}>  
          {item.wbsName}
          </Link > 
       </div>
          <div className="projects-active-input">
            {item.isActive ? (
              <div className="isActive">
                <i className="fa fa-circle" aria-hidden="true"></i>
              </div>
            ) : (
              <div className="isNotActive">
                <i className="fa fa-circle-o" aria-hidden="true"></i>
              </div>
            )}
          </div>
          <div className='wbs_id' onClick={()=>copyContent(item._id)} onMouseEnter={()=>setCopyMessage("Copy id to clipboard")}>{item._id}
          <div>{copyMessage}</div>
          </div>
          <div>{window.innerWidth >= 1100 ? item._id : item._id.substring(0, 10)}</div>
        </div>
    )});
    }
  }

  return (
    <div className="wbs-table">
      <h5 style={{marginBottom: '2.125rem'}} className="wbs-table-title">WBS</h5>
      <div className='scroll_x'>
      <div style={{marginBottom: '0px'}} className="reports-table-head wbs-table-row">
        <div className="wbs-table-cell">#</div>
        <div className="wbs-table-cell">Name</div>
        <div className="wbs-table-cell">Active</div>
        <div className="wbs-table-cell">ID</div>
      </div>
    {WbsList.length > 0 ? WbsList : <Stub />}</div>
    </div>
  );
};
