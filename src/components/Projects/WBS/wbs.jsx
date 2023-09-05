/*********************************************************************************
 * Component: WBS
 * Author: Henry Ng - 03/05/20
 * Display WBSs of project
 ********************************************************************************/
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { addNewWBS, fetchAllWBS } from '../../../actions/wbs';
import { Link } from 'react-router-dom';
import { NavItem } from 'reactstrap';
import AddWBS from './AddWBS';
import WBSItem from './WBSItem/WBSItem';

const WBS = props => {
  const projectId = props.match.params.projectId;

  useEffect(() => {
    props.fetchAllWBS(projectId);
  }, [projectId]);

  return (
    <React.Fragment>
      <div className="container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <NavItem tag={Link} to={`/projects/`}>
              <button type="button" className="btn btn-secondary">
                <i className="fa fa-chevron-circle-left" aria-hidden="true"></i>
              </button>
            </NavItem>

            <div id="member_project__name">Projects</div>
          </ol>
        </nav>

        <AddWBS projectId={projectId} />

        <table className="table table-bordered table-responsive-sm">
          <thead>
            <tr>
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
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return { state };
};
export default connect(mapStateToProps, { addNewWBS, fetchAllWBS })(WBS);
