/*********************************************************************************
 * Component: WBS
 * Author: Henry Ng - 03/05/20
 * Display WBSs of project
 ********************************************************************************/
import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { addNewWBS, fetchAllWBS } from '../../../actions/wbs';
import { Link } from 'react-router-dom';
import { NavItem } from 'reactstrap';
import AddWBS from './AddWBS';
import WBSItem from './WBSItem/WBSItem';
import { boxStyle, boxStyleDark } from 'styles';
import { getProjectDetail } from 'actions/project';

const WBS = props => {
  const darkMode = props.state.theme.darkMode;
  const projectId = props.match.params.projectId;
  const projectName = useSelector(state => state.projectById?.projectName || '');

  useEffect(() => {
    props.fetchAllWBS(projectId);
    props.getProjectDetail(projectId); 
  }, [projectId]);

  return (
    <React.Fragment>
      <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{minHeight: "100%"}}>
        <div className="container pt-2">
          <nav aria-label="breadcrumb">
            <ol className={`breadcrumb ${darkMode ? 'bg-space-cadet' : ''}`} style={darkMode ? boxStyleDark : boxStyle}>
              <NavItem tag={Link} to={`/projects/`}>
                <button type="button" className="btn btn-secondary mr-2" style={darkMode ? boxStyleDark : boxStyle}>
                  <i className="fa fa-chevron-circle-left" aria-hidden="true"></i>
                </button>
                <span style={{ marginLeft: '8px' }}>Return to Project List</span>
              </NavItem>
              <div id="member_project__name" style={{ flex: '1', textAlign: 'center', fontWeight: 'bold', display: 'flex',
                alignItems: 'center', justifyContent: 'center', }}>Project Name: {projectName}</div>
            </ol>
          </nav>

          <AddWBS projectId={projectId} />

          <table className={`table table-bordered table-responsive-sm ${darkMode ? 'bg-yinmn-blue text-light dark-mode' : '' }`}>
            <thead>
              <tr className={darkMode ? 'bg-space-cadet' : ''}>
                <th scope="col" id="members__order">
                  #
                </th>
                <th scope="col" id="members__name">
                  Name
                </th>
                <th scope="col" id="members__name"></th>
              </tr>
            </thead>
            <tbody>
              {props.state.wbs.WBSItems.map((item, i) =>
                item ? (
                  <WBSItem
                    index={i + 1}
                    key={item._id}
                    wbsId={item._id}
                    projectId={projectId}
                    name={item.wbsName}
                  />
                ) : null,
              )}
            </tbody>
          </table>
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return { state };
};
export default connect(mapStateToProps, { addNewWBS, fetchAllWBS, getProjectDetail })(WBS);
