/* eslint-disable jsx-a11y/control-has-associated-label */
import { useState } from 'react';
import styles from './PermissionChangeLogTable.module.css';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { formatDate, formattedAmPmTime } from '~/utils/formatDate';
import { permissionLabelKeyMappingObj } from './PermissionsConst';

function PermissionChangeLogTable({ changeLogs, darkMode, roleNamesToHighlight = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});
  const itemsPerPage = 20;
  const fontColor = darkMode ? 'text-light' : '';
  const bgYinmnBlue = darkMode ? 'bg-yinmn-blue' : '';
  const addDark = darkMode ? '-dark' : '';

  const normalize = v =>
    (v ?? '')
      .toString()
      .trim()
      .toLowerCase();
  const roleSet = new Set(roleNamesToHighlight.map(normalize)); // O(1) lookup

  const formatName = name => {
    if (name.startsWith('INDIVIDUAL:')) {
      return name.replace('INDIVIDUAL:', '').trim();
    }
    return name;
  };

  // Group logs by name first, then by editor and time within each name group
  const groupLogsByNameThenEditorAndTime = logs => {
    const nameGroups = [];
    const TIME_TOLERANCE_MS = 2000; // 2 seconds tolerance for "same time"

    logs.forEach(log => {
      // Get the target name (person whose permissions are being changed)
      const targetName = log?.individualName ? formatName(log.individualName) : log.roleName || '';
      const normalizedTargetName = normalize(targetName);

      // Find existing name group
      let foundNameGroup = null;
      for (let i = nameGroups.length - 1; i >= 0; i--) {
        const nameGroup = nameGroups[i];
        if (nameGroup.normalizedTargetName === normalizedTargetName) {
          foundNameGroup = nameGroup;
          break;
        }
      }

      if (foundNameGroup) {
        // Within the same name group, group by editor and time
        const logTime = new Date(log.logDateTime).getTime();
        const editorKey = `${log.requestorEmail || ''}_${log.requestorRole || ''}`;

        // Find existing editor-time sub-group
        let foundSubGroup = null;
        for (let i = foundNameGroup.subGroups.length - 1; i >= 0; i--) {
          const subGroup = foundNameGroup.subGroups[i];
          const subGroupTime = new Date(subGroup.logs[0].logDateTime).getTime();
          const firstLog = subGroup.logs[0];
          const subGroupEditorEmail = firstLog.requestorEmail || '';
          const subGroupEditorRole = firstLog.requestorRole || '';
          const subGroupEditorKey = `${subGroupEditorEmail}_${subGroupEditorRole}`;

          if (
            subGroupEditorKey === editorKey &&
            Math.abs(logTime - subGroupTime) <= TIME_TOLERANCE_MS
          ) {
            foundSubGroup = subGroup;
            break;
          }
        }

        if (foundSubGroup) {
          foundSubGroup.logs.push(log);
        } else {
          foundNameGroup.subGroups.push({
            logs: [log],
            subGroupId: `subgroup_${foundNameGroup.subGroups.length}_${log._id}`,
          });
        }
        foundNameGroup.logs.push(log);
      } else {
        // Create new name group
        nameGroups.push({
          targetName,
          normalizedTargetName,
          logs: [log],
          subGroups: [
            {
              logs: [log],
              subGroupId: `subgroup_0_${log._id}`,
            },
          ],
          groupId: `namegroup_${nameGroups.length}_${log._id}`,
        });
      }
    });

    return nameGroups;
  };

  // Flatten grouped logs for pagination while preserving grouping info
  const nameGroupedLogs = groupLogsByNameThenEditorAndTime(changeLogs);
  const flattenedLogs = [];
  nameGroupedLogs.forEach(nameGroup => {
    nameGroup.logs.forEach((log, nameIndex) => {
      // Find which sub-group (editor-time group) this log belongs to
      const subGroup = nameGroup.subGroups.find(sg => sg.logs.some(sgLog => sgLog._id === log._id));
      const subGroupIndex = subGroup ? subGroup.logs.findIndex(sgLog => sgLog._id === log._id) : 0;
      const isFirstInSubGroup = subGroup ? subGroupIndex === 0 : nameIndex === 0;
      const isSubGrouped = subGroup ? subGroup.logs.length > 1 : false;

      flattenedLogs.push({
        ...log,
        isNameGrouped: nameGroup.logs.length > 1,
        nameGroupId: nameGroup.groupId,
        nameGroupIndex: nameIndex,
        nameGroupSize: nameGroup.logs.length,
        isFirstInNameGroup: nameIndex === 0,
        isSubGrouped,
        subGroupId: subGroup?.subGroupId,
        subGroupIndex,
        subGroupSize: subGroup?.logs.length || 1,
        isFirstInSubGroup,
      });
    });
  });

  const totalPages = Math.ceil(flattenedLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = flattenedLogs.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = pageNumber => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
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

  const getPermissionDisplay = (rowId, reason, permissions) => {
    // test this function
    if (expandedRows[rowId]) {
      // Show all filtered permissions if expanded
      return permissions.join(', ');
    }

    if (permissions.length > 0) {
      const firstFive = permissions.slice(0, 5).join(', ');
      const suffix = permissions.length > 5 ? ', ...' : '';
      return firstFive + suffix;
    }

    if (reason?.includes('**')) {
      return `See default ${reason.split('**')[1]} role permissions`;
    }

    return '';
  };

  const renderPermissions = (permissions, rowId, reason) => {
    // Filter out empty or falsy values before joining the permissions
    const filteredPermissions = permissions
      .map(permission => permissionLabelKeyMappingObj?.[permission])
      .filter(e => e);

    return (
      <div className={styles.permissionsCell}>
        {getPermissionDisplay(rowId, reason, filteredPermissions)}
        {filteredPermissions.length > 5 && (
          <button
            className={styles.toggleButton}
            onClick={() => toggleExpandRow(rowId)}
            type="button"
          >
            {expandedRows[rowId] ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        )}
      </div>
    );
  };
  const renderRoleChange = text => {
    if (text?.includes('**')) {
      return text.split('**').map((part, i) => {
        const key = `${part}-${i}`;
        return i % 2 === 1 ? <strong key={key}>{part}</strong> : <span key={key}>{part}</span>;
      });
    }
    return text;
  };
  const getReasonTextColor = reason => {
    if (!reason?.includes('Role')) {
      return undefined;
    }

    return darkMode ? 'cyan' : 'blue';
  };

  return (
    <>
      <div className={styles.tableResponsive}>
        <table
          className={`${styles.permissionChangeLogTable} ${darkMode ? 'text-light' : ''}`}
          style={{ width: '98%', margin: '0 auto' }}
        >
          <thead>
            <tr className={darkMode ? styles.tableRowDark : styles.tableRow}>
              <th
                className={
                  darkMode
                    ? styles.permissionChangeLogTableHeaderDark
                    : styles.permissionChangeLogTableHeader
                }
              >
                Log Date and Time (PST)
              </th>
              <th
                className={
                  darkMode
                    ? styles.permissionChangeLogTableHeaderDark
                    : styles.permissionChangeLogTableHeader
                }
              >
                Name
              </th>
              <th
                className={
                  darkMode
                    ? styles.permissionChangeLogTableHeaderDark
                    : styles.permissionChangeLogTableHeader
                }
              >
                Reason
              </th>
              <th
                className={
                  darkMode
                    ? styles.permissionChangeLogTableHeaderDark
                    : styles.permissionChangeLogTableHeader
                }
              >
                Permissions Added
              </th>
              <th
                className={
                  darkMode
                    ? styles.permissionChangeLogTableHeaderDark
                    : styles.permissionChangeLogTableHeader
                }
              >
                Permissions Removed
              </th>
              <th
                className={
                  darkMode
                    ? styles.permissionChangeLogTableHeaderDark
                    : styles.permissionChangeLogTableHeader
                }
              >
                Editor Role
              </th>
              <th
                className={
                  darkMode
                    ? styles.permissionChangeLogTableHeaderDark
                    : styles.permissionChangeLogTableHeader
                }
              >
                Editor Email
              </th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map(log => {
              const nameValue = log?.individualName ? formatName(log.individualName) : log.roleName;

              const shouldHighlight = roleSet.has(normalize(nameValue));
              // Rowspan for name column - spans all entries with same target name
              const nameRowSpan =
                log.isNameGrouped && log.isFirstInNameGroup ? log.nameGroupSize : undefined;
              // Rowspan for date/time, editor role, editor email - spans entries with same editor and time
              const subGroupRowSpan =
                log.isSubGrouped && log.isFirstInSubGroup ? log.subGroupSize : undefined;

              return (
                <tr key={log._id} className={shouldHighlight ? styles.highlightRow : ''}>
                  {/* Date/Time column - only show for first row in sub-group, or if not sub-grouped */}
                  {log.isFirstInSubGroup || !log.isSubGrouped ? (
                    <td
                      className={`${styles.permissionChangeLogTableCell} ${bgYinmnBlue}`.trim()}
                      {...(subGroupRowSpan && { rowSpan: subGroupRowSpan })}
                      style={{ verticalAlign: 'top' }}
                    >
                      {`${formatDate(log.logDateTime)} ${formattedAmPmTime(log.logDateTime)}`}
                    </td>
                  ) : null}

                  {/* Name column - only show for first row in name group, or if not name-grouped */}
                  {log.isFirstInNameGroup || !log.isNameGrouped ? (
                    <td
                      className={`${styles.permissionChangeLogTableCell} ${bgYinmnBlue}`.trim()}
                      {...(nameRowSpan && { rowSpan: nameRowSpan })}
                      style={{
                        fontWeight: log?.individualName ? 'bold' : 'normal',
                        verticalAlign: 'top',
                      }}
                    >
                      {log?.individualName ? formatName(log.individualName) : log.roleName}
                    </td>
                  ) : null}

                  <td className={`${styles.permissionChangeLogTableCell} ${bgYinmnBlue}`.trim()}>
                    {renderPermissions(log.permissions, log._id)}
                  </td>

                  <td className={styles.permissionChangeLogTableCell}>
                    {renderPermissions(log.permissionsAdded, `${log._id}_added`, log.reason)}
                  </td>

                  <td className={styles.permissionChangeLogTableCell}>
                    {renderPermissions(log.permissionsRemoved, `${log._id}_removed`, log.reason)}
                  </td>

                  {/* Editor Role column - only show for first row in sub-group, or if not sub-grouped */}
                  {log.isFirstInSubGroup || !log.isSubGrouped ? (
                    <td
                      className={`${styles.permissionChangeLogTableCell} ${bgYinmnBlue}`.trim()}
                      {...(subGroupRowSpan && { rowSpan: subGroupRowSpan })}
                      style={{ verticalAlign: 'top' }}
                    >
                      {log.requestorRole}
                    </td>
                  ) : null}

                  {/* Editor Email column - only show for first row in sub-group, or if not sub-grouped */}
                  {log.isFirstInSubGroup || !log.isSubGrouped ? (
                    <td
                      className={`${styles.permissionChangeLogTableCell} ${bgYinmnBlue}`.trim()}
                      {...(subGroupRowSpan && { rowSpan: subGroupRowSpan })}
                      style={{ verticalAlign: 'top' }}
                    >
                      {log.requestorEmail}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.paginationContainer}>
        <div className={styles.pagination}>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            type="button"
          >
            <FiChevronLeft />
          </button>

          {currentPage > 3 && (
            <>
              <button onClick={() => paginate(1)} type="button">
                1
              </button>
              {currentPage > 4 && <span>...</span>}
            </>
          )}

          {renderPageNumbers()}

          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && <span>...</span>}
              <button onClick={() => paginate(totalPages)} type="button">
                {totalPages}
              </button>
            </>
          )}

          <button
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
