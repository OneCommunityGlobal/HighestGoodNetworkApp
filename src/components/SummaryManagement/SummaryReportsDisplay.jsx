import React, { useState, useEffect } from 'react';
import SummaryComponent from './SummaryReportDisplayComponent';

const SummaryTable = props => {
  const [data, setData] = useState([]);
  const [summaryReceiver, setSummaryReceiver] = useState(undefined);

  const updateData = async () => {
    const report = await props.teamMembersReports();
    return report;
  };

  useEffect(() => {
    if (props.summaryGroupId) {
      const fetchData = async () => {
        const result = await updateData();
        setData(result);
        // const summaryReceiverResult = await props.getSummaryReceiver(props.SummaryGroupId);
        // setSummaryReceiver(summaryReceiverResult);
      };
      fetchData();
    }
  }, [props.summaryGroupId]);

  return (
    <div>
      {props.summaryGroupId && props.onDisplaySummaryTable ? (
        <div>
          <table className="table table-bordered table-responsive-sm">
            <thead>
              <tr>
                <th>Summaries from Group</th>
              </tr>
            </thead>
            <tbody>
              {data.length !== 0 &&
                data.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <SummaryComponent name={item.fullName} message={item.report} />
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
};

export default SummaryTable;
