/*********************************************************************************
 * Component: MEMBER
 * Author: Henry Ng - 02/03/20
 * Display member of the members list
 ********************************************************************************/
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { importTask, fetchAllTasks } from './../../../../../actions/task';
import { ENDPOINTS } from './../../../../../utils/URL';
import axios from 'axios'
import readXlsxFile from 'read-excel-file';

const ImportTask = (props) => {
  let fileReader;
  const [importStatus, setImportStatus] = useState(0);
  const [isDone, setIsDone] = useState(0);
  // modal
  const [modal, setModal] = useState(false);
  const toggle = () => { setModal(!modal); setIsDone(0) };
  const [taskList, setTaskList] = useState([]);


  const handleFileRead = async (rows) => {
    setIsDone(1);
    const tmpList = [];
    await rows.forEach((rowArr, i) => {
      if (i >= 2) {

        // level 1
        if (rowArr[0] !== null && rowArr[1] !== null) {
          tmpList.push(newTask(rowArr[0], rowArr[1], 1, rowArr));
        }
        // level 2
        if (rowArr[2] !== null && rowArr[3] !== null) {
          tmpList.push(newTask(rowArr[2], rowArr[3], 2, rowArr));
        }
        // level 3
        if (rowArr[4] !== null && rowArr[5] !== null) {
          tmpList.push(newTask(rowArr[4], rowArr[5], 3, rowArr));
        }
        // level 4
        if (rowArr[6] !== null && rowArr[7] !== null) {
          tmpList.push(newTask(rowArr[6], rowArr[7], 4, rowArr));
        }

        if (i === rows.length - 1) {

          document.getElementById("instruction").innerHTML = rows[0][0] + "<br/> Rows: " + rows.length;

          setTimeout(() => {
            setIsDone(2);
          }, 1000)

        }

      }

      /*
      if (i >= rows.length - 1) {
        setImportStatus(1);
        setTimeout(() => {
          setImportStatus(2);
          axios.put(ENDPOINTS.FIX_TASKS(props.wbsId));
          setTimeout(() => {
            setImportStatus(3);
            axios.put(ENDPOINTS.UPDATE_PARENT_TASKS(props.wbsId)).then(() => {
              setTimeout(() => {
                setImportStatus(4);
                props.fetchAllTasks(props.wbsId);
              }, 10000)
            })
          }, 10000);
        }, 10000);
      }
      */

    });

    setTaskList(tmpList);



  }

  const uploadTaskList = () => {
    setIsDone(3);
    //console.log(taskList);
    props.importTask(taskList, props.wbsId);
    setTimeout(() => {
      setTimeout(() => {
        setIsDone(4);
      }, 1000);
      props.fetchAllTasks(props.wbsId, 0);
    }, 1000)
  }

  const handleFileChosen = (file) => {
    /*fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);*/

    readXlsxFile(file).then((rows) => {
      // `rows` is an array of rows
      // each row being an array of cells.
      handleFileRead(rows);
    })
  }

  const handleRow = async (row) => {
    //let rowArr = row.split(',');

    //await addTask(row);
  }


  let position = 0;
  const foundUser = [];
  const foundUserData = [];

  const newTask = (num, taskName, level, rowArr) => {

    const indexFoundUser = foundUser.findIndex(user => user === rowArr[9]);
    if (indexFoundUser >= 0) {
      rowArr[9] = foundUserData[indexFoundUser];
    } else {
      const members = props.projectMembers.members;
      foundUser.push(rowArr[9]);

      for (let i = 0; i < members.length; i++) {
        if (`${members[i].firstName} ${members[i].lastName}` === rowArr[9]) {
          rowArr[9] = rowArr[9] + '|' + members[i]._id + '|' + (members[i].profilePic || "/defaultprofilepic.png");
          foundUserData.push(rowArr[9]);
          break;
        }
      }

    }




    let newTask = {
      'taskName': `${taskName}`,
      'num': `${num}`,
      'level': `${level}`,
      'position': `${position}`,
      'wbsId': `${props.wbsId}`,
      'priority': `${rowArr[8]}`,
      'resourceName': rowArr[9],
      'isAssigned': `${rowArr[10]}` === 'yes' ? true : false,
      'status': `${rowArr[11]}`,
      'hoursBest': `${rowArr[12]}`,
      'hoursWorst': `${rowArr[13]}`,
      'hoursMost': `${rowArr[14]}`,
      'estimatedHours': `${rowArr[15]}`,
      'startedDatetime': null,
      'dueDatetime': null,
      'whyInfo': `${rowArr[18]}`,
      'intentInfo': `${rowArr[19]}`,
      'endstateInfo': `${rowArr[20]}`,
      'links': `${rowArr[21]}`,
      'mother': null,
      'parentId1': null,
      'parentId2': null,
      'parentId3': null,
      'isActive': true,

    }

    return newTask;



    position++;
  }

  return (
    <React.Fragment>

      <Modal isOpen={modal} toggle={toggle} >
        <ModalHeader toggle={toggle}>Import Tasks</ModalHeader>
        <ModalBody>
          <table className="table table-bordered">
            <tbody>
              <tr>
                <td scope="col" >
                  <p id="instruction">
                    Before importing a Work Breakdown Structure (WBS) to this software, the following steps must be taken:<br />
                    1.Check all numbers are sequential.
                    2.Double check the number listed in the popup matches the number of rows being imported.
                  </p>
                </td>
              </tr>
              {isDone === 0 ?
                <tr>
                  <td scope="col" >
                    <input type='file'
                      id='file'
                      accept='.xlsx'
                      onChange={e => handleFileChosen(e.target.files[0])}
                    />
                  </td>

                </tr>
                : null}
              {isDone === 1 ?
                <tr>

                  <td>
                    <button className="btn btn-primary" type="button" disabled>
                      <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                    Loading...
                </button>
                  </td>
                </tr>
                : null}

              {isDone === 2 ?
                <tr>
                  <td>
                    Are you sure you want to upload it? <br /> <button className="btn btn-primary" type="button" onClick={() => uploadTaskList()}>Upload</button>
                  </td>
                </tr>
                : null}

              {isDone === 3 ?
                <tr>

                  <td>
                    <button className="btn btn-primary" type="button" disabled>
                      <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                    Importing...
                </button>
                  </td>
                </tr>
                : null}

            </tbody>
          </table>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>{isDone === 4 ? 'Done' : 'Cancel'}</Button>
        </ModalFooter>
      </Modal >
      <Button color="primary" size="sm" onClick={toggle} >Import Tasks</Button>



    </React.Fragment>
  )
}

const mapStateToProps = state => {
  return state
}
export default connect(mapStateToProps, { importTask, fetchAllTasks })(ImportTask)

