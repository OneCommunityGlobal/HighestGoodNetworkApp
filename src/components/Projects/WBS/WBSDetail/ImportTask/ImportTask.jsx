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

const ImportTask = (props) => {
  let fileReader;
  const [importStatus, setImportStatus] = useState(0);
  const [isDone, setIsDone] = useState(0);
  // modal
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  const handleFileRead = (e) => {
    const content = fileReader.result;
    setIsDone(1);
    content.split('\n').forEach((row, i) => {
      if (i > 0) {
        handleRow(row);
      }

      if (i >= content.split('\n').length - 1) {
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
    })



  }

  const handleFileChosen = (file) => {
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
  }

  const handleRow = (row) => {
    let rowArr = row.split(',');
    addTask(rowArr);
  }


  const addTask = (rowArr) => {

    // level 1
    if (rowArr[0] !== '' && rowArr[1] !== '') {
      addNewTask(rowArr[0], rowArr[1], 1, rowArr);
    }
    if (rowArr[2] !== '' && rowArr[3] !== '') {
      addNewTask(rowArr[2], rowArr[3], 2, rowArr);
    }
    if (rowArr[4] !== '' && rowArr[5] !== '') {
      addNewTask(rowArr[4], rowArr[5], 3, rowArr);
    }
    if (rowArr[6] !== '' && rowArr[7] !== '') {
      addNewTask(rowArr[6], rowArr[7], 4, rowArr);
    }
  }


  let position = 0;

  const addNewTask = async (num, taskName, level, rowArr) => {

    let resourceObj;
    const userName = await axios.get(ENDPOINTS.GET_USER_BY_NAME(rowArr[9]));
    if (userName.data.length > 0) {
      resourceObj = {
        name: rowArr[9],
        userID: userName.data[0]._id,
        profilePic: userName.data[0].profilePic
      }

    }


    let newTask = {
      'taskName': taskName,
      'num': num,
      'level': level,
      'position': position,
      'wbsId': props.wbsId,
      'priority': rowArr[8],
      'resources': resourceObj,
      'isAssigned': rowArr[10] === 'yes' ? true : false,
      'status': rowArr[11],
      'hoursBest': rowArr[12],
      'hoursWorst': rowArr[13],
      'hoursMost': rowArr[14],
      'estimatedHours': rowArr[15],
      'startedDatetime': null,
      'dueDatetime': null,
      'links': rowArr[18],
      'mother': null,
      'parentId1': null,
      'parentId2': null,
      'parentId3': null,
      'isActive': true,
    }
    props.importTask(newTask, props.wbsId);
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
                  <p>
                    Before importing a Work Breakdown Structure (WBS) to this software, the following steps must be taken:<br />
                    1. Confirm the WBS was created using the Google Spreadsheet template: https://tinyurl.com/oc-wbs-template<br />
                    2. Confirm all fields in the form contain values<br />
                    3. Use the "Find" function to convert all the commas in the spreadsheet to semicolons<br />
                    4. Export the spreadsheet as a .csv file<br />
                    5. Click the button below and find and import your prepared file<br />
                    6. After import, check your file imported correctly and fix any content that didn't import correctly<br />
                  </p>
                </td>
              </tr>
              {isDone === 0 ?
                <tr>
                  <td scope="col" >
                    <input type='file'
                      id='file'
                      accept='.csv'
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
                    Importing...({importStatus}/3)
                </button>
                  </td>
                </tr>
                : null}
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>{isDone === 2 ? 'Done' : 'Cancel'}</Button>
        </ModalFooter>
      </Modal >
      <Button color="primary" size="sm" onClick={toggle} >Import Tasks</Button>



    </React.Fragment>
  )
}

export default connect(null, { importTask, fetchAllTasks })(ImportTask)

