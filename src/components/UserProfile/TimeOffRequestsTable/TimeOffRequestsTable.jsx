import './TimeOffRequestsTable.css';
import moment from 'moment';

const TimeOffRequestsTable = ({requests ,openModal}) => {
  const sortRequests = (a, b) => {
    const momentA = moment(a.startingDate, 'YYYY-MM-DD');
    const momentB = moment(b.startingDate, 'YYYY-MM-DD');
    return momentA - momentB;
  };
  return (
    <div className="user-profile-time-off-section">
      <div className="user-profile-time-off-div-header">
        <div className="user-profile-time-off-div-header-title">SCHEDULED TIME OFF</div>
      </div>
      {requests?.length > 0 ? (
        <>
          <div className="user-profile-time-off-div-table-header">
            <div className="user-profile-time-off-div-table-date">Date</div>
            <div className="user-profile-time-off-div-table-duration">Duration</div>
          </div>
          <div className="user-profile-time-off-div-table-data">
            {requests
              .slice()
              .sort(sortRequests)
              .map(request => (
                <div className="user-profile-time-off-div-table-entry" key={request._id}>
                  <div className="user-profile-time-off-div-table-entry-icon-tooltip-wrapper">
                    <div className="user-profile-time-off-div-table-entry-icon" onClick={openModal}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="19"
                        viewBox="0 0 448 512"
                      >
                        <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z" />
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 512 512"
                      >
                        <path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
                      </svg>
                    </div>
                    <div className="user-profile-time-off-div-table-entry-tooltip">
                      <div>
                        <span style={{ fontWeight: 500, textDecoration: 'underline' }}>Date:</span>{' '}
                        {moment(request.startingDate).format('MM/DD/YYYY')}
                      </div>
                      <div>
                        <span style={{ fontWeight: 500, textDecoration: 'underline' }}>
                          Duration:
                        </span>{' '}
                        {`${request.duration} ${Number(request.duration) > 1 ? 'Weeks' : 'week'}`}
                      </div>
                      <div>
                        <span style={{ fontWeight: 500, textDecoration: 'underline' }}>
                          Reason:
                        </span>{' '}
                        {request.reason}
                      </div>
                    </div>
                  </div>

                  <div className="user-profile-time-off-div-table-entry-date">
                    {moment(request.startingDate).format('MM/DD/YYYY')}
                  </div>
                  <div className="user-profile-time-off-div-table-entry-duration">
                    {request.duration}
                  </div>
                </div>
              ))}
          </div>
        </>
      ) : (
        <div className="pl-1">No time off scheduled.</div>
      )}
    </div>
  );
};

export default TimeOffRequestsTable;
