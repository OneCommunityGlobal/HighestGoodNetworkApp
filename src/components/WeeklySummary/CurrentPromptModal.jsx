import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import { boxStyle } from 'styles';
import { updateDashboardData, getDashboardDataAI } from '../../actions/weeklySummariesAIPrompt';

function CurrentPromptModal(props) {
  const [modal, setModal] = useState(false);

  const dispatch = useDispatch();
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

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
          } else {
            setPrompt(fallbackPrompt); // Fallback to hardcoded prompt if fetched prompt is empty
          }
        })
        .catch(error => {
          // console.error('Error fetching AI prompt:', error);
          setPrompt(fallbackPrompt); // Fallback to hardcoded prompt in case of error
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [modal]);

  // console.log('props.userRole: ', props.userRole);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt Copied!');
  };

  const handleSavePrompt = () => {
    setLoading(true);
    dispatch(updateDashboardData(prompt))
      .then(() => {
        toast.success('Prompt Updated!');
        setIsEditing(false);
      })
      .catch(error => {
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

  return (
    <div>
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
        <ModalBody>
          {loading ? (
            <div>Loading...</div>
          ) : isEditing ? (
            <Input type="textarea" value={prompt} onChange={handleEditPrompt} />
          ) : (
            <div>{prompt}</div>
          )}
        </ModalBody>
        <ModalFooter>
          {props.userRole === 'Owner' && (
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
