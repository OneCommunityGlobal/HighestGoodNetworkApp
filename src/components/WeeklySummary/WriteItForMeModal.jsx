import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import config from '../../config.json';
//import ReactTooltip from 'react-tooltip';
import { ENDPOINTS } from '../../utils/URL'; // Update the path accordingly
import { connect, useSelector, useDispatch } from 'react-redux';
import { SET_CURRENT_USER, SET_HEADER_DATA } from '../../constants/auth';
import { boxStyle } from 'styles';
import httpService from 'services/httpService';
import{ getUserInfo } from '../../utils/permissions';

const WriteItForMeModal = (props) => {
  const [modal, setModal] = useState(false);
  const [summary, setSummary] = useState('');

  const toggle = () => setModal(!modal);
  const { tokenKey } = config;

  const fetchSummary = async () => {
    const {userid} = props.getUserInfo()
    
    console.log('fetchSummary called',);
    const token = localStorage.getItem(tokenKey);
  httpService.post(ENDPOINTS.INTERACT_WITH_CHATGPT,{userid})
    .then(response => {
      console.log('Response received:', response);
      if (response.status===200) {
        const {data } = response; 
        setSummary(data.response)
        toggle();  // Assuming the response needs to be parsed as JSON
      } else {
        throw new Error(`HTTP error: ${response.status}`);
      }
    }).catch(error => {
      console.error('Error during fetchSummary:', error);
      // toast.error('Failed to fetch summary');
    });

  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    toast.success('Summary Copied!');
  };

  return (
    <div>
      <Button color="info" onClick={fetchSummary} style={boxStyle}>
        Write It For Me
      </Button>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Generated Summary</ModalHeader>
        <ModalBody>{summary || 'Loading summary...'}</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleCopyToClipboard} style={boxStyle}>
            Copy Summary
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
};

// export default WriteItForMeModal;
export default connect(null, { getUserInfo })(WriteItForMeModal);

export const setCurrentUser = decoded => ({
  type: SET_CURRENT_USER,
  payload: decoded,
});
