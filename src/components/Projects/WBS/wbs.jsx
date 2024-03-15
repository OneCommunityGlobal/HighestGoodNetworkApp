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
import { boxStyle } from 'styles';
import './wbs.css';

const WBS = props => {
  const { allProjects } = props;
  const projectId = props.match.params.projectId;
  const [sortBy, setSortBy] = useState('default');
  const [clickCount, setClickCount] = useState(0);
  const [sortedItems, setSortedItems] = useState([]);

  const projectName = allProjects.find(project => project._id === projectId).projectName;

  useEffect(() => {
    props.fetchAllWBS(projectId);
  }, [projectId]);

  useEffect(() => {
    // Sort WBS items on initial load if needed
    if (sortBy !== 'default') {
      setSortedItems(sortWBSItems());
    } else {
      // If default sort order, maintain the order in which items were created
      setSortedItems([...props.state.wbs.WBSItems]);
    }
  }, [props.state.wbs.WBSItems, sortBy]);

  const toggleSort = () => {
    let newSortBy;
    if (clickCount === 0) {
      newSortBy = 'asc';
    } else if (clickCount === 1) {
      newSortBy = 'desc';
    } else {
      newSortBy = 'default';
    }
    setSortBy(newSortBy);
    setClickCount((clickCount + 1) % 3); // Cycle through 0, 1, 2
  };

  const sortWBSItems = (sortOrder = sortBy) => {
    const itemsCopy = [...props.state.wbs.WBSItems];
    if (sortOrder === 'asc') {
      return itemsCopy.sort((a, b) => a.wbsName.localeCompare(b.wbsName));
    } else if (sortOrder === 'desc') {
      return itemsCopy.sort((a, b) => b.wbsName.localeCompare(a.wbsName));
    }
    // Default sorting order, maintain the order in which items were created
    return itemsCopy;
  };

  return (
    <React.Fragment>
      <div className="container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <NavItem tag={Link} to={`/projects/`}>
              <button type="button" className="btn btn-secondary" style={boxStyle}>
                <i className="fa fa-chevron-circle-left" aria-hidden="true"></i>
              </button>
            </NavItem>

            <div id="member_project__name">Return to Projects</div>
            <div className="wbs-title">{projectName}</div>
          </ol>
        </nav>

        <AddWBS projectId={projectId} toggleSort={toggleSort} />

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
            {sortWBSItems().map((item, i) =>
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

const mapStateToProps = state => ({
  state: state,
  allProjects: state.allProjects.projects,
});

export default connect(mapStateToProps, { addNewWBS, fetchAllWBS })(WBS);
