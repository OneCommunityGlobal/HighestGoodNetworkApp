/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
import { useState, useRef } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { boxStyle, boxStyleDark } from '~/styles';
import httpService from '~/services/httpService';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';

const fallbackPrompt = `Please edit the following summary of my week's work. Make sure it is professionally written in 3rd person format.
Write it as only one paragraph. It must be only one paragraph. Keep it less than 500 words. Start the paragraph with 'This week'.
Make sure the paragraph contains no links or URLs and write it in a tone that is matter-of-fact and without embellishment.
Do not add flowery language, keep it simple and factual. Do not add a final summary sentence. Apply all this to the following:`;

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
        const { data } = response;

        const cleanedAndConcatenatedNotes = data.reduce((acc, entry) => {
          const cleanedNotes = (entry.notes || '')
            .replace(/<a\b[^>]*>(.*?)<\/a>|&nbsp;|https?:\/\/\S+/gi, ' ')
            .replace(/<\/?[^>]+(>|$)/g, '');

          return `${acc + cleanedNotes}\n`;
        }, '');

        return cleanedAndConcatenatedNotes;
      })
      .catch(error => {
        console.error(`Error fetching time entries: ${error.message || error}`);
      });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error(`User is not authorized. Please log in.: ${error}`);
    } else {
      console.error(`Error fetching time entries:: ${error}`);
    }
  }
};

function WriteItForMeModal(props) {
  const [modal, setModal] = useState(false);
  const [summary, setSummary] = useState();
  const [buttonText, setButtonText] = useState('Copy Text');
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isAIButtonDisabled, setIsAIButtonDisabled] = useState(false);
  const timeoutRef = useRef(null);

  const toggle = () => setModal(!modal);

  const { displayUserProfile, darkMode } = props; // Access displayUserProfile and authUser from props

  const getLatestAIPrompt = async () => {
    try {
      const res = await httpService.get(ENDPOINTS.AI_PROMPT());
      const text = res?.data?.aIPromptText || res?.aIPromptText;
      return (text && String(text).trim()) || fallbackPrompt;
    } catch (e) {
      return fallbackPrompt;
    }
  };

  const fetchSummary = async prompt => {
    toggle();

    try {
      const res = await httpService.post(ENDPOINTS.INTERACT_WITH_GPT, {
        prompt: `${prompt}`,
        userid: displayUserProfile._id,
        firstName: displayUserProfile.firstName,
      });

      if (res.status === 200) {
        const markdownRemoved = res.data.text
          .replace(/\n+/g, ' ')
          .replace(/\*/g, '')
          .replace(/\"/g, '');

        setSummary(markdownRemoved);
      } else {
        setSummary('Failed to fetch summary.');
        console.error(`HTTP error: ${res.status}`);
      }
    } catch (error) {
      setSummary('Failed to fetch summary.');
    } finally {
      toggle();
    }
  };

  const handleFetchSummary = async () => {
    setClickCount(prevCount => prevCount + 1);

    if (clickCount + 1 >= 3) {
      setIsAIButtonDisabled(true);
      toast.info(
        'You have clicked 3 times now, try again after 5 minutes. This is to limit API Usage.',
      );

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsAIButtonDisabled(false);
        setClickCount(0);
      }, 300000); // 300 seconds or 5 minutes
    }

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
        const latestPrompt = await getLatestAIPrompt();
        const combinedPrompt = `${latestPrompt}\n${promptBody}`;
        fetchSummary(combinedPrompt);
      }
    } catch (error) {
      console.error(`Error in either fetching time entries or summary ${error}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(summary)
      .then(() => {
        setButtonText('Text Copied');
        setButtonDisabled(true);
      })
      .catch(() => {
        setButtonText('Copy Failed');
      });
  };

  return (
    <div>
      <Button
        color="info"
        onClick={handleFetchSummary}
        style={{ ...(darkMode ? boxStyleDark : boxStyle), width: '100%', marginTop: '5px' }}
        disabled={isAIButtonDisabled}
      >
        Write It For Me
      </Button>

      <Modal isOpen={modal} toggle={toggle} className={darkMode ? 'text-light dark-mode' : ''}>
        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={toggle}>
          Generated Summary | clicks left : {3 - clickCount}
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          {summary || 'Taking a few minutes to load your summary'}
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <span>Proofread and Copy the summary</span>
          <Button
            color="primary"
            id="copyButton"
            onClick={copyToClipboard}
            style={darkMode ? boxStyleDark : boxStyle}
            disabled={buttonDisabled}
          >
            {buttonText}
          </Button>
          <Button color="primary" onClick={toggle} style={darkMode ? boxStyleDark : boxStyle}>
            Close
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
}

const mapStateToProps = state => ({
  displayUserProfile: state.userProfile,
  darkMode: state.theme.darkMode,
  writeDisabled: state.writeButton ? state.writeButton.writeDisabled : false,
});

export default connect(mapStateToProps)(WriteItForMeModal);
