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

const WriteItForMeModal = () => {
  const [modal, setModal] = useState(false);
  const [summary, setSummary] = useState('');

  const toggle = () => setModal(!modal);
  const { tokenKey } = config;

  const fetchSummary = async () => {
    console.log('fetchSummary called');
    const token = localStorage.getItem(tokenKey);

    fetch('http://localhost:4500/api/interactWithChatGPT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        console.log('Response received');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Data:', data); // Log the data
        // Assuming the API returns the summary in the 'response' field of the JSON.
        setSummary(data.response);
        toggle(); // Show the modal after fetching the summary
      })
      .catch(error => {
        console.error('Error fetching summary:', error);
        toast.error('Failed to fetch summary');
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
