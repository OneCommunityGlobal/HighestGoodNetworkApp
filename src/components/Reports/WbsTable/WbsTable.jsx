import { Stub } from 'components/common/Stub';
import React from 'react';
import './WbsTable.css';
import {useState} from 'react';
//import {  Link} from 'react-router-dom';



export const WbsTable = ({ wbs, skip, take }) => {
  const [copyMessage, setCopyMessage ] = useState("Copy id to clipboard");

  // const {projectId} = useParams();

  //console.log("check::", projectId, `/wbs/tasks/${item._id}/${projectId}/${item.wbsName}`);

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
      WbsList = wbs.WBSItems.slice(skip, skip + take).map((item, index) => (
        <div className="wbs-table-row" id={'tr_' + item._id} key={item._id}>
          <div>{skip + index + 1}</div>
          <div>   {item.wbsName}
          {/* <a href={`/wbs/tasks/${item._id}/63aec7acf228944096961f0d/${item.wbsName}`}>  
       
          </a>  */}
       </div>
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
          <div className='wbs_id' onClick={()=>copyContent(item._id)} onMouseEnter={()=>setCopyMessage("Copy id to clipboard")}>{item._id}
          <div>{copyMessage}</div>
          </div>
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
      <div className='scroll_x'>{WbsList.length > 0 ? WbsList : <Stub />}</div>
    </div>
  );
};
