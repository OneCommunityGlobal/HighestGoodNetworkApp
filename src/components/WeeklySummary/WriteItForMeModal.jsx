import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import { boxStyle } from 'styles';
import httpService from 'services/httpService';
import { connect } from 'react-redux';
import { ENDPOINTS } from '../../utils/URL';
import { SET_CURRENT_USER } from '../../constants/auth';
import { getUserInfo } from '../../utils/permissions';

function WriteItForMeModal(props) {
  const [modal, setModal] = useState(false);
  const [summary, setSummary] = useState('');

  const toggle = () => setModal(!modal);

  const fetchSummary = async () => {
    // eslint-disable-next-line react/destructuring-assignment
    const { userid } = props.getUserInfo();

    httpService
      .post(ENDPOINTS.INTERACT_WITH_CHATGPT, { userid })
      .then(response => {
        // console.log('Response received:', response);
        if (response.status === 200) {
          const { data } = response;
          setSummary(data.response);
          toggle();
        } else {
          throw new Error(`HTTP error: ${response.status}`);
        }
      })
      .catch(error => {
        throw new Error(`HTTP error: ${error}`);
        // console.error('Error during fetchSummary:', error);
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
}

// export default WriteItForMeModal;
export default connect(null, { getUserInfo })(WriteItForMeModal);

export const setCurrentUser = decoded => ({
  type: SET_CURRENT_USER,
  payload: decoded,
});
