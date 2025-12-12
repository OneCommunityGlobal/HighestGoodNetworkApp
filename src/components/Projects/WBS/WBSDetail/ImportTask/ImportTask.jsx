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
import parse from 'html-react-parser';
import { boxStyle, boxStyleDark } from '~/styles';
import '../../../../Header/DarkMode.css'

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
  const [instruction, setInstruction] = useState('');  // right now the saved popupContent for this is 'Task PR#905', better to change it 

  /*
  * -------------------------------- functions -------------------------------- 
  */
  const toggle = async () => {
    // fetch latest popup content
    await props.getPopupById(TASK_IMPORT_POPUP_ID);
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
        if (i < 2) return;
        for (let c = 0; c <= 6; c += 2) {
          const num = rowArr[c];
          const name = rowArr[c + 1];
          if (num !== null && name !== null) {
            tmpList.push(newTask(num, name, c / 2 + 1, rowArr, i));
          }
        }
      });
      const header = rows?.[0]?.[0] ?? '';
      setInstruction(`${header}<br/> Rows: ${rows?.length ?? 0}`);
      setImportStatus('imported');
      setTaskList(tmpList);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error importing tasks:', error);
      setImportStatus('importError');
      setAlert(error.message);
    }
  };

  const parseResources = (cell, members, lineNo) => {
    if (!cell) return [];
    const seen = new Set();
    return cell.split(',').map(raw => {
      const name = raw.trim();
      if (seen.has(name)) {
        throw new Error(`Error: There are more than one [${name}] in resources on line ${lineNo + 1}`);
      }
      seen.add(name);
      const member = members.find(
        p => `${p.firstName} ${p.lastName}`.toLowerCase() === name.toLowerCase()
      );
      if (!member) throw new Error(`Error: ${name} is not in the project member list`);
      return `${name}|${member._id}|${member.profilePic || '/defaultprofilepic.png'}`;
    });
  };

  const newTask = (num, taskName, level, rowArr, i) => {
    const resourcesNames = parseResources(rowArr[9], members, i);
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
    // store raw string; guard non-strings
    setInstruction(typeof popupContent === 'string' ? popupContent : String(popupContent ?? ''));
    setTaskList([]);
  };

  const onCloseHandler = async () => {
    props.setIsLoading(true);
    await props.load();
    props.setIsLoading(false);
  }



  /*
  * -------------------------------- useEffects -------------------------------- 
  */

  useEffect(() => {
    if (typeof popupContent === 'string') {
      setInstruction(popupContent);
    } else if (popupContent != null) {
      // if it’s somehow not a string (e.g., an object), stringify safely
      setInstruction(String(popupContent));
    }
  }, [popupContent]);

  const SpinnerRow = ({ label }) => (
    <tr>
      <td>
        <button className="btn btn-primary" type="button" disabled>
          <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true">
            {label}
          </span>
        </button>
      </td>
    </tr>
  );
  
  const FileInput = () => (
    <input
      type="file"
      id="file"
      accept=".xlsx"
      onChange={e => handleFileChosen(e.target.files[0])}
    />
  );
  
  const renderStatusRow = (status) => {
    switch (status) {
      case 'choosing':
        return (
          <tr>
            <td><FileInput /></td>
          </tr>
        );
      case 'importing':
        return <SpinnerRow label="Importing..." />;
      case 'importError':
        return (
          <tr>
            <td>
              <Alert color="danger">{alert}</Alert>
              <FileInput />
            </td>
          </tr>
        );
      case 'imported':
        return (
          <tr>
            <td>
              <Alert color="primary">Are you sure you want to upload it? </Alert>
              <button className="btn btn-primary" type="button" onClick={uploadTaskList}>
                Upload
              </button>
              <button className="btn btn-secondary ml-2" type="button" onClick={reset}>
                Reset
              </button>
            </td>
          </tr>
        );
      case 'uploading':
        return <SpinnerRow label="Uploading..." />;
      case 'uploaded':
        return (
          <tr>
            <td><Alert color="primary">File Uploaded!</Alert></td>
          </tr>
        );
      default:
        return null;
    }
  };  

  return (
    <>
      <Modal isOpen={modal} toggle={toggle} onClosed={onCloseHandler} className={darkMode ? 'dark-mode text-light' : ''}>
        <ModalHeader toggle={toggle} className={darkMode ? 'bg-space-cadet' : ''}>Import Tasks</ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <table className={`table table-bordered ${darkMode ? 'text-light' : ''}`}>
            <tbody>
              <tr>
                {/* eslint-disable-next-line jsx-a11y/scope */}
                <td scope="col">
                 <div id="instruction">
                    {typeof instruction === 'string' && instruction.trim() ? parse(instruction) : null}
                 </div>
                </td>
              </tr>
              {renderStatusRow(importStatus)}
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button color="secondary" onClick={toggle}>
            {importStatus === 'uploaded' ? 'Done' : 'Cancel'}
          </Button>
        </ModalFooter>
      </Modal>
      <Button color="primary" className="controlBtn" size="sm" onClick={toggle} style={darkMode ? boxStyleDark : boxStyle}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <span onClick={toggle}>Import Tasks</span>
      </Button>
    </>
  );
};

const mapStateToProps = state => ({
  popupContent: state.popupEditor.currPopup.popupContent,
  members: state.projectMembers.members,
  darkMode: state.theme.darkMode,
  state: state,
});
export default connect(mapStateToProps, { importTask, getPopupById })(ImportTask);
