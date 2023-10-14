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

const CustomClearText = () => <>clear all</>;
const ClearIndicator = (props) => {
  const {
    children = <CustomClearText />,
    getStyles,
    innerProps: { ref, ...restInnerProps },
  } = props;
  return (
    <div
      {...restInnerProps}
      ref={ref}
      style={getStyles('clearIndicator', props)}
    >
      <div style={{ padding: '0px 5px' }}>{children}</div>
    </div>
  );
};

const ClearIndicatorStyles = (base, state) => ({
  ...base,
  cursor: 'pointer',
  color: state.isFocused ? 'blue' : 'black',
});

function LogMaterialsTable() {

  const options = [
    { value: "#1", label: "#1" },
    { value: "#2", label: "#2" },
    { value: "#3", label: "#3" },
    { value: "#4", label: "#4" },
  ];

  return (
    <div>
      <div className='row justify-content-around logMTableHeaderLine'>
        <div className=''>Item</div>
        <div className=''>Quantity</div>
        <div className='logMTableHead'> Daily Log Input </div>
      </div>

      <Table>
        <thead >
          <tr className="table-light">
            <th> ID </th>
            <th>Name</th>
            <th>Working</th>
            <th> Available </th>
            <th>Using</th>
            <th className='logMTableHead'> Material Number </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">   1   </th>
            <td>  Bristle Brush  </td>
            <td>  30 </td>
            <td>  5 </td>
            <td>  25 </td>
            <td>
              <Select
                closeMenuOnSelect={false}
                components={{ ClearIndicator }}
                styles={{ ClearIndicatorStyles }}
                defaultValue={[]}
                isMulti
                options={options}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">   2   </th>
            <td>  Leather Gloves  </td>
            <td>  100 </td>
            <td>  50 </td>
            <td>  50 </td>
            <td>
              <Select
                closeMenuOnSelect={false}
                components={{ ClearIndicator }}
                styles={{ ClearIndicatorStyles }}
                defaultValue={[]}
                isMulti
                options={options}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">   3   </th>
            <td>  Wheel Barrows  </td>
            <td>  10 </td>
            <td>  5 </td>
            <td>  5 </td>
            <td>
              <Select
                closeMenuOnSelect={false}
                components={{ ClearIndicator }}
                styles={{ ClearIndicatorStyles }}
                defaultValue={[]}
                isMulti
                options={options}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">   4   </th>
            <td>  4 gallon bucket  </td>
            <td>  50 </td>
            <td>  30 </td>
            <td>  20 </td>
            <td>
              <Select
                closeMenuOnSelect={false}
                components={{ ClearIndicator }}
                styles={{ ClearIndicatorStyles }}
                defaultValue={[]}
                isMulti
                options={options}
              />
            </td>
          </tr>

        </tbody>
      </Table>
      <div className='row justify-content-between'>
        <Button size="lg" className='logMButtons' outline>Cancel</Button>
        <Button size="lg" className='logMButtonBg'  >Submit</Button>
      </div>

    </div>
  )
}

export default LogMaterialsTable
