/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import { boxStyle } from 'styles';
import {
  updateDashboardData,
  getDashboardDataAI,
  updateCopiedPromtDate,
} from '../../actions/weeklySummariesAIPrompt';
import { getUserProfile } from '../../actions/userProfile';
import image from '../../assets/images/New-HGN-Icon-11kb-200x160px.png';

function CurrentPromptModal(props) {
  const [modal, setModal] = useState(false);

  const dispatch = useDispatch();
  const [prompt, setPrompt] = useState('');
  const [promptModifiedDate, setPromptModifiedDate] = useState('');
  const [copiedDate, setCopiedDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userRole, userId } = props;
  const toggle = () => setModal(!modal);

  const fallbackPrompt = `Please edit the following summary of my week's work. Make sure it is professionally written in 3rd person format.
  Write it as only one paragraph. It must be only one paragraph. Keep it less than 500 words. Start the paragraph with 'This week'.
  Make sure the paragraph contains no links or URLs and write it in a tone that is matter-of-fact and without embellishment.
  Do not add flowery language, keep it simple and factual. Do not add a final summary sentence. Apply all this to the following:`;

  // Fetch the prompt when the component mounts or the modal opens
  useEffect(() => {
    if (modal) {
      setLoading(true);
      dispatch(getDashboardDataAI())
        .then(response => {
          if (response) {
            // console.log('response: ', response.aIPromptText);
            setPrompt(response.aIPromptText);
            setPromptModifiedDate(response.modifiedDatetime);
          } else {
            setPrompt(fallbackPrompt); // Fallback to hardcoded prompt if fetched prompt is empty
          }
        })
        .catch(() => {
          // console.error('Error fetching AI prompt:', error);
          setPrompt(fallbackPrompt); // Fallback to hardcoded prompt in case of error
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [modal]);
  useEffect(() => {
    if (modal) {
      dispatch(getUserProfile(userId))
        .then(response => {
          if (response) {
            setCopiedDate(response.copiedAiPrompt);
          }
        })
        .catch(error => {
          toast.error('There was an error');
        });
    }
  }, [modal]);

  // console.log('props.userRole: ', props.userRole);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(prompt);
    // eslint-disable-next-line prettier/prettier
    dispatch(updateCopiedPromtDate(userId)).then(() => {
      toast.success('Prompt Copied!');
    });
  };

  const handleSavePrompt = () => {
    setLoading(true);
    dispatch(updateDashboardData(prompt))
      .then(() => {
        toast.success('Prompt Updated!');
        setIsEditing(false);
      })
      .catch(() => {
        // console.error('Error updating AI prompt:', error);
        toast.error('Failed to update prompt.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEditPrompt = event => {
    setPrompt(event.target.value);
  };

  const renderModalContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (isEditing) {
      return <Input type="textarea" value={prompt} onChange={handleEditPrompt} />;
    }
    return <div>{prompt}</div>;
  };
  return (
    <div>
      {promptModifiedDate > copiedDate ? (
        <Button color="info" onClick={toggle} style={boxStyle}>
          View and Copy Current <img src={image} alt="" /> AI Prompt
          <i
            className="fa fa-info-circle"
            data-tip
            data-for="timeEntryTip"
            data-delay-hide="1000"
            aria-hidden="true"
            title=""
            style={{ paddingLeft: '.32rem' }}
          />
        </Button>
      ) : (
        <Button color="info" onClick={toggle} style={boxStyle}>
          View and Copy Current AI Prompt
          <i
            className="fa fa-info-circle"
            data-tip
            data-for="timeEntryTip"
            data-delay-hide="1000"
            aria-hidden="true"
            title=""
            style={{ paddingLeft: '.32rem' }}
          />
        </Button>
      )}

      <ReactTooltip id="timeEntryTip" place="bottom" effect="solid">
        Click this button to see and copy the most current AI prompt
        <br />
        you should be using when editing your weeklly summary with chatGPT
        <br />
        or similar AI text completion tool
        <br />
      </ReactTooltip>

      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Current AI Prompt</ModalHeader>
        <ModalBody>{renderModalContent()}</ModalBody>
        <ModalFooter>
          {userRole === 'Owner' && (
            <Button color="secondary" onClick={() => setIsEditing(!isEditing)} disabled={loading}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          )}
          {isEditing ? (
            <Button color="primary" onClick={handleSavePrompt} disabled={loading}>
              Save
            </Button>
          ) : (
            <Button color="primary" onClick={handleCopyToClipboard}>
              Copy Prompt
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default CurrentPromptModal;
