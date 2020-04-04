/*********************************************************************************
 * Component: TAK
 * Author: Henry Ng - 21/03/20
 ********************************************************************************/
import React from 'react'
import { connect } from 'react-redux'
import './../wbs.css';

const AddTask = (props) => {

  const tasks = props.taskItems;

  // list of num
  const nums = [];
  tasks.forEach(task => {
    nums.push(task.num);
  });

  // all posible cases 
  const newNums = [];
  nums.forEach(num => {
    let numArr = num.split('.');
    let end = numArr[numArr.length - 1];
    let before = '';
    for (let i = 0; i < numArr.length - 1; i++) {
      before += numArr[i] + '.';
    }
    // sibling
    let newNum = before + (parseInt(end) + 1);
    if (!nums.includes(newNum)) {
      newNums.push(newNum);
    }
    // child
    if (numArr.length < 4) {
      newNum = num + '.1';
      if (!nums.includes(newNum)) {
        newNums.push(newNum);
      }
    }
  });

  newNums.sort((a, b) => a.split('.')[0] - b.split('.')[0]);


  return (
    <React.Fragment>
      <tr>
        <th scope="row">
          <select id="nums">
            {newNums.map(num => <option value={num}>{num}</option>)}
          </select>
        </th>
        <td>
          <input type="text" className='task-name' />
        </td>
        <td>

        </td>
        <td></td>
        <td></td>
        <td></td>
        <td data-tip="Hours-Best" > <input type="text" className='task-hour' min='0' /></td>
        <td data-tip="Hours-Worst" > <input type="text" className='task-hour' min='0' /></td>
        <td data-tip="Hours-Most" > <input type="text" className='task-hour' min='0' /></td>
        <td data-tip="Estimated Hours" > <input type="text" className='task-hour' min='0' /></td>
        <td>

        </td>
        <td>
        </td>
        <td>
        </td>
      </tr>
    </React.Fragment>
  )
}
const mapStateToProps = state => { return state.tasks }
export default connect(mapStateToProps, null)(AddTask)

