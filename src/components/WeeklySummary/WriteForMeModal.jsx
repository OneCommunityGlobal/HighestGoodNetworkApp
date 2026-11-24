import { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Input } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import httpService from '~/services/httpService';
import { boxStyle, boxStyleDark } from '~/styles';
import { ENDPOINTS } from '~/utils/URL';

const fallbackPrompt = `Please edit the following summary of my week's work. Write it professionally in third person, as one matter-of-fact paragraph under 500 words. Start with "This week". Do not include URLs or a concluding summary sentence. Apply these instructions to the following work notes:`;

const collectNoteText = node =>
  Array.from(node.childNodes)
    .map(child => {
      if (child.nodeType === Node.TEXT_NODE) return child.nodeValue;
      if (child.nodeType !== Node.ELEMENT_NODE) return '';

      const tagName = child.tagName.toLowerCase();
      if (tagName === 'script' || tagName === 'style') return '';
      if (tagName === 'br') return '\n';

      const childText = collectNoteText(child);
      return ['div', 'li', 'p'].includes(tagName) ? `${childText}\n` : childText;
    })
    .join('');

const cleanNote = notes => {
  const parsedNotes = new DOMParser().parseFromString(String(notes || ''), 'text/html');
  return collectNoteText(parsedNotes.body)
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();
};

const cleanNotes = entries =>
  entries
    .map(entry => cleanNote(entry?.notes))
    .filter(Boolean)
    .join('\n');

export const getCurrentWeekTimeEntries = async userId => {
  const fromDate = moment()
    .tz('America/Los_Angeles')
    .startOf('week')
    .format('YYYY-MM-DDTHH:mm:ss');
  const toDate = moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .format('YYYY-MM-DDTHH:mm:ss');
  const response = await httpService.get(ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, toDate));
  return cleanNotes(Array.isArray(response?.data) ? response.data : []);
};

const getLatestPrompt = async () => {
  const response = await httpService.get(ENDPOINTS.AI_PROMPT());
  return String(response?.data?.aIPromptText ?? response?.aIPromptText ?? '');
};

const getErrorMessage = error =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  'We could not generate a summary. You can continue writing your summary manually.';

function WriteForMeModal({
  userId,
  firstName,
  displayUserProfile,
  darkMode,
  pasteResponse,
  hasExistingContent,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [confirmReplace, setConfirmReplace] = useState(false);
  const resolvedUserId = userId || displayUserProfile?._id;
  const resolvedFirstName = firstName || displayUserProfile?.firstName || '';
  const buttonStyle = darkMode ? boxStyleDark : boxStyle;

  const handleGenerate = async () => {
    setIsOpen(true);
    setStatus('loading');
    setDraft('');
    setMessage('');
    setCopyMessage('');
    setConfirmReplace(false);

    let requestStage = 'weekly time entries';
    try {
      let prompt;
      try {
        prompt = await getLatestPrompt();
      } catch {
        prompt = fallbackPrompt;
      }

      requestStage = 'weekly time entries';
      const notes = await getCurrentWeekTimeEntries(resolvedUserId);
      if (!notes) {
        setStatus('empty');
        setMessage(
          'No time entries with notes were found for this week. You can write your summary manually.',
        );
        return;
      }

      requestStage = 'AI summary generation';
      const response = await httpService.post(ENDPOINTS.INTERACT_WITH_GPT, {
        prompt: `${prompt}${prompt ? '\n\n' : ''}${notes}`,
        userid: resolvedUserId,
        firstName: resolvedFirstName,
      });

      if (response?.status < 200 || response?.status >= 300) {
        throw new Error(
          response?.data?.message ||
            response?.data?.error ||
            'The summary service returned an error.',
        );
      }

      const generatedText = response?.data?.text;
      if (typeof generatedText !== 'string' || !generatedText.trim()) {
        throw new Error(response?.data?.message || 'The summary service returned no draft.');
      }

      setDraft(generatedText.trim());
      setStatus('success');
    } catch (error) {
      const endpoint =
        requestStage === 'AI summary generation' ? ` (${ENDPOINTS.INTERACT_WITH_GPT})` : '';
      setMessage(`${requestStage} request failed${endpoint}: ${getErrorMessage(error)}`);
      setStatus('error');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopyMessage('Draft copied.');
    } catch {
      setCopyMessage('Copy failed. You can still select and copy the draft.');
    }
  };

  const applyDraft = allowReplace => {
    const applied = pasteResponse?.(draft, allowReplace);
    if (applied) setIsOpen(false);
  };

  const handleApplyDraft = () => {
    if (hasExistingContent) {
      setConfirmReplace(true);
      return;
    }
    applyDraft(false);
  };

  const closeModal = () => {
    setConfirmReplace(false);
    setIsOpen(false);
  };

  return (
    <div>
      <Button
        type="button"
        color="info"
        className="p-1 mb-1 responsive-font-size"
        style={buttonStyle}
        onClick={handleGenerate}
        disabled={status === 'loading'}
      >
        Write it for me
      </Button>
      <Modal
        isOpen={isOpen}
        toggle={closeModal}
        modalClassName={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader toggle={closeModal} className={darkMode ? 'bg-space-cadet' : ''}>
          Write it for me
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          {status === 'loading' && <output aria-live="polite">Generating a draft…</output>}
          {status === 'empty' && <output aria-live="polite">{message}</output>}
          {status === 'error' && (
            <p role="alert" className={darkMode ? 'text-light' : 'text-danger'}>
              {message}
            </p>
          )}
          {status === 'success' && (
            <>
              {confirmReplace ? (
                <p role="alert">
                  This summary already has text. Replacing it will remove that text. Do you want to
                  replace it with this draft?
                </p>
              ) : (
                <p>Review and edit this draft before applying it to your summary.</p>
              )}
              <Input
                type="textarea"
                rows={8}
                aria-label="Generated summary draft"
                value={draft}
                onChange={event => setDraft(event.target.value)}
                className={darkMode ? 'bg-space-cadet text-light' : ''}
                style={darkMode ? { borderColor: '#8294b5' } : undefined}
              />
              {copyMessage && <output aria-live="polite">{copyMessage}</output>}
            </>
          )}
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          {status === 'success' && (
            <>
              <Button type="button" color="secondary" onClick={handleCopy} style={buttonStyle}>
                Copy draft
              </Button>
              {confirmReplace ? (
                <>
                  <Button
                    type="button"
                    color="secondary"
                    onClick={() => setConfirmReplace(false)}
                    style={buttonStyle}
                  >
                    Keep existing text
                  </Button>
                  <Button
                    type="button"
                    color="primary"
                    onClick={() => applyDraft(true)}
                    style={buttonStyle}
                  >
                    Replace summary
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  color="primary"
                  onClick={handleApplyDraft}
                  style={buttonStyle}
                >
                  Use draft in summary
                </Button>
              )}
            </>
          )}
          {status === 'error' && (
            <Button type="button" color="primary" onClick={handleGenerate} style={buttonStyle}>
              Try again
            </Button>
          )}
          <Button type="button" color="secondary" onClick={closeModal} style={buttonStyle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

WriteForMeModal.propTypes = {
  userId: PropTypes.string,
  firstName: PropTypes.string,
  displayUserProfile: PropTypes.shape({
    _id: PropTypes.string,
    firstName: PropTypes.string,
  }),
  darkMode: PropTypes.bool,
  pasteResponse: PropTypes.func,
  hasExistingContent: PropTypes.bool,
};

const mapStateToProps = state => ({
  displayUserProfile: state.userProfile,
  darkMode: state.theme?.darkMode,
});

export default connect(mapStateToProps)(WriteForMeModal);
