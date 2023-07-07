import React, { useState, useEffect } from 'react';
import SummaryComponent from './SummaryReportDisplayComponent';

const TableExample = props => {
  const [data, setData] = useState([
    { serialNumber: 1, name: 'Object 1', textField: 'This is summary report number 1' },
    { serialNumber: 2, name: 'Object 2', textField: 'This is summary report number 2' },
    { serialNumber: 3, name: 'Object 3', textField: 'This is summary report number 3' },
  ]);

  const updateData = async () => {
    const report = await props.teamMembersIds();
    return report;
  };
  useEffect(() => {
    // const updatedData = data.map(item => {
    //   return {
    //     ...item,
    //     textField: props.teamMembersIds(),
    //   };
    // });
    // setData(updatedData);
    console.log('reports: ', updateData());
  }, []);

  return (
    <div>
      <table className="table table-bordered table-responsive-sm">
        <thead>
          <tr>
            <th>Summaries from Group</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>
                <SummaryComponent name={item.name} message={item.textField} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableExample;
