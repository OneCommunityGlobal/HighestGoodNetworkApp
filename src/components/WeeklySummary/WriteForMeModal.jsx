import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { boxStyle } from 'styles';
import httpService from 'services/httpService';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
// eslint-disable-next-line import/named
import { getUserInfo } from '../../utils/permissions';

// eslint-disable-next-line consistent-return
const getTimeEntriesForWeek = async (userId, offset) => {
  const fromDate = moment()
    .tz('America/Los_Angeles')
    .startOf('week')
    .subtract(offset, 'weeks')
    .format('YYYY-MM-DDTHH:mm:ss');

  const toDate = moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .subtract(offset, 'weeks')
    .format('YYYY-MM-DDTHH:mm:ss');

  const url = ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, toDate);

  try {
    return axios
      .get(url)
      .then(response => {
        // console.log('time entry data: ', response.data[0].notes);
        const { data } = response;

        const cleanedAndConcatenatedNotes = data.reduce((acc, entry) => {
          // Clean the current note
          const cleanedNotes = entry.notes
            .replace(/<a\b[^>]*>(.*?)<\/a>|&nbsp;|https?:\/\/\S+/gi, ' ')
            .replace(/<\/?[^>]+(>|$)/g, '');

          // Concatenate the cleaned note to the accumulator with newline separator
          return `${acc + cleanedNotes}\n`;
        }, '');

        return cleanedAndConcatenatedNotes;
      })
      .catch(error => {
        throw new Error(`Error fetching time entries:: ${error}`);
      });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Handle logout or unauthorized access
      throw new Error(`User is not authorized. Please log in.:  ${error}`);
      // return null;
    } else {
      throw new Error(`Error fetching time entries:: ${error}`);
    }
  }
};

function WriteItForMeModal(props) {
  // const { pasteResponse } = props;
  const [modal, setModal] = useState(false);
  const [summary, setSummary] = useState();
  const [buttonText, setButtonText] = useState('Copy Text');
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const toggle = () => setModal(!modal);

  const { displayUserProfile } = props; // Access displayUserProfile and authUser from props
  const fetchSummary = async prompt => {
    // eslint-disable-next-line react/destructuring-assignment
    toggle();

    try {
      const res = await httpService.post(ENDPOINTS.INTERACT_WITH_GPT, {
        prompt: `${prompt}`,
        userid: displayUserProfile._id,
        firstName: displayUserProfile.firstName,
      });

      if (res.status === 200) {
        const markdownRemoved = res.data.text
          .replace(/\n+/g, ' ') // Remove line breaks
          .replace(/\*/g, ''); // Remove asterisks

        setSummary(markdownRemoved);
      } else {
        throw new Error(`HTTP error: ${res.status}`);
      }
    } catch (error) {
      setSummary('Failed to fetch summary.');
      throw new Error(`HTTP error: ${error}`);
    }
  };

  const handleFetchSummary = async () => {
    try {
      setButtonText('Copy Text');
      setSummary();
      const promptBody = await getTimeEntriesForWeek(displayUserProfile._id, 0);
      if (promptBody === '') {
        toggle();
        setButtonDisabled(true);
        setSummary('You have no time entries logged for this week');
      } else {
        toggle();
        setButtonDisabled(false);
        fetchSummary(
          `Please edit the following summary of my week's work. Make sure it is professionally written in 3rd person format referrring to one person. 
          Write it as only one paragraph. It must be only one paragraph. Keep it at least 50, but less than 500 words. 
          Start the paragraph with 'This week ${displayUserProfile.firstName}'. 
          Make sure the paragraph contains no links or URLs and write it in a tone that is matter-of-fact and without embellishment. 
          Do not add flowery language, keep it simple and factual, for example, do not use the following words or 
          phrases: diligently, meticulously, successfully, steadfastly, adeptly, persisted, commenced, embarked on, 
          conducted, conducted a review, in the upcoming week, dedicate, notably, thoroughly, comprehensive, etc. 
          Do not add a final summary sentence. Apply all this to the following: \n${promptBody}`,
        );
      }
    } catch (error) {
      throw new Error(`Error in either fetching time entries or summary ${error}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(JSON.stringify(summary))
      .then(() => {
        setButtonText('Text Copied');
        setButtonDisabled(true);
      })
      .catch(() => {
        setButtonText('Copy Failed');
        // setButtonDisabled(true);
      });
  };

  // Assuming you have an endpoints file

  return (
    <div>
      <Button
        color="info"
        onClick={handleFetchSummary}
        style={{ ...boxStyle, width: '100%', marginTop: '5px' }}
      >
        Write It For Me
      </Button>

      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Generated Summary</ModalHeader>
        <ModalBody>
          {JSON.stringify(summary) || 'Taking a few minutes to load your summary'}
        </ModalBody>
        <ModalFooter>
          <span>Proofread and Copy the summary</span>
          <Button
            color="primary"
            id="copyButton"
            onClick={copyToClipboard}
            style={boxStyle}
            disabled={buttonDisabled}
          >
            {buttonText}
          </Button>
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

// export default WriteItForMeModal and connect to redux
export default connect(mapStateToProps, { getUserInfo })(WriteItForMeModal);
