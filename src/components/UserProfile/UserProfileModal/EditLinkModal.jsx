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
import './EditLinkModal.css';
import { boxStyle } from 'styles';
import { connect } from 'react-redux';
import { isValidGoogleDocsUrl, isValidMediaUrl } from 'utils/checkValidURL';
import { permissions } from 'utils/constants';

const EditLinkModal = props => {
  const { isOpen, closeModal, updateLink, userProfile, handleSubmit } = props;

  const canManageAdminLinks = props.hasPermission(permissions.userManagement.manageAdminLinks);
  const canPutUserProfileImportantInfo = props.hasPermission(permissions.userManagement.putUserProfileImportantInfo);

  const initialAdminLinkState = [
    { Name: 'Google Doc', Link: '' },
    { Name: 'Media Folder', Link: '' },
  ];
  const emptyLink = { Name: '', Link: '' };

  const [newAdminLink, setNewAdminLink] = useState(emptyLink);
  const [newPersonalLink, setNewPersonalLink] = useState(emptyLink);

  const [googleLink, setGoogleLink] = useState(
    userProfile.adminLinks.find(link => link.Name === 'Google Doc')
      ? userProfile.adminLinks.find(link => link.Name === 'Google Doc')
      : initialAdminLinkState[0],
  );
  const [mediaFolderLink, setMediaFolderLink] = useState(
    userProfile.adminLinks.find(link => link.Name === 'Media Folder')
      ? userProfile.adminLinks.find(link => link.Name === 'Media Folder')
      : initialAdminLinkState[1],
  );
  const [adminLinks, setAdminLinks] = useState(
    userProfile.adminLinks
      ? userProfile.adminLinks
        .filter(link => link.Name !== 'Google Doc')
        .filter(link => link.Name !== 'Media Folder')
      : [],
  );
  const [personalLinks, setPersonalLinks] = useState(
    userProfile.personalLinks ? userProfile.personalLinks : [],
  );
  const originalMediaFolderLink = useRef(mediaFolderLink.Link);

  const [isChanged, setIsChanged] = useState(false);
  const [mediaFolderDiffWarning, setMediaFolderDiffWarning] = useState(false);
  const [isWarningPopupOpen, setIsWarningPopupOpen] = useState(false);
  const [isMediaFolderLinkChanged, setIsMediaFolderLinkChanged] = useState(false);
  const [isValidLink, setIsValidLink] = useState(true);

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

  const handleMediaFolderLinkChanges = (e) => {
    if (!mediaFolderLink.Link) {
      // Prevent warning popup appear if empty media folder link
      setIsMediaFolderLinkChanged(true);
      setMediaFolderLink({ ...mediaFolderLink, Link: e.target.value.trim() });
      setIsChanged(true);
    }
    else {
      setMediaFolderLink({ ...mediaFolderLink, Link: e.target.value.trim() });
      setIsChanged(true);
      if (!isMediaFolderLinkChanged && !isWarningPopupOpen) { // First time media folder link is changed
        setIsMediaFolderLinkChanged(true);
        setIsWarningPopupOpen(true);
      }
    }
  }

  const addNewLink = (links, setLinks, newLink, clearInput) => {
    if (
      isDuplicateLink([googleLink, mediaFolderLink, ...links], newLink) ||
      !isValidUrl(newLink.Link)
    ) {
      setIsValidLink(false);
    } else {
      const newLinks = [...links, { Name: newLink.Name, Link: newLink.Link }];
      setLinks(newLinks);
      setIsChanged(true);
      setIsValidLink(true);
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

  const isValidUrl = url => {
    try {
      const pattern = /^(?:https?:\/\/)?[\w.-]+\.[a-zA-Z]{2,}(?:\/\S*)?$/;
      return pattern.test(url);
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const handleUpdate = async () => {
    // Validate the Google Doc and Media Folder links
    const isGoogleDocsValid = googleLink.Link === '' || isValidGoogleDocsUrl(googleLink.Link);
    const isMediaFolderValid = mediaFolderLink.Link === '' || isValidMediaUrl(mediaFolderLink.Link);

    if (isGoogleDocsValid && isMediaFolderValid) {
      const linksToUpdate = [googleLink, mediaFolderLink, ...adminLinks];
      await updateLink(personalLinks, linksToUpdate, mediaFolderLink.Link);
      handleSubmit();
      setIsValidLink(true);
      setIsChanged(false);
      closeModal();
    } else {
      setIsValidLink(false);
    }
  };


  useEffect(() => {
    isDifferentMediaUrl();
  }, [mediaFolderLink.Link, userProfile.mediaUrl]);

  return (
    <React.Fragment>
      <Modal isOpen={isOpen} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>Edit Links</ModalHeader>
        <ModalBody>
          <div>
            {canManageAdminLinks && (
              <CardBody>
                <Card style={{ padding: '16px' }}>
                  <Label style={{ display: 'flex', margin: '5px' }}>Admin Links:</Label>
                  {mediaFolderDiffWarning && (
                    <span className="warning-help-context" data-testid="diff-media-url-warning" >
                      <strong>Media Folder link must be a working DropBox link</strong>
                      <p>
                        Current Media URL: <a href={userProfile.mediaUrl}>{userProfile.mediaUrl}</a>
                      </p>
                    </span>
                  )}
                  <div>
                    <div style={{ display: 'flex', margin: '5px' }} className="link-fields">
                      <label className='custom-label' htmlFor='google-doc-link' >Google Doc</label>
                      <input
                        id='google-doc-link'
                        className="customEdit"
                        placeholder="Enter Google Doc link"
                        value={googleLink.Link}
                        onChange={e => {
                          setGoogleLink({ ...googleLink, Link: e.target.value.trim() });
                          setIsChanged(true);
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', margin: '5px' }} className="link-fields">

                      <label className='custom-label' htmlFor='media-folder-link' >Media Folder</label>
                      <input
                        className="customEdit"
                        id="media-folder-link"
                        placeholder="Enter Dropbox link"
                        value={mediaFolderLink.Link}
                        onChange={e => { handleMediaFolderLinkChanges(e) }}
                      />
                    </div>
                    {adminLinks?.map((link, index) => {
                      return (
                        <div
                          key={index}
                          style={{ display: 'flex', margin: '5px' }}
                          className="link-fields"
                        >
                          <input
                            className="customInput"
                            value={link.Name}
                            onChange={e => handleNameChanges(e, adminLinks, index, setAdminLinks)}
                            placeholder="Link Name"
                          />
                          <input
                            className="customInput"
                            value={link.Link}
                            onChange={e => handleLinkChanges(e, adminLinks, index, setAdminLinks)}
                            placeholder="Link URL"
                          />
                          <button
                            type="button"
                            className="closeButton"
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
                      <div className="customTitle">+ ADD LINK:</div>
                    </div>

                    <div style={{ display: 'flex', margin: '5px' }} className="link-fields new-admin-links">
                      <input
                        className="customEdit"
                        id="linkName"
                        placeholder="enter name"
                        value={newAdminLink.Name}
                        onChange={e => {
                          const { value } = e.target;
                          setNewAdminLink(prev => ({ ...prev, Name: value }));
                        }}
                      />
                      <input
                        className="customEdit"
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
                        className="addButton"
                        aria-label='add-admin-link-button'
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
              <Card style={{ padding: '16px' }}>
                <Label style={{ display: 'flex', margin: '5px' }}>Personal Links:</Label>
                <div>
                  {personalLinks.map((link, index) => (
                    <div
                      key={index}
                      style={{ display: 'flex', margin: '5px' }}
                      className="link-fields"
                    >
                      <input
                        className="customInput"
                        value={link.Name}
                        onChange={e => handleNameChanges(e, personalLinks, index, setPersonalLinks)}
                      />
                      <input
                        className="customInput"
                        value={link.Link}
                        onChange={e => handleLinkChanges(e, personalLinks, index, setPersonalLinks)}
                      />
                      <button
                        type="button"
                        className="closeButton"
                        color="danger"
                        aria-label='add-personal-link-button'
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
                    <div className="customTitle">+ ADD LINK:</div>
                  </div>

                  <div style={{ display: 'flex', margin: '5px' }} className="link-fields">
                    <input
                      className="customEdit me-3"
                      placeholder="enter name"
                      value={newPersonalLink.Name}
                      onChange={e => {
                        const { value } = e.target;
                        setNewPersonalLink(prev => ({ ...prev, Name: value }));
                        setIsChanged(true);
                      }}
                    />
                    <input
                      className="customEdit"
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
                      className="addButton"
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
              {!isValidLink && (
                <p className='invalid-help-context' data-testid='invalid-url-warning' >
                  Please enter valid URLs for each link.
                </p>
              )}
            </CardBody>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="info"
            disabled={!isChanged}
            onClick={() => {
              handleUpdate();
            }}
            style={boxStyle}
          >
            Update
          </Button>
          <Button
            color="primary"
            onClick={() => {
              setIsMediaFolderLinkChanged(false);
              setMediaFolderLink({ ...mediaFolderLink, Link: originalMediaFolderLink.current });
              closeModal();
            }
            }
            style={boxStyle}>
            Cancel
          </Button>
        </ModalFooter>

        <Modal data-testid='popup-warning' isOpen={isWarningPopupOpen} toggle={() => setIsWarningPopupOpen(!isWarningPopupOpen)}  >
          <ModalHeader>Warning!</ModalHeader>
          <ModalBody>
            Whoa Tiger, don’t do this! This link was added by an Admin when you were set up in the system. It is used by the Admin Team and your Manager(s) for reviewing your work. You should only change it if you are ABSOLUTELY SURE the one you are changing it to is more correct than the one here already.
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onClick={() => { setIsWarningPopupOpen(!isWarningPopupOpen) }}>Confirm</Button>
            {/* Cancel button put original Media Folder link into the input */}
            <Button onClick={() => {
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
