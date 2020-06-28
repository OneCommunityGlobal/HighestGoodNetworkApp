/*********************************************************************************
 * Component: MEMBER 
 * Author: Henry Ng - 02/03/20
 * Display member of the members list 
 ********************************************************************************/
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { importTask } from './../../../../../actions/task';
import { ENDPOINTS } from './../../../../../utils/URL';
import axios from 'axios'

const ImportTask = (props) => {
  let fileReader;

  const handleFileRead = (e) => {
    const content = fileReader.result;
    content.split('\n').forEach((row, i) => {
      if (i > 0) {
        handleRow(row);
      }
    })
    setTimeout(() => {
      axios.put(ENDPOINTS.FIX_TASKS(props.wbsId))
    },
      4000
    )

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

      <input type='file'
        id='file'
        accept='.csv'
        onChange={e => handleFileChosen(e.target.files[0])}
      />


    </React.Fragment>
  )
}

export default connect(null, { importTask })(ImportTask)

