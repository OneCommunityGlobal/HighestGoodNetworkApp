/* eslint-disable jsx-a11y/control-has-associated-label */
import { useState } from 'react';
import './PermissionChangeLogTable.css';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { formatDate, formattedAmPmTime } from 'utils/formatDate';

function PermissionChangeLogTable({ changeLogs, darkMode }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});
  const itemsPerPage = 20;
  const totalPages = Math.ceil(changeLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = changeLogs.slice(indexOfFirstItem, indexOfLastItem);
  const fontColor = darkMode ? 'text-light' : '';
  const bgYinmnBlue = darkMode ? 'bg-yinmn-blue' : '';
  const addDark = darkMode ? '-dark' : '';

  const paginate = pageNumber => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const formatName = name => {
    if (name.startsWith('INDIVIDUAL:')) {
      return name.replace('INDIVIDUAL:', '').trim();
    }
    return name;
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbersToShow = 5;
    const halfPageNumbersToShow = Math.floor(maxPageNumbersToShow / 2);
    let startPage = Math.max(currentPage - halfPageNumbersToShow, 1);
    let endPage = Math.min(currentPage + halfPageNumbersToShow, totalPages);

    if (startPage <= 1) {
      endPage = Math.min(maxPageNumbersToShow, totalPages);
    }
    if (endPage >= totalPages) {
      startPage = Math.max(totalPages - maxPageNumbersToShow + 1, 1);
    }

    for (let i = startPage; i <= endPage; i += 1) {
      pageNumbers.push(i);
    }

    return pageNumbers.map(number => {
      const isActive = currentPage === number;
      const activeClass = darkMode ? 'activeDark' : 'activeLight';
      const buttonClass = isActive ? activeClass : '';

      return (
        <button
          key={number}
          onClick={() => paginate(number)}
          className={`${fontColor} ${buttonClass}`}
          type="button"
        >
          {number}
        </button>
      );
    });
  };

  const toggleExpandRow = rowId => {
    setExpandedRows(prevState => ({
      ...prevState,
      [rowId]: !prevState[rowId],
    }));
  };

  const renderPermissions = (permissions, rowId) => {
    // Filter out empty or falsy values before joining the permissions
    const filteredPermissions = permissions.filter(permission => permission);

    return (
      <div className="permissions-cell">
        {expandedRows[rowId]
          ? filteredPermissions.join(', ') // Show all filtered permissions if expanded
          : filteredPermissions.slice(0, 5).join(', ') +
            (filteredPermissions.length > 5 ? ', ...' : '')}
        {filteredPermissions.length > 5 && (
          <button className="toggle-button" onClick={() => toggleExpandRow(rowId)} type="button">
            {expandedRows[rowId] ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        )}
      </div>
    );
  };
  return (
    <>
      <div className="table-responsive">
        <table
          className={`permission-change-log-table ${darkMode ? 'text-light' : ''}`}
          style={{ borderCollapse: 'collapse', width: '98%', margin: '0 auto' }}
        >
          <thead>
            <tr className={darkMode ? 'table-row-dark' : 'table-row'}>
              <th className={`permission-change-log-table--header${addDark}`}>
                Log Date and Time (PST)
              </th>
              <th className={`permission-change-log-table--header${addDark}`}>Name</th>
              <th className={`permission-change-log-table--header${addDark}`}>Permissions</th>
              <th className={`permission-change-log-table--header${addDark}`}>Permissions Added</th>
              <th className={`permission-change-log-table--header${addDark}`}>
                Permissions Removed
              </th>
              <th className={`permission-change-log-table--header${addDark}`}>Editor Role</th>
              <th className={`permission-change-log-table--header${addDark}`}>Editor Email</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(log => (
              <tr key={log._id}>
                <td className={`permission-change-log-table--cell ${bgYinmnBlue}`}>{`${formatDate(
                  log.logDateTime,
                )} ${formattedAmPmTime(log.logDateTime)}`}</td>
                <td
                  className={`permission-change-log-table--cell ${bgYinmnBlue}`}
                  style={{
                    fontWeight: log.name.startsWith('INDIVIDUAL:') ? 'bold' : 'normal',
                  }}
                >
                  {formatName(log.name)}
                </td>
                <td className={`permission-change-log-table--cell permissions ${bgYinmnBlue}`}>
                  {renderPermissions(log.permissions, log._id)}
                </td>
                <td className={`permission-change-log-table--cell permissions ${bgYinmnBlue}`}>
                  {renderPermissions(log.permissionsAdded, `${log._id}_added`)}
                </td>
                <td className={`permission-change-log-table--cell permissions ${bgYinmnBlue}`}>
                  {renderPermissions(log.permissionsRemoved, `${log._id}_removed`)}
                </td>
                <td className={`permission-change-log-table--cell ${bgYinmnBlue}`}>
                  {log.requestorRole}
                </td>
                <td className={`permission-change-log-table--cell ${bgYinmnBlue}`}>
                  {log.requestorEmail}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination-container">
        <div className={`pagination ${fontColor}`}>
          <button
            className={fontColor}
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            type="button"
          >
            <FiChevronLeft />
          </button>
          {currentPage > 3 && (
            <>
              <button className={fontColor} onClick={() => paginate(1)} type="button">
                1
              </button>
              {currentPage > 4 && <span>...</span>}
            </>
          )}
          {renderPageNumbers()}
          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && <span>...</span>}
              <button className={fontColor} onClick={() => paginate(totalPages)} type="button">
                {totalPages}
              </button>
            </>
          )}
          <button
            className={fontColor}
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            type="button"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    </>
  );
}

export default PermissionChangeLogTable;
