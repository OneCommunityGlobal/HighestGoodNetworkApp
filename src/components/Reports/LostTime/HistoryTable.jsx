import Loading from 'components/common/Loading';
import React, { useState } from 'react';
import EditHistoryModal from './EditHistoryModal';
import moment from 'moment';
import { getUserProfile } from 'actions/userProfile';
import { connect } from 'react-redux';

function HistoryTable(props) {
  let entriesList = [];
    if (props.entriesList.length > 0) {
      entriesList = props.entriesList.map((entry) => (
        <tr id={`tr_${entry._id}`} key={entry._id}>
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
          <td>
            <EditHistoryModal
              _id={entry._id}
              dataId={entry.dataId}
              dateOfWork={entry.date}
              hours={entry.hours}
              minutes={entry.minutes}
              isTangible={entry.isTangible}
              entryType={entry.entryType}
              allData={props.allData}
              reload={props.reload}
            />
          </td>
        </tr>
      ));
    }

  return (
    <>
    {props.dataLoading? (
      <Loading/>
    ): (
      <table className="table table-bordered">
      <thead>
        <tr>
          {/* <th scope="col">
            Type
          </th> */}
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
          <th scope="col">
            Action
          </th>
        </tr>
      </thead>
      <tbody>{entriesList}</tbody>
    </table>
    )}
    </>
  );
}

const mapStateToProps = state => ({
  userProfile: state.userProfile,
});

export default connect(mapStateToProps, {getUserProfile})(HistoryTable);
