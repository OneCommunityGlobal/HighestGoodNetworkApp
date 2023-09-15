import React from 'react';

const PermissionChangeLogTable = ({ changeLogs }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Log Date Time</th>
          <th>Role ID</th>
          <th>Role Name</th>
          <th>Permissions</th>
          <th>Requestor ID</th>
          <th>Requestor Role</th>
          <th>Requestor Email</th>
        </tr>
      </thead>
      <tbody>
        {changeLogs.map(log => (
          <tr key={log._id}>
            <td>{log.logDateTime}</td>
            <td>{log.roleId}</td>
            <td>{log.roleName}</td>
            <td>{log.permissions.join(', ')}</td>
            <td>{log.requestorId}</td>
            <td>{log.requestorRole}</td>
            <td>{log.requestorEmail}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PermissionChangeLogTable;
