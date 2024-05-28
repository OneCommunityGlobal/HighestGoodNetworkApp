import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { boxStyle } from 'styles';
import httpService from 'services/httpService';
import { connect } from 'react-redux';
import { ENDPOINTS } from '../../utils/URL';
import { SET_CURRENT_USER } from '../../constants/auth';
// eslint-disable-next-line import/named
import { getUserInfo } from '../../utils/permissions';

function WriteItForMeModal(props) {
  // const { pasteResponse } = props;
  const [modal, setModal] = useState(false);
  const [summary, setSummary] = useState();
  const toggle = () => setModal(!modal);

  const fetchSummary = async () => {
    // eslint-disable-next-line react/destructuring-assignment
    const { userid } = getUserInfo();
    const { displayUserProfile } = props;
    toggle();

    try {
      const res = await httpService.post(ENDPOINTS.INTERACT_WITH_GPT, {
        // prompt: 'Please summarize my week\'s work.',
        userid,
        firstName: displayUserProfile.firstName,
      });

      if (res.status === 200) {
        const { text } = res.data.text;
        setSummary(text);
        // pasteResponse(res.data.text);
      } else {
        throw new Error(`HTTP error: ${res.status}`);
      }
    } catch (error) {
      setSummary('Failed to fetch summary.');
      throw new Error(`HTTP error: ${error}`);
    }
  };

  return (
    <div>
      <Button color="info" onClick={fetchSummary} style={{ ...boxStyle, width: '100%' }}>
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
