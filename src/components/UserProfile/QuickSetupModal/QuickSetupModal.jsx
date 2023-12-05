import React, { useState, useEffect } from 'react';
import AddNewTitle from './AddNewTitle';
import AssignPopUp from './AssignPopUp';
import QuickSetupCodes from './QuickSetUpCodes';
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
  const [onAddTitle, setAddTitle] = useState(false);
  const [assignPopUp, setAssignPopup] = useState(false);
  const [titles, setTitles] = useState([]);
  const [curtitle, setTitleOnClick] = useState('');
  const [submittoggler, setSubmit] = useState(false);

  useEffect(() => {
    getAllTitle()
      .then(res => {console.log(res.data); setTitles(res.data)})
      .catch(err => console.log(err))
  },[submittoggler])

  return (
    <div className="container pt-3">
        <QuickSetupCodes titles={titles} setAssignPopup={setAssignPopup}
        setTitleOnClick={setTitleOnClick}/>

      <div className="col text-center">
        <Button className="mt-5" onClick={(e) => setAddTitle(true)}>Add A New Title</Button>
      </div>
      <AddNewTitle isOpen={onAddTitle} setIsOpen={setAddTitle} toggle={setAddTitle} setSubmit={setSubmit} submittoggler={submittoggler}/>
      <AssignPopUp isOpen={assignPopUp} setIsOpen={setAssignPopup} toggle={setAssignPopup} title={curtitle}/>
    </div>
  )
};

export default QuickSetupModal;