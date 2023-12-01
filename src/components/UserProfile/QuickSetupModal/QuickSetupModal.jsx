import React, { useState, useEffect } from 'react';
import AddNewTitle from './AddNewTitle';
import AssignPopUp from './AssignPopUp';
import { getAllTitle } from '../../../actions/title';

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import styles from './QuickSetupModal.css';



const QuickSetupModal = (props) => {
  const {
jobTitle  } = props;
  const [addTitle, setAddTitle] = useState(false);
  const [assignPopUp, setAssignPopup] = useState(false);
  const [titles, setTitles] = useState([]);
  const [curtitle, setTitleOnClick] = useState('');

  useEffect(() => {
    getAllTitle()
      .then(res => {console.log(res.data); setTitles(res.data)})
      .catch(err => console.log(err))
  },[])
  const qsc = titles.map((title) =>
  <div role="button" id="wrapper"     className="role-button bg-warning"
  onClick={()=> {
    setAssignPopup(true);
    setTitleOnClick(title);
    }}
    value="Software Engineer">{title?.shortName}
    <div className="title">
    <div className="summary">{title?.titleName}</div>
    </div>
  </div>
)

  return (
    <div className="container pt-3">
      <div className="blueSquares">
        {qsc}
      {/* <div role="button" id="wrapper"  className="role-button bg-warning" onClick={()=> setAssignPopup(true)} value="Software Engineer">SE
      <div className="title">
        <div className="summary">Software Engineer</div>
      </div>

      </div>
      <div role="button" className="role-button bg-warning" onClick={()=> setAssignPopup(true)} value="Software Engineer">ME</div>
      <div role="button" className="role-button bg-warning" onClick={()=> setAssignPopup(true)} value="Software Engineer">SE</div>
      <div role="button" className="role-button bg-warning" onClick={()=> setAssignPopup(true)} value="Software Engineer">SE</div> */}

    </div>

      <div className="col text-center">
        <Button onClick={(e) => setAddTitle(true)}>Add A New Title</Button>
      </div>
      <AddNewTitle isOpen={addTitle} setIsOpen={setAddTitle} toggle={setAddTitle} />
      <AssignPopUp isOpen={assignPopUp} setIsOpen={setAssignPopup} toggle={setAssignPopup} title={curtitle}/>
    </div>
  )
};

export default QuickSetupModal;