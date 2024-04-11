/*********************************************************************************
 * Component: MEMBER
 * Author: Henry Ng - 02/03/20
 * Display member of the members list
 ********************************************************************************/
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import { importTask } from './../../../../../actions/task';
import readXlsxFile from 'read-excel-file';
import { getPopupById } from './../../../../../actions/popupEditorAction';
import { TASK_IMPORT_POPUP_ID } from './../../../../../constants/popupId';
import ReactHtmlParser from 'react-html-parser';
import { boxStyle, boxStyleDark } from 'styles';

const ImportTask = props => {
  /*
  * -------------------------------- variable declarations -------------------------------- 
  */
  // props from store 
  const { popupContent, members, darkMode } = props;

  // states from hooks
  const [importStatus, setImportStatus] = useState('choosing');
  const [modal, setModal] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [alert, setAlert] = useState('')
  const [instruction, setInstruction] = useState(ReactHtmlParser(popupContent));  // right now the saved popupContent for this is 'Task PR#905', better to change it 

  /*
  * -------------------------------- functions -------------------------------- 
  */
 const toggle = async () => {
    props.getPopupById(TASK_IMPORT_POPUP_ID);
    setInstruction(ReactHtmlParser(popupContent));
    setModal(!modal);
    setImportStatus('choosing');
  };

  const handleFileChosen = file => {
    readXlsxFile(file).then(rows => {
      handleFileRead(rows);
    });
  };

  const handleFileRead = async rows => {
    setImportStatus('importing');
    const tmpList = [];
    try {
      rows.forEach((rowArr, i) => {
        if (i >= 2) {
          // level 1
          if (rowArr[0] !== null && rowArr[1] !== null) {
            tmpList.push(newTask(rowArr[0], rowArr[1], 1, rowArr, i));
          }
          // level 2
          if (rowArr[2] !== null && rowArr[3] !== null) {
            tmpList.push(newTask(rowArr[2], rowArr[3], 2, rowArr, i));
          }
          // level 3
          if (rowArr[4] !== null && rowArr[5] !== null) {
            tmpList.push(newTask(rowArr[4], rowArr[5], 3, rowArr, i));
          }
          // level 4
          if (rowArr[6] !== null && rowArr[7] !== null) {
            tmpList.push(newTask(rowArr[6], rowArr[7], 4, rowArr, i));
          }
        }
      });
      setInstruction(ReactHtmlParser(rows[0][0] + '<br/> Rows: ' + rows.length))
      setImportStatus('imported');
      setTaskList(tmpList);
    } catch (error) {
      setImportStatus('importError');
      setAlert(error.message);
    }
  };

  const newTask = (num, taskName, level, rowArr, i) => {
    const nameCache = []; // check for duplicates
    const resourcesNames = rowArr[9]?.split(',').map(name => {
      name = name.trim();
      const member = members.find(p => `${p.firstName} ${p.lastName}`.toLocaleLowerCase() === name.toLowerCase());

      if (!member) throw new Error(`Error: ${name} is not in the project member list`);

      if (nameCache.includes(name)) throw new Error(`Error: There are more than one [${name}] in resources on line ${i + 1}`);
      nameCache.push(name);
      
      return name + '|' + member._id + '|' + (member.profilePic || '/defaultprofilepic.png');
    }) || [];  // if cell under resources column is empty (rowArr[9] is undefined), then assign resources with []

    let newTask = {
      taskName: taskName,
      wbsId: String(props.wbsId),
      num: String(num),
      level: parseInt(level, 10),
      priority: String(rowArr[8]),
      resources: resourcesNames, 
      isAssigned: String(rowArr[10]).toLowerCase() === 'yes' && resourcesNames.length !== 0, // if .xlsx file shows assigned but no resources, then make it false
      status: String(rowArr[11]),
      hoursBest: parseFloat(rowArr[12]),
      hoursWorst: parseFloat(rowArr[13]),
      hoursMost: parseFloat(rowArr[14]),
      hoursLogged: 0, // was previously set as 0, hoursLogged is not in the xlsx file, not sure how to get this value
      estimatedHours: parseFloat(rowArr[15]),
      startedDatetime: null,
      dueDatetime: null,
      links: String(rowArr[21]),
      category: String(rowArr[22]),
      parentId1: null,
      parentId2: null,
      parentId3: null,
      mother: null,
      position: 0,   // 'position' property only changes value in AddTaskModal, and its meaning is no longer useful in the new task system, however it is required in database schema
      isActive: true,
      whyInfo: String(rowArr[18]),
      intentInfo: String(rowArr[19]),
      endstateInfo: String(rowArr[20]),
    };

    return newTask;
  };

  const uploadTaskList = async () => {
    setImportStatus('uploading');
    await props.importTask(taskList, props.wbsId);
    // await props.load();
    setImportStatus('uploaded');
  };

  const reset = () => {
    setImportStatus('choosing');
    setInstruction(ReactHtmlParser(popupContent));
    setTaskList([]);
  }

  const onCloseHandler = async () => {
    props.setIsLoading(true);
    await props.load();
    props.setIsLoading(false);
  }



  /*
  * -------------------------------- useEffects -------------------------------- 
  */

  useEffect(() => {
    props.getPopupById(TASK_IMPORT_POPUP_ID)
  }, [popupContent])

  return (
    <>
      <Modal isOpen={modal} toggle={toggle} onClosed={onCloseHandler}>
        <ModalHeader toggle={toggle}>Import Tasks</ModalHeader>
        <ModalBody>
          <table className="table table-bordered">
            <tbody>
              <tr>
                <td scope="col">
                  <div id="instruction">
                    {instruction}
                  </div>
                </td>
              </tr>
              {importStatus === 'choosing' ? (
                <tr>
                  <td scope="col">
                    <input
                      type="file"
                      id="file"
                      accept=".xlsx"
                      onChange={e => handleFileChosen(e.target.files[0])}
                    />
                  </td>
                </tr>
              ) : null}
              {importStatus === 'importing' ? (
                <tr>
                  <td>
                    <button className="btn btn-primary" type="button" disabled>
                      <span
                        className="spinner-grow spinner-grow-sm"
                        role="status"
                        aria-hidden="true"
                      >
                        Importing...
                      </span>
                    </button>
                  </td>
                </tr>
              ) : null}
              {importStatus === 'importError' ? (
                <tr>
                  <td>
                    <Alert color='danger'>{alert}</Alert>
                    <input
                      type="file"
                      id="file"
                      accept=".xlsx"
                      onChange={e => handleFileChosen(e.target.files[0])}
                    />
                  </td>
                </tr>
              ) : null}

              {importStatus === 'imported' ? (
                <tr>
                  <td>
                    <Alert color='primary'>Are you sure you want to upload it? </Alert>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={uploadTaskList}
                    >
                      Upload
                    </button>
                    <button
                      className="btn btn-secondary ml-2"
                      type="button"
                      onClick={reset}
                    >
                      Reset
                    </button>
                  </td>
                </tr>
              ) : null}

              {importStatus === 'uploading' ? (
                <tr>
                  <td>
                    <button className="btn btn-primary" type="button" disabled>
                      <span
                        className="spinner-grow spinner-grow-sm"
                        role="status"
                        aria-hidden="true"
                      >
                        Uploading...
                      </span>
                    </button>
                  </td>
                </tr>
              ) : null}
              {importStatus === 'uploaded' ? (
                <tr>
                  <td>
                    <Alert color='primary'>File Uploaded!</Alert>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            {importStatus === 'uploaded' ? 'Done' : 'Cancel'}
          </Button>
        </ModalFooter>
      </Modal>
      <Button color="primary" className="controlBtn" size="sm" onClick={toggle} style={darkMode ? boxStyleDark : boxStyle}>
        <span onClick={toggle}>Import Tasks</span>
      </Button>
    </>
  );
};

const mapStateToProps = state => ({
  popupContent: state.popupEditor.currPopup.popupContent,
  members: state.projectMembers.members,
  state: state,
});
export default connect(mapStateToProps, { importTask, getPopupById })(ImportTask);
