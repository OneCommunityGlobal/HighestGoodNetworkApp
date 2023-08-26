import React, { useState, useReducer } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  CardBody,
  Card,
  Col,
} from 'reactstrap';
import PropTypes from 'prop-types';
import hasPermission from '../../../utils/permissions';
import styles from './EditLinkModal.css';
import { boxStyle } from 'styles';
import { connect } from 'react-redux';

const EditLinkModal = props => {
  const { isOpen, closeModal, updateLink, userProfile } = props;

  const canPutUserProfileImportantInfo = props.hasPermission('putUserProfileImportantInfo');

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

  const [isChanged, setIsChanged] = useState(false);
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

  const addNewLink = (links, setLinks, newLink, clearInput) => {
    if (isDuplicateLink([googleLink,mediaFolderLink,...links], newLink) || !isValidUrl(newLink.Link)) {
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
    const updatable =
      (isValidUrl(googleLink.Link) && isValidUrl(mediaFolderLink.Link)) ||
      (googleLink.Link === '' && mediaFolderLink.Link === '') ||
      (isValidUrl(googleLink.Link) && mediaFolderLink.Link === '') ||
      (isValidUrl(mediaFolderLink.Link) && googleLink.Link === '');
    if (updatable) {
      // * here the 'adminLinks' should be the total of 'googleLink' and 'adminLink'
      // Media Folder link should update the mediaUrl in userProfile
      if (mediaFolderLink.Link){
        await updateLink(personalLinks, [googleLink, mediaFolderLink, ...adminLinks],mediaFolderLink.Link);
      } else {
        await updateLink(personalLinks, [googleLink, mediaFolderLink, ...adminLinks]);
      }
      setIsValidLink(true);
      setIsChanged(true);
      closeModal();
    } else {
      setIsValidLink(false);
    }
  };

  return (
    <React.Fragment>
      <Modal isOpen={isOpen} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>Edit Links</ModalHeader>
        <ModalBody>
          <div>
            {canPutUserProfileImportantInfo && (
              <CardBody>
                <Card style={{ padding: '16px' }}>
                  <Label style={{ display: 'flex', margin: '5px' }}>Admin Links:</Label>
                  <div>
                    <div style={{ display: 'flex', margin: '5px' }} className="link-fields">
                      <input
                        className="customEdit"
                        id="linkName1"
                        placeholder="Google Doc"
                        value="Google Doc"
                        disabled
                      />

                      <input
                        className="customEdit"
                        id="linkURL1"
                        placeholder="Enter Google Doc link"
                        value={googleLink.Link}
                        onChange={e => {
                          setGoogleLink({ ...googleLink, Link: e.target.value.trim() });
                          setIsChanged(true);
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', margin: '5px' }} className="link-fields">
                      <input
                        className="customEdit"
                        id="linkName2"
                        placeholder="Media Folder"
                        value="Media Folder"
                        disabled
                      />

                      <input
                        className="customEdit"
                        id="linkURL2"
                        placeholder="Enter Dropbox link"
                        value={mediaFolderLink.Link}
                        onChange={e => {
                          setMediaFolderLink({ ...mediaFolderLink, Link: e.target.value.trim() });
                          setIsChanged(true);
                        }}
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
                            X
                          </button>
                        </div>
                      );
                    })}
                    <div style={{ display: 'flex', margin: '5px' }}>
                      <div className="customTitle">+ ADD LINK:</div>
                    </div>

                    <div style={{ display: 'flex', margin: '5px' }} className="link-fields">
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
                        onClick={() =>
                          removeLink(personalLinks, setPersonalLinks, {
                            name: link.Name,
                            link: link.Link,
                          })
                        }
                      >
                        X
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
                <p className="invalid-help-context">
                  Please ensure each link has a unique and not empty, and enter valid URLs.
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
          <Button color="primary" onClick={closeModal} style={boxStyle}>
            Cancel
          </Button>
        </ModalFooter>
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
