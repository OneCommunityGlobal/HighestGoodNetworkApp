import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  CardBody,
  Card,
} from 'reactstrap';
import PropTypes from 'prop-types';
import hasPermission from '../../../utils/permissions';
import styles from './EditLinkModal.module.css';
import { boxStyle, boxStyleDark } from '~/styles';
import { connect, useSelector } from 'react-redux';
import { isValidGoogleDocsUrl, isValidMediaUrl } from '~/utils/checkValidURL';
import { toast } from 'react-toastify';

import { permissions } from '../../../utils/constants';
const EditLinkModal = props => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const { isOpen, closeModal, updateLink, userProfile, handleSubmit } = props;
  const canManageAdminLinks = props.hasPermission(permissions.manageAdminLinks);

  const initialAdminLinkState = [
    { Name: 'Google Doc', Link: '' },
    { Name: 'Media Folder', Link: '' },
  ];
  const emptyLink = { Name: '', Link: '' };
  const copyLinks = links => (links || []).map(link => ({ ...link }));
  const getSavedDraftState = () => {
    const savedAdminLinks = copyLinks(userProfile.adminLinks);
    const googleDocLink =
      savedAdminLinks.find(link => link.Name === 'Google Doc') || initialAdminLinkState[0];
    const mediaLink =
      savedAdminLinks.find(link => link.Name === 'Media Folder') || initialAdminLinkState[1];

    return {
      googleLink: { ...googleDocLink },
      mediaFolderLink: { ...mediaLink },
      adminLinks: savedAdminLinks
        .filter(link => link.Name !== 'Google Doc')
        .filter(link => link.Name !== 'Media Folder'),
      personalLinks: copyLinks(userProfile.personalLinks),
    };
  };
  const savedDraftState = getSavedDraftState();

  const [newAdminLink, setNewAdminLink] = useState(emptyLink);
  const [newPersonalLink, setNewPersonalLink] = useState(emptyLink);

  const [googleLink, setGoogleLink] = useState(savedDraftState.googleLink);
  const [mediaFolderLink, setMediaFolderLink] = useState(savedDraftState.mediaFolderLink);
  const [adminLinks, setAdminLinks] = useState(savedDraftState.adminLinks);
  const [personalLinks, setPersonalLinks] = useState(savedDraftState.personalLinks);
  const originalMediaFolderLink = useRef(mediaFolderLink.Link);

  const [isChanged, setIsChanged] = useState(false);
  const [mediaFolderDiffWarning, setMediaFolderDiffWarning] = useState(false);
  const [isWarningPopupOpen, setIsWarningPopupOpen] = useState(false);
  const [isMediaFolderLinkChanged, setIsMediaFolderLinkChanged] = useState(false);
  const [isValidLink, setIsValidLink] = useState(true);
  const [duplicateNameError, setDuplicateNameError] = useState(false);

  const resetTransientState = () => {
    setNewAdminLink(emptyLink);
    setNewPersonalLink(emptyLink);
    setIsChanged(false);
    setIsValidLink(true);
    setDuplicateNameError(false);
    setIsWarningPopupOpen(false);
    setIsMediaFolderLinkChanged(false);
  };

  const resetDraftFromSavedProfile = () => {
    // Keep edits in a local draft so Cancel/X can discard unsaved modal changes.
    const draftState = getSavedDraftState();
    setGoogleLink(draftState.googleLink);
    setMediaFolderLink(draftState.mediaFolderLink);
    setAdminLinks(draftState.adminLinks);
    setPersonalLinks(draftState.personalLinks);
    originalMediaFolderLink.current = draftState.mediaFolderLink.Link;
    resetTransientState();
  };

  const handleCloseWithoutUpdate = () => {
    // Closing without Update reloads saved values and clears temporary validation state.
    resetDraftFromSavedProfile();
    closeModal();
  };

  const handleNameChanges = (e, links, index, setLinks) => {
    const updateLinks = [...links];
    updateLinks[index] = { ...updateLinks[index], Name: e.target.value };
    setLinks(updateLinks);
    setIsChanged(true);
  };
  const handleLinkChanges = (e, links, index, setLinks) => {
    const updateLinks = [...links];
    updateLinks[index] = { ...updateLinks[index], Link: e.target.value };
    setLinks(updateLinks);
    setIsChanged(true);
  };

  const handleMediaFolderLinkChanges = e => {
    if (!mediaFolderLink.Link) {
      // Prevent warning popup appear if empty media folder link
      setIsMediaFolderLinkChanged(true);
      setMediaFolderLink({ ...mediaFolderLink, Link: e.target.value.trim() });
      setIsChanged(true);
    } else {
      setMediaFolderLink({ ...mediaFolderLink, Link: e.target.value.trim() });
      setIsChanged(true);
      if (!isMediaFolderLinkChanged && !isWarningPopupOpen) {
        // First time media folder link is changed
        setIsMediaFolderLinkChanged(true);
        setIsWarningPopupOpen(true);
      }
    }
  };

  const addNewLink = (links, setLinks, newLink, clearInput) => {
    const isDuplicateName = isDuplicateLink([googleLink, mediaFolderLink, ...links], newLink);
    const isDuplicateUrl = links.some(link => link.Link.trim().toLowerCase() === newLink.Link.trim().toLowerCase());
    const hasInvalidUrl = !isValidUrl(newLink.Link);

    if (isDuplicateName || isDuplicateUrl) {
      setDuplicateNameError(true); 
      setIsValidLink(true);
    } else if (hasInvalidUrl) {
      setDuplicateNameError(false);
      setIsValidLink(false);
    } else {
      const newLinks = [...links, { Name: newLink.Name, Link: newLink.Link }];
      setLinks(newLinks);
      setIsChanged(true);
      setIsValidLink(true);
      setDuplicateNameError(false);
      clearInput();
    }
  };

  const removeLink = (links, setLinks, { name, link }) => {
    const newLinks = links.filter(link => {
      return link.Name !== name;
    });
    setLinks(newLinks);
    setIsChanged(true);
  };

  const isDifferentMediaUrl = () => {
    //* This is to compare the mediaUrl with Media Folder link when editing in the input area.
    //* Because mediaUrl is a differnt object, but the link should be the same as Media Folder's link.
    if (userProfile.mediaUrl !== mediaFolderLink.Link && userProfile.mediaUrl !== '') {
      setMediaFolderDiffWarning(true);
    } else {
      setMediaFolderDiffWarning(false);
    }
  };

  const isDuplicateLink = (links, newLink) => {
    // ! return true if there is a duplicate link, which is invalid
    if (newLink.Name === '' || newLink.Link === '') return true;
    else {
      const name = newLink.Name.trim().toLowerCase();
      const nameSet = new Set();
      links.forEach(link => {
        nameSet.add(link.Name.trim().toLowerCase());
      });
      return nameSet.has(name);
    }
  };

  // Checks edited rows before saving, since plus-button validation does not cover existing links.
  const hasDuplicateEditedLinks = (links, includeReservedNames = false) => {
    const names = new Set();
    const urls = new Set();
    const linksToCheck = includeReservedNames ? [googleLink, mediaFolderLink, ...links] : links;

    return linksToCheck.some(link => {
      const name = link.Name.trim().toLowerCase();
      const url = link.Link.trim().toLowerCase();

      if ((name && names.has(name)) || (url && urls.has(url))) return true;

      if (name) names.add(name);
      if (url) urls.add(url);
      return false;
    });
  };

  const isValidUrl = url => {
    try {
      const pattern = /^(?:https?:\/\/)?[\w.-]+\.[a-zA-Z]{2,}(?:\/\S*)?$/;
      return pattern.test(url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      return false;
    }
  };

  const handleUpdate = async () => {
    // Validate the Google Doc and Media Folder links
    const isGoogleDocsValid = googleLink.Link === '' || isValidGoogleDocsUrl(googleLink.Link);
    const isMediaFolderValid = mediaFolderLink.Link === '' || isValidMediaUrl(mediaFolderLink.Link);
    const hasDuplicateLinks =
      hasDuplicateEditedLinks(adminLinks, true) || hasDuplicateEditedLinks(personalLinks);

    // Stop update when an edited existing link duplicates another visible link.
    if (hasDuplicateLinks) {
      setDuplicateNameError(true);
      setIsValidLink(true);
    } else if (isGoogleDocsValid && isMediaFolderValid) {
      const linksToUpdate = [googleLink, mediaFolderLink, ...adminLinks];
      await updateLink(personalLinks, linksToUpdate, mediaFolderLink.Link);
      handleSubmit();
      setIsValidLink(true);
      setDuplicateNameError(false);
      setIsChanged(false);
      closeModal();
      toast.success('Link added successfully');
    } else {
      setIsValidLink(false);
    }
  };

  useEffect(() => {
    isDifferentMediaUrl();
  }, [mediaFolderLink.Link, userProfile.mediaUrl]);

  useEffect(() => {
    if (isOpen) {
      resetDraftFromSavedProfile();
    }
  }, [isOpen, userProfile.adminLinks, userProfile.personalLinks]);

  return (
    <React.Fragment>
      <Modal
        isOpen={isOpen}
        toggle={handleCloseWithoutUpdate}
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader
          className={darkMode ? 'bg-space-cadet text-white' : ''}
          toggle={handleCloseWithoutUpdate}
        >
          <span className="modal-title">Edit Links</span>
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <div>
            {canManageAdminLinks && (
              <CardBody>
                <Card style={{ padding: '16px' }} className={darkMode ? 'bg-yinmn-blue' : ''}>
                  <Label
                    style={{ display: 'flex', margin: '5px' }}
                    className={darkMode ? styles['modal-label-dark'] : ''}
                  >
                    Admin Links:
                  </Label>
                  {mediaFolderDiffWarning && (
                    <span
                      className={`${styles['warning-help-context']}`}
                      data-testid="diff-media-url-warning"
                    >
                      <strong>Media Folder link must be a working DropBox link</strong>
                      <p>
                        Current Media URL: <a href={userProfile.mediaUrl}>{userProfile.mediaUrl}</a>
                      </p>
                    </span>
                  )}
                  <div>

                    <div
                      style={{ display: 'flex', margin: '5px' }}
                      className={`${styles['link-fields']}`}
                    >
                      <label
                        className={`${styles['custom-label']} ${darkMode ? styles['modal-label-dark'] : ''}`}
                        htmlFor="google-doc-link"
                      >
                        Google Doc
                      </label>

                      <input
                        id="google-doc-link"
                        className={styles.customEdit}
                        placeholder="Enter Google Doc link"
                        value={googleLink.Link}
                        onChange={e => {
                          setGoogleLink({ ...googleLink, Link: e.target.value.trim() });
                          setIsChanged(true);
                        }}
                      />
                    </div>

                    <div
                      style={{ display: 'flex', margin: '5px' }}
                      className={`${styles['link-fields']}`}
                    >
                       <label
                          className={`${styles['custom-label']} ${
                            darkMode ? styles['modal-label-dark'] : ''
                          }`}
                          htmlFor="media-folder-link"
                        >
                        Media Folder
                      </label>

                      <input
                        className={styles.customEdit}
                        id="media-folder-link"
                        placeholder="Enter Dropbox link"
                        value={mediaFolderLink.Link}
                        onChange={e => {
                          handleMediaFolderLinkChanges(e);
                        }}
                      />
                    </div>
                    {adminLinks?.map((link, index) => {
                      return (
                        <div
                          key={index}
                          style={{ display: 'flex', margin: '5px' }}
                          className={`${styles['link-fields']}`}
                        >
                          <input
                            className={styles.customInput}
                            value={link.Name}
                            onChange={e => handleNameChanges(e, adminLinks, index, setAdminLinks)}
                            placeholder="Link Name"
                          />
                          <input
                            className={styles.customInput}
                            value={link.Link}
                            onChange={e => handleLinkChanges(e, adminLinks, index, setAdminLinks)}
                            placeholder="Link URL"
                          />
                          <button
                            type="button"
                            className={styles.closeButton}
                            color="danger"
                            onClick={() =>
                              removeLink(adminLinks, setAdminLinks, {
                                name: link.Name,
                                link: link.Link,
                              })
                            }
                          >
                            x
                          </button>
                        </div>
                      );
                    })}
                    <div style={{ display: 'flex', margin: '5px' }}>
                      <div className={styles.customTitle}>+ ADD LINK:</div>
                    </div>

                    <div
                      style={{ display: 'flex', margin: '5px' }}
                      className={`${styles['link-fields']} new-admin-links`}
                    >
                      <input
                        className={styles.customEdit}
                        id="linkName"
                        placeholder="enter name"
                        value={newAdminLink.Name}
                        onChange={e => {
                          const { value } = e.target;
                          setNewAdminLink(prev => ({ ...prev, Name: value }));
                          setDuplicateNameError(false);
                        }}
                      />
                      <input
                        className={styles.customEdit}
                        id="linkURL"
                        placeholder="enter link"
                        value={newAdminLink.Link}
                        onChange={e => {
                          const { value } = e.target;
                          setNewAdminLink(prev => ({ ...prev, Link: value }));
                        }}
                      />

                      <button
                        type="button"
                        className={styles.addButton}
                        aria-label="add-admin-link-button"
                        onClick={() => {
                          addNewLink(adminLinks, setAdminLinks, newAdminLink, () =>
                            setNewAdminLink(emptyLink),
                          );
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </Card>
              </CardBody>
            )}
            <CardBody>
              <Card style={{ padding: '16px' }} className={darkMode ? 'bg-yinmn-blue' : ''}>

                <Label
                    style={{ display: 'flex', margin: '5px' }}
                    className={darkMode ? styles['modal-label-dark'] : ''}
                  >
                    Personal Links:
                  </Label>

                <div>
                  {personalLinks.map((link, index) => (
                    <div
                      key={index}
                      style={{ display: 'flex', margin: '5px' }}
                      className={`${styles['link-fields']}`}
                    >
                      <input
                        className={styles.customInput}
                        value={link.Name}
                        onChange={e => handleNameChanges(e, personalLinks, index, setPersonalLinks)}
                      />
                      <input
                        className={styles.customInput}
                        value={link.Link}
                        onChange={e => handleLinkChanges(e, personalLinks, index, setPersonalLinks)}
                      />
                      <button
                        type="button"
                        className={styles.closeButton}
                        color="danger"
                        aria-label="add-personal-link-button"
                        onClick={() =>
                          removeLink(personalLinks, setPersonalLinks, {
                            name: link.Name,
                            link: link.Link,
                          })
                        }
                      >
                        x
                      </button>
                    </div>
                  ))}

                  <div style={{ display: 'flex', margin: '5px' }}>
                    <div className={styles.customTitle}>+ ADD LINK:</div>
                  </div>

                  <div
                    style={{ display: 'flex', margin: '5px' }}
                    className={`${styles['link-fields']}`}
                  >
                    <input
                      className={`${styles['customEdit']} me-3`}
                      placeholder="enter name"
                      value={newPersonalLink.Name}
                      onChange={e => {
                        const { value } = e.target;
                        setNewPersonalLink(prev => ({ ...prev, Name: value }));
                        setIsChanged(true);
                        setDuplicateNameError(false);
                      }}
                    />
                    <input
                      className={styles.customEdit}
                      placeholder="enter link"
                      value={newPersonalLink.Link}
                      onChange={e => {
                        const { value } = e.target;
                        setNewPersonalLink(prev => ({ ...prev, Link: value }));
                        setIsChanged(true);
                      }}
                    />
                    <button
                      type="button"
                      className={styles.addButton}
                      onClick={() => {
                        addNewLink(personalLinks, setPersonalLinks, newPersonalLink, () =>
                          setNewPersonalLink(emptyLink),
                        );
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </Card>

              {(!isValidLink || duplicateNameError) && (
                <div className={`${styles['invalid-help-context']}`}>
                  {!isValidLink && (
                    <p
                      className={styles['invalid-help-context']}
                      data-testid='invalid-url-warning'
                    >
                      Please enter valid URLs for each link.
                    </p>
                  )}
                  {duplicateNameError && (
                    <p data-testid='duplicate-name-warning'
                      className={styles['invalid-help-context']}
                      >
                      This link name or URL already exists.
                    </p>
                  )}
                </div>
              )}

            </CardBody>
          </div>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button
            color="info"
            disabled={!isChanged}
            onClick={() => {
              handleUpdate();
            }}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Update
          </Button>
          <Button
            color="primary"
            onClick={handleCloseWithoutUpdate}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Cancel
          </Button>
        </ModalFooter>

        <Modal
          data-testid="popup-warning"
          isOpen={isWarningPopupOpen}
          toggle={() => setIsWarningPopupOpen(!isWarningPopupOpen)}
          className={darkMode ? 'text-light dark-mode' : ''}
        >
          <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>Warning!</ModalHeader>
          <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
            Whoa Tiger, don’t do this! This link was added by an Admin when you were set up in the
            system. It is used by the Admin Team and your Manager(s) for reviewing your work. You
            should only change it if you are ABSOLUTELY SURE the one you are changing it to is more
            correct than the one here already.
          </ModalBody>
          <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
            <Button
              color="primary"
              onClick={() => {
                setIsWarningPopupOpen(!isWarningPopupOpen);
              }}
            >
              Confirm
            </Button>
            {/* Cancel button put original Media Folder link into the input */}
            <Button
              onClick={() => {
                setIsWarningPopupOpen(!isWarningPopupOpen);
                setIsMediaFolderLinkChanged(false);
                setMediaFolderLink({ ...mediaFolderLink, Link: originalMediaFolderLink.current });
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </Modal>
    </React.Fragment>
  );
};

EditLinkModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  updateLink: PropTypes.func.isRequired,
  userProfile: PropTypes.object.isRequired,
};

export default connect(null, { hasPermission })(EditLinkModal);
