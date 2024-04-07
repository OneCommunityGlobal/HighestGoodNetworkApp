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
  const [clickCountAscending, setClickCountAscending] = useState(0);
  const [clickCountDescending, setClickCountDescending] = useState(0);
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

  const toggleSortAscending = () => {
    let newSortBy;
    if (clickCountAscending === 0) {
      newSortBy = 'asc';
    } else {
      newSortBy = 'default';
    }
    setSortBy(newSortBy);
    setClickCountAscending((clickCountAscending + 1) % 2); // Toggle between 0 and 1
  };

  const toggleSortDescending = () => {
    let newSortBy;
    if (clickCountDescending === 0) {
      newSortBy = 'desc';
    } else {
      newSortBy = 'default';
    }
    setSortBy(newSortBy);
    setClickCountDescending((clickCountDescending + 1) % 2); // Toggle between 0 and 1
  };

  const sortWBSItems = (sortOrder = sortBy) => {
    const itemsCopy = [...props.state.wbs.WBSItems];
    const comparator = (a, b, reverse = 1) => {
        const nameA = a.wbsName.toLowerCase();
        const nameB = b.wbsName.toLowerCase();
        const specialChars = /^[^\w\s]|_/; // Include space in special characters

        return (
            (specialChars.test(nameA) && specialChars.test(nameB)) ? reverse * nameA.localeCompare(nameB) :
            (specialChars.test(nameA) || specialChars.test(nameB)) ? reverse * (specialChars.test(nameA) ? -1 : 1) :
            (!isNaN(nameA) && !isNaN(nameB)) ? reverse * (parseFloat(nameA) - parseFloat(nameB)) :
            reverse * nameA.localeCompare(nameB)
        );
    };

    return (sortOrder === 'asc') ? itemsCopy.sort(comparator) :
           (sortOrder === 'desc') ? itemsCopy.sort((a, b) => comparator(a, b, -1)) :
           itemsCopy;
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

        <AddWBS projectId={projectId} toggleSortAscending={toggleSortAscending} toggleSortDescending={toggleSortDescending}  />

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
