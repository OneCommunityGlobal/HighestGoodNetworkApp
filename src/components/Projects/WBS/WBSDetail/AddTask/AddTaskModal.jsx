import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'

const AddTaskModal = (props) => {
  const tasks = props.taskItems;

  // modal
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);


  // list of num
  const nums = [];
  const taskNames = [];
  tasks.forEach(task => {
    nums.push(task.num);
    taskNames.push(task.taskName);
  });


  // all posible cases 
  const newNums = [];
  nums.forEach((num, i) => {
    let numArr = num.split('.');
    let end = numArr[numArr.length - 1];
    let before = '';
    for (let i = 0; i < numArr.length - 1; i++) {
      before += numArr[i] + '.';
    }
    // sibling
    let newNum = before + (parseInt(end) + 1);
    if (!nums.includes(newNum)) {
      newNums.push({ 'p': taskNames[i], 'n': newNum });
    }
    // child
    if (numArr.length < 4) {
      newNum = num + '.1';
      if (!nums.includes(newNum)) {
        newNums.push({ 'p': taskNames[i], 'n': newNum });
      }
    }
  });

  newNums.sort((a, b) => a['n'].split('.')[0] - b['n'].split('.')[0]);


  // above new tasks
  const [above, setAbove] = useState(newNums[0]['p']);

  const changeAbove = (index) => {
    setAbove(newNums[index]['p']);
  }


  useEffect(() => {
    setAbove(newNums[0]['p']);
  }, [tasks]);


  return (
    <div>
      <Button color="danger" onClick={toggle}></Button>
      <Modal isOpen={modal} toggle={toggle} >
        <ModalHeader toggle={toggle}>Add New Task</ModalHeader>
        <ModalBody>
          <ReactTooltip />

          <table className="table table-bordered">
            <tbody>
              <tr>
                <td scope="col" data-tip="WBS ID">
                  <div></div><br /><br />
                  WBS #
                  </td>
                <td scope="col" >
                  <div className='above'><i>{above}</i></div>
                  <div><i class="fa fa-arrows-v" aria-hidden="true"></i></div>
                  <select id="nums" onChange={(e) => changeAbove(e.target.value)}>
                    {newNums.map((num, i) => <option value={i}>{num['n']}</option>)}
                  </select>
                </td>
              </tr>
              <tr>
                <td scope="col" >Task Name</td>
                <td scope="col" >
                  <input type="text" className='task-name' />
                </td>
              </tr>
              <tr>
                <td scope="col" >Priority</td>
                <td scope="col" >
                  <select id="priority">
                    <option value='Primary'>Primary</option>
                    <option value='Secondary'>Secondary</option>
                    <option value='Tertiary'>Tertiary</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Resources">Resources</td>
                <td scope="col" data-tip="Resources"></td>
              </tr>
              <tr>
                <td scope="col" data-tip="Assigned">Assigned</td>
                <td scope="col" data-tip="Assigned"></td>
              </tr>
              <tr>
                <td scope="col" data-tip="Status">Status</td>
                <td scope="col" data-tip="Status"></td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours-Best">Hours-Best</td>
                <td scope="col" data-tip="Hours-Best"></td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours-Worst">Hours-Worst</td>
                <td scope="col" data-tip="Hours-Worst"></td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours-Most">Hours-Most</td>
                <td scope="col" data-tip="Hours-Most"></td>
              </tr>
              <tr>
                <td scope="col" data-tip="Estimated Hours">Estimated Hours</td>
                <td scope="col" data-tip="Estimated Hours"></td>
              </tr>
              <tr>
                <td scope="col" data-tip="Start Date">Start Date</td>
                <td scope="col" data-tip="Start Date"></td>
              </tr>
              <tr>
                <td scope="col" data-tip="End Date">End Date</td>
                <td scope="col" data-tip="End Date"></td>
              </tr>
            </tbody>
          </table>


        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={toggle}>Do Something</Button>{' '}
          <Button color="secondary" onClick={toggle}>Cancel</Button>
        </ModalFooter>
      </Modal >
    </div >
  );
}

const mapStateToProps = state => { return state.tasks }
export default connect(mapStateToProps, null)(AddTaskModal);