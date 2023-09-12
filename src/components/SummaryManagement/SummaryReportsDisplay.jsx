import React, { useState, useEffect } from 'react';
import SummaryComponent from './SummaryReportDisplayComponent';

function SummaryTable(props) {
  const [data, setData] = useState([]);

  const updateData = async () => {
    const report = await props.teamMembersReports();
    return report;
  };

  useEffect(() => {
    const errorMessage = {
      fullname: 'Oops',
      report: 'I could not retrieve this record at this time!',
    };

    const fetchData = async () => {
      const result = await updateData();
      if (result === 'errorMessage') {
        errorMessage;
      } else {
        setData(result);
      }
    };
    if (props.summaryGroupId) {
      fetchData();
    }
  }, [props.summaryGroupId]);

  const closeDisplay = () => {
    props.onDisplaySummaryTableFunc('false');
  };

  const getSummaryReceiver = async () => {
    const id = props.summaryGroupId;
    if (id) {
      await props.getSummaryReceiver(id);
    } else {
      console.log('props.summaryGroupId is null');
    }
  };

  const getSummaryReceiverdata = async () => {
    if (props.currentUserId && props.summaryReceiver) {
      const userId = props.currentUserId;
      const summarylist = await props.summaryReceiver.summaryRecievers;
      const summaryRec = await summarylist.filter(item => item._id === userId);
      console.log('summary list 2 : ', summaryRec);
      const summaryIds = summaryRec._id;
      // setSummaryReceiver(summaryIds);
    }
  };

  return (
    <div>
      {props.summaryGroupId &&
      props.onDisplaySummaryTableVar &&
      (props.currentUserRole === 'Administrator' ||
        props.currentUserRole === 'Owner' ||
        props.currentUserRole === 'Manager' ||
        props.currentUserRole === 'Mentor') ? (
        <div>
          <table className="table table-bordered table-responsive-sm">
            <thead>
              <tr className="d-flex justify-content-between">
                <th className="border-0">Summaries from Group</th>
                <button className="btn btn-sm btn-secondary mt-2 mb-2 mr-2" onClick={closeDisplay}>
                  Close
                </button>
              </tr>
            </thead>

            <tbody>
              {data.length !== 0 &&
                data.map((item, index) => (
                  <tr key={index}>
                    <td>
                      {(props.summaryReceiver ||
                        props.currentUserRole === 'Manager' || [
                          props.currentUserRole === 'Mentor',
                        ]) && <SummaryComponent name={item.fullName} message={item.report} />}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default SummaryTable;
