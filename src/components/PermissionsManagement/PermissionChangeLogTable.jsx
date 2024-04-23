import React, { useState } from 'react';

import "./PermissionChangeLogTable.css";
import { formatDate, formatted_AM_PM_Time } from 'utils/formatDate';


const PermissionChangeLogTable = ({ changeLogs }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = changeLogs.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = pageNumber => setCurrentPage(pageNumber);


  return (
    <>
      <table className='permission-change-log-table' style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th className='permission-change-log-table--header'>Log Date and Time (PST)</th>
            <th className='permission-change-log-table--header'>Role Name</th>
            <th className='permission-change-log-table--header'>Permissions</th>
            <th className='permission-change-log-table--header'>Permissions Added</th>
            <th className='permission-change-log-table--header'>Permissions Removed</th>
            <th className='permission-change-log-table--header'>Editor Role</th>
            <th className='permission-change-log-table--header'>Editor Email</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map(log => (
            <tr key={log._id}>
              {/* ... (same as before) */}
              <td className='permission-change-log-table--cell'>{`${formatDate(log.logDateTime)} ${formatted_AM_PM_Time(log.logDateTime)}`}</td>
              <td className='permission-change-log-table--cell'>{log.roleName}</td>
              <td className='permission-change-log-table--cell'>{log.permissions.join(', ')}</td>
              <td className='permission-change-log-table--cell'>{log.permissionsAdded.join(', ')}</td>
              <td className='permission-change-log-table--cell'>{log.permissionsRemoved.join(', ')}</td>
              <td className='permission-change-log-table--cell'>{log.requestorRole}</td>
              <td className='permission-change-log-table--cell'>{log.requestorEmail}</td>
            </tr>
          ))}
        </tbody>
      </table>
        <div className="pagination">
        {Array.from({ length: Math.ceil(changeLogs.length / itemsPerPage) }).map((_, index) => (
          <button 
            key={index} 
            onClick={() => paginate(index + 1)} 
            className='permission-change-log-table--button'
            style={{
              backgroundColor: index + 1 === currentPage ? '#103a8d' : '#1d62f0',
            }}>
            {index + 1}
          </button>
        ))}
      </div>
    </>
  );
};

export default PermissionChangeLogTable;
