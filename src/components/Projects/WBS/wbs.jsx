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
import { boxStyle, boxStyleDark } from '~/styles';
import { getProjectDetail } from '~/actions/project';

const WBS = props => {
  const darkMode = props.state.theme.darkMode;
  const projectId = props.match.params.projectId;
  const projectName = useSelector(state => state.projectById?.projectName || '');
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent' | 'asc' | 'desc'
  const [sortedWBSItems, setSortedWBSItems] = useState([]);

  useEffect(() => {
    props.fetchAllWBS(projectId);
    props.getProjectDetail(projectId); 
  }, [projectId]);

  useEffect(() => {
    if (!props.state.wbs.WBSItems) return;
    
    const sortedItems = [...props.state.wbs.WBSItems];
    if (sortOrder === 'asc') {
      sortedItems.sort((a, b) => a.wbsName.toLowerCase().localeCompare(b.wbsName.toLowerCase()));
    } else if (sortOrder === 'desc') {
      sortedItems.sort((a, b) => b.wbsName.toLowerCase().localeCompare(a.wbsName.toLowerCase()));
    } else {
      sortedItems.sort((a, b) => new Date(b.modifiedDatetime) - new Date(a.modifiedDatetime));
    }
    setSortedWBSItems(sortedItems);
  }, [props.state.wbs.WBSItems, sortOrder]);

  const handleSortChange = (newOrder) => {
    setSortOrder(prevOrder => prevOrder === newOrder ? 'recent' : newOrder);
  };

  return (
    <React.Fragment>
      <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{minHeight: "100%"}}>
        <div className={`container pt-2 border rounded ${darkMode ? 'text-light' : ''}`}style={darkMode ? { backgroundColor: '#1B2A41', alignItems: 'normal' } : { alignItems: 'normal' }}>
          <nav aria-label="breadcrumb">
            <div className={`d-flex align-items-center breadcrumb ${darkMode ? 'bg-space-cadet' : ''}`} 
              style={{ 
                ...darkMode ? boxStyleDark : boxStyle,
                backgroundColor: darkMode ? '' : '#E9ECEF',
                margin: '0 0 16px',
                padding: '12px 16px',
                position: 'relative'
              }}>
              <div style={{ position: 'absolute', left: '1rem' }}>
                <NavItem tag={Link} to={`/projects/`}>
                  <button type="button" className="btn btn-secondary" style={darkMode ? boxStyleDark : boxStyle}>
                    <i className="fa fa-chevron-circle-left" aria-hidden="true" />
                  </button>
                  <span style={{ marginLeft: '8px' }}>Return to Project List</span>
                </NavItem>
              </div>
              <div style={{ 
                width: '100%',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '1.0rem'  
              }}>Proj Name: {projectName}</div>
            </div>
          </nav>

          <AddWBS 
            projectId={projectId} 
            onSortAscending={() => handleSortChange('asc')}
            onSortDescending={() => handleSortChange('desc')}
          />

          {!props.state.wbs.WBSItems ? (
            <div className="d-flex justify-content-center align-items-center pt-4">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <table className={`table table-bordered table-responsive-sm ${darkMode ? 'bg-yinmn-blue text-light dark-mode' : '' }`}>
              <thead>
                <tr className={darkMode ? 'bg-space-cadet' : ''}>
                  <th scope="col" style={{ width: '150px', textAlign: 'center'}}>#</th>
                  <th scope="col" style={{ textAlign: 'left' }}>
                    Name
                    <span style={{ marginLeft: '8px', cursor: 'pointer' }}>
                      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                      <i
                        className={`fa ${sortOrder === 'recent' ? 'fa-sort' : sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}
                        onClick={() => handleSortChange(sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? 'recent' : 'asc')}
                       />
                    </span>
                  </th>
                  <th scope="col" style={{ width: '50px' }} />
                </tr>
              </thead>
              <tbody>
                {sortedWBSItems.map((item, i) =>
                  item ? (
                    <WBSItem
                      index={i + 1}
                      key={item._id}
                      wbsId={item._id}
                      projectId={projectId}
                      name={item.wbsName}
                      darkMode={darkMode}
                    />
                  ) : null,
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return { state };
};
export default connect(mapStateToProps, { addNewWBS, fetchAllWBS, getProjectDetail })(WBS);
