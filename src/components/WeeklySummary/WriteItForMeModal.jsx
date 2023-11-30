import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import config from '../../config.json';
import ReactTooltip from 'react-tooltip';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { ENDPOINTS } from '../../utils/URL'; // Update the path accordingly
import { useSelector, useDispatch } from 'react-redux';
import { SET_CURRENT_USER, SET_HEADER_DATA } from '../../constants/auth';
import { boxStyle } from 'styles';
import { refreshToken } from '../../actions/authActions';
import httpService from 'services/httpService';
import { ApiEndpoint } from '../../utils/URL';

const APIEndpoint = ApiEndpoint;

const WriteItForMeModal = () => {
  const [modal, setModal] = useState(false);
  const [summary, setSummary] = useState('');

  const toggle = () => setModal(!modal);
  const { tokenKey } = config;

  const fetchSummary = async () => {
    console.log('fetchSummary called');
    const token = localStorage.getItem(tokenKey);

    httpService.post(`${APIEndpoint}/interactWithChatGPT`)
    .then(response => {
      console.log('Response received:', response);
      if (response.ok) {
        return response.json(); // Assuming the response needs to be parsed as JSON
      } else {
        throw new Error(`HTTP error: ${response.status}`);
      }
    })
    .then(summaryData => {
      console.log('Summary:', summaryData);
      // setSummary(summaryData.response);
      toggle(); // Call the toggle function after receiving the summary
      // Perform additional actions with summaryData if necessary
    })
    .catch(error => {
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
        Write it for me
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

export default WriteItForMeModal;

export const setCurrentUser = decoded => ({
  type: SET_CURRENT_USER,
  payload: decoded,
});
