/*********************************************************************************
 * Component: MEMBER 
 * Author: Henry Ng - 02/03/20
 * Display member of the members list 
 ********************************************************************************/
import React from 'react'
import { connect } from 'react-redux'
import { assignProject } from './../../../../actions/projectMembers'

const WBSDetail = (props) => {

  let fileReader;

  const handleFileRead = (e) => {
    const content = fileReader.result;
    let contentArr;
    content.split('\n').forEach(row => {
      let rowArr = row.split(',');
      console.log('=>', rowArr);

    })
  }

  const handleFileChosen = (file) => {
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
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

export default connect(null, { assignProject })(WBSDetail)

