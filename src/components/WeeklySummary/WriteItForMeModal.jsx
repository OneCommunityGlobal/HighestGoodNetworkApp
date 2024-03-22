import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { boxStyle } from 'styles';
import httpService from 'services/httpService';
import { connect } from 'react-redux';
import { ENDPOINTS } from '../../utils/URL';
import { SET_CURRENT_USER } from '../../constants/auth';
import { getUserInfo } from '../../utils/permissions';

function WriteItForMeModal(props) {
  const { pasteResponse } = props;
  const [modal, setModal] = useState(false);
  const [summary, setSummary] = useState();
  const toggle = () => setModal(!modal);

  const fetchSummary = async () => {
    // eslint-disable-next-line react/destructuring-assignment
    const { userid } = getUserInfo();
    const { displayUserProfile } = props;
    toggle();

    httpService
      .post(ENDPOINTS.INTERACT_WITH_CHATGPT, {
        userid,
        firstName: displayUserProfile.firstName,
      })
      .then(res => {
        if (res.status === 200) {
          const {
            data: { GPTSummary },
          } = res;
          setSummary(
            'Please now proofread and edit your summary to make sure the AI didn’t confuse any technical terms, misspelled words from your weekly summaries, etc.',
          );

          pasteResponse(GPTSummary);
        } else {
          throw new Error(`HTTP error: ${res.status}`);
        }
      })
      .catch(error => {
        throw new Error(`HTTP error: ${error}`);
        // console.error('Error during fetchSummary:', error);
        // toast.error('Failed to fetch summary');
      });
  };

  return (
    <div>
      <Button color="info" onClick={fetchSummary} style={{ ...boxStyle, width: '187px' }}>
        Write It For Me
      </Button>

      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Generated Summary</ModalHeader>
        <ModalBody>{JSON.stringify(summary) || 'Loading summary...'}</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={toggle} style={boxStyle}>
            Close
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
}

const mapStateToProps = state => ({
  displayUserProfile: state.userProfile,
});

// export default WriteItForMeModal;
export default connect(mapStateToProps, { getUserInfo })(WriteItForMeModal);

export const setCurrentUser = decoded => ({
  type: SET_CURRENT_USER,
  payload: decoded,
});
