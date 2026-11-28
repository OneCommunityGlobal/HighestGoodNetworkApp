// import React from 'react';
// import './LessonPlanLogTable.module.css';
// import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
// // A simple helper function to format dates
// const formatDate = dateString => {
//   const options = {
//     month: 'short',
//     day: '2-digit',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: true,
//   };
//   return new Date(dateString).toLocaleString('en-US', options);
// };

// export default function LessonPlanLogTable({ logs }) {
//   return (
//     <>
//       <div className="table-responsive">
//         <table
//           className={`permission-change-log-table ${darkMode ? 'text-light' : ''}`}
//           style={{ borderCollapse: 'collapse', width: '98%', margin: '0 auto' }}
//         >
//           <thead>
//             <tr className={darkMode ? 'table-row-dark' : 'table-row'}>
//               <th className={`permission-change-log-table--header${addDark}`}>
//                 Log Date and Time (PST)
//               </th>
//               <th className={`permission-change-log-table--header${addDark}`}>Name</th>
//               <th className={`permission-change-log-table--header${addDark}`}>Permissions</th>
//               <th className={`permission-change-log-table--header${addDark}`}>Permissions Added</th>
//               <th className={`permission-change-log-table--header${addDark}`}>
//                 Permissions Removed
//               </th>
//               <th className={`permission-change-log-table--header${addDark}`}>Editor Role</th>
//               <th className={`permission-change-log-table--header${addDark}`}>Editor Email</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentItems.map(log => {
//               const nameValue = log?.individualName ? formatName(log.individualName) : log.roleName;
//               const shouldHighlight = roleSet.has(normalize(nameValue));
//               return (
//                 <tr key={log._id} className={shouldHighlight ? 'highlight-row' : ''}>
//                   <td className={`permission-change-log-table--cell ${bgYinmnBlue}`}>{`${formatDate(
//                     log.logDateTime,
//                   )} ${formattedAmPmTime(log.logDateTime)}`}</td>
//                   <td
//                     className={`permission-change-log-table--cell ${bgYinmnBlue}`}
//                     style={{
//                       // Uncommented lines below and in formatName, using individualName for users, and roleName for role changes
//                       fontWeight: log?.individualName ? 'bold' : 'normal',
//                     }}
//                   >
//                     {log?.individualName ? formatName(log.individualName) : log.roleName}
//                   </td>
//                   <td className={`permission-change-log-table--cell permissions ${bgYinmnBlue}`}>
//                     {renderPermissions(log.permissions, log._id)}
//                   </td>
//                   <td className={`permission-change-log-table--cell permissions ${bgYinmnBlue}`}>
//                     {renderPermissions(log.permissionsAdded, `${log._id}_added`)}
//                   </td>
//                   <td className={`permission-change-log-table--cell permissions ${bgYinmnBlue}`}>
//                     {renderPermissions(log.permissionsRemoved, `${log._id}_removed`)}
//                   </td>
//                   <td className={`permission-change-log-table--cell ${bgYinmnBlue}`}>
//                     {log.requestorRole}
//                   </td>
//                   <td className={`permission-change-log-table--cell ${bgYinmnBlue}`}>
//                     {log.requestorEmail}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//       <div className="pagination-container">
//         <div className={`pagination ${fontColor}`}>
//           <button
//             className={fontColor}
//             onClick={() => paginate(currentPage - 1)}
//             disabled={currentPage === 1}
//             type="button"
//           >
//             <FiChevronLeft />
//           </button>
//           {currentPage > 3 && (
//             <>
//               <button className={fontColor} onClick={() => paginate(1)} type="button">
//                 1
//               </button>
//               {currentPage > 4 && <span>...</span>}
//             </>
//           )}
//           {renderPageNumbers()}
//           {currentPage < totalPages - 2 && (
//             <>
//               {currentPage < totalPages - 3 && <span>...</span>}
//               <button className={fontColor} onClick={() => paginate(totalPages)} type="button">
//                 {totalPages}
//               </button>
//             </>
//           )}
//           <button
//             className={fontColor}
//             onClick={() => paginate(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             type="button"
//           >
//             <FiChevronRight />
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }

import React from 'react';
import styles from './LessonPlanLogTable.module.css';

// A simple helper function to format dates
const formatDate = dateString => {
  if (!dateString) return 'N/A';
  const options = {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  return new Date(dateString).toLocaleString('en-US', options);
};

export default function LessonPlanLogTable({ logs }) {
  // Graceful fallback if there are no logs yet
  if (!logs || logs.length === 0) {
    return <p className="text-muted mt-3">No history available for this lesson plan yet.</p>;
  }

  return (
    <div className={styles.tableResponsive}>
      {/* Using standard Bootstrap table classes for a clean look */}
      <table
        className="table table-bordered table-hover table-sm mt-3"
        style={{ backgroundColor: 'white' }}
      >
        <thead className="thead-light" style={{ backgroundColor: '#f8f9fa' }}>
          <tr>
            <th>Date & Time</th>
            <th>Action</th>
            <th>Details</th>
            <th>Editor Name</th>
            <th>Editor Email</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => {
            // Safely access the populated editorId fields in case a user was deleted
            const firstName = log.editorId?.firstName || 'Unknown';
            const lastName = log.editorId?.lastName || 'User';
            const email = log.editorId?.email || 'N/A';

            return (
              <tr key={log._id}>
                <td>{formatDate(log.logDateTime)}</td>
                <td>
                  <strong>{log.action}</strong>
                </td>
                <td>{log.details}</td>
                <td>{`${firstName} ${lastName}`}</td>
                <td>{email}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
