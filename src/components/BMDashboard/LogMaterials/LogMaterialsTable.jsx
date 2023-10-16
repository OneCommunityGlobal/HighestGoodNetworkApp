import React, { useState } from 'react'
import { Button, Table } from 'reactstrap'
import { FormGroup, Input, Label } from 'reactstrap';
import Select, {
  components,
  MultiValueGenericProps,
  MultiValueProps,
  OnChangeValue,
  Props,
  ClearIndicatorProps
} from 'react-select';

const CustomClearText = () => <span className='logMaterialClearAll'>clear all</span>;
const ClearIndicator = (props) => {
  const {
    children = <CustomClearText />,
    innerProps: { ref, ...restInnerProps },
  } = props;
  return (
    <div
      {...restInnerProps}
      ref={ref}
    >
      <div style={{ padding: '0px 5px' }}>{children}</div>
    </div>
  );
};

function LogMaterialsTable() {

  const options = [
    { value: "#1", label: "#1" },
    { value: "#2", label: "#2" },
    { value: "#3", label: "#3" },
    { value: "#4", label: "#4" },
  ];

  return (
    <div>

      <Table borderless className='logMaterialTable' responsive >
        <thead className='logMTableHeaderLine'>
          <tr className="">
            <th colSpan={2}> Item </th>
            <th colSpan={3}>Quantity</th>
            <th colSpan={1} className='logMTableHead'> Daily Log Input </th>
          </tr>
        </thead>
        <thead className='logMTableHeaderLine'>
          <tr className="table-light">
            <th> ID </th>
            <th>Name</th>
            <th>Working</th>
            <th> Available </th>
            <th>Using</th>
            <th className='logMTableHead'> Material Number </th>
          </tr>
        </thead>
        <tbody >
          <tr>
            <td scope="row">   1   </td>
            <td>  Bristle Brush  </td>
            <td>  30 </td>
            <td>  5 </td>
            <td>  25 </td>
            <td>
              <Select
                closeMenuOnSelect={false}
                components={{ ClearIndicator }}
                defaultValue={[]}
                isMulti
                options={options}
              />
            </td>
          </tr>
          <tr>
            <td scope="row">   2   </td>
            <td>  Leather Gloves  </td>
            <td>  100 </td>
            <td>  50 </td>
            <td>  50 </td>
            <td>
              <Select
                closeMenuOnSelect={false}
                components={{ ClearIndicator }}
                defaultValue={[]}
                isMulti
                options={options}
              />
            </td>
          </tr>
          <tr>
            <td scope="row">   3   </td>
            <td>  Wheel Barrows  </td>
            <td>  10 </td>
            <td>  5 </td>
            <td>  5 </td>
            <td>
              <Select
                closeMenuOnSelect={false}
                components={{ ClearIndicator }}
                defaultValue={[]}
                isMulti
                options={options}
              />
            </td>
          </tr>
          <tr>
            <td scope="row">   4   </td>
            <td>  4 gallon bucket  </td>
            <td>  50 </td>
            <td>  30 </td>
            <td>  20 </td>
            <td>
              <Select
                closeMenuOnSelect={false}
                components={{ ClearIndicator }}
                defaultValue={[]}
                isMulti
                options={options}
              />
            </td>
          </tr>


        </tbody>
      </Table>
      <div className='row justify-content-between '>
        <Button size="lg" className='logMButtons' outline>Cancel</Button>
        <Button size="lg" className='logMButtonBg'  >Submit</Button>
      </div>

    </div>
  )
}

export default LogMaterialsTable
