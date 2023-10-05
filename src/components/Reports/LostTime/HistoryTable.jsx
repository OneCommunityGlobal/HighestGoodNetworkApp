import React, { useState } from 'react';

function HistoryTable(props) {
  let entriesList = [];
    if (props.entriesList.length > 0) {
      entriesList = props.entriesList.map((entry) => (
        <tr id={`tr_${entry._id}`} key={entry._id}>
          <td>
            {entry.entryType}
          </td>
          <td>
            {entry.name}
          </td>
          <td>
            {entry.date}
          </td>
          <td>
            {entry.hours + ':' + entry.minutes}
          </td>
          <td>
            {entry.isTangible ? (
              <div className="isActive">
                <i className="fa fa-circle" aria-hidden="true" />
              </div>
            ) : (
              <div className="isNotActive">
                <i className="fa fa-circle-o" aria-hidden="true" />
              </div>
            )}
          </td>
        </tr>
      ));
    }

  return (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th scope="col">
            Type
          </th>
          <th scope="col">
            Name
          </th>
          <th scope="col">
            Date
          </th>
          <th scope="col">
            Time
          </th>
          <th scope="col">
            Tangible
          </th>
        </tr>
      </thead>
      <tbody>{entriesList}</tbody>
      {/* {console.log(entriesList)} */}
    </table>
  );
}

export default HistoryTable;
