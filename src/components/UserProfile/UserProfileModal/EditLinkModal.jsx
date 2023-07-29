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
import { useSelector } from 'react-redux';
import styles from './EditLinkModal.css';
import { boxStyle } from 'styles';

const EditLinkModal = props => {
  const { isOpen, closeModal, updateLink, userProfile, setChanged, role } = props;
  const { roles } = useSelector(state => state.role);
  const userPermissions = useSelector(state => state.auth.user?.permissions?.frontPermissions);
  const [linkName, setLinkName] = useState('');
  const [linkURL, setLinkURL] = useState('');

  const [adminLinkName, setAdminLinkName] = useState('');
  const [adminLinkURL, setAdminLinkURL] = useState('');

  const [personalLinks, dispatchPersonalLinks] = useReducer(
    (personalLinks, { type, value, passedIndex }) => {
      setChanged(true);
      switch (type) {
        case 'add':
          setLinkName('');
          setLinkURL('');
          return [...personalLinks, value];
        case 'remove':
          return personalLinks.filter((_, index) => index !== passedIndex);
        case 'updateName':
          return personalLinks.filter((_, index) => {
            if (index === passedIndex) {
              _.Name = value;
            }
            return _;
          });
        case 'updateLink':
          return personalLinks.filter((_, index) => {
            if (index === passedIndex) {
              _.Link = value;
            }
            return _;
          });
        default:
          return personalLinks;
      }
    },
    userProfile.personalLinks,
  );

  const [adminLinks, dispatchAdminLinks] = useReducer(
    (adminLinks, { type, value, passedIndex }) => {
      setChanged(true);
      switch (type) {
        case 'add':
          setAdminLinkName('');
          setAdminLinkURL('');
          return [...adminLinks, value];
        case 'remove':
          return adminLinks.filter((_, index) => index !== passedIndex);
        case 'updateName':
          return adminLinks.filter((_, index) => {
            if (index === passedIndex) {
              _.Name = value;
            }
            return _;
          });
        case 'updateLink':
          return adminLinks.filter((_, index) => {
            if (index === passedIndex) {
              _.Link = value;
            }
            return _;
          });
        default:
          return adminLinks;
      }
    },
    userProfile.adminLinks,
  );

  return (
    <React.Fragment>
      <Modal isOpen={isOpen} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>Edit Links</ModalHeader>
        <ModalBody>
          <div>
            {hasPermission(role, 'adminLinks', roles, userPermissions) && (
              <CardBody>
                <Card style={{ padding: '16px' }}>
                  <Label style={{ display: 'flex', margin: '5px' }}>Admin Links:</Label>
                  <div>
                    <div style={{ display: 'flex', margin: '5px' }}>
                      <div className="customTitle">Name</div>
                      <div className="customTitle">Link URL</div>
                    </div>
                    {adminLinks?.map((link, index) => (
                      <div
                        key={index}
                        style={{ display: 'flex', margin: '5px' }}
                        className="link-fields"
                      >
                        <input
                          className="customInput"
                          value={link.Name}
                          onChange={e =>
                            dispatchAdminLinks({
                              type: 'updateName',
                              value: e.target.value,
                              passedIndex: index,
                            })
                          }
                        />
                        <input
                          className="customInput"
                          value={link.Link}
                          onChange={e =>
                            dispatchAdminLinks({
                              type: 'updateLink',
                              value: e.target.value,
                              passedIndex: index,
                            })
                          }
                        />
                        <button
                          type="button"
                          className="closeButton"
                          color="danger"
                          onClick={() => dispatchAdminLinks({ type: 'remove', passedIndex: index })}
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
                        className="customEdit"
                        id="linkName"
                        placeholder="enter name"
                        onChange={e => setAdminLinkName(e.target.value)}
                      />
                      <input
                        className="customEdit"
                        id="linkURL"
                        placeholder="enter link"
                        onChange={e => setAdminLinkURL(e.target.value.trim())}
                      />
                      <button
                        type="button"
                        className="addButton"
                        onClick={() =>
                          dispatchAdminLinks({
                            type: 'add',
                            value: { Name: adminLinkName, Link: adminLinkURL },
                          })
                        }
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
                  <div style={{ display: 'flex', margin: '5px' }}>
                    <div className="customTitle">Name</div>
                    <div className="customTitle">Link URL</div>
                  </div>
                  {personalLinks.map((link, index) => (
                    <div
                      key={index}
                      style={{ display: 'flex', margin: '5px' }}
                      className="link-fields"
                    >
                      <input
                        className="customInput"
                        value={link.Name}
                        onChange={e =>
                          dispatchPersonalLinks({
                            type: 'updateName',
                            value: e.target.value,
                            passedIndex: index,
                          })
                        }
                      />
                      <input
                        className="customInput"
                        value={link.Link}
                        onChange={e =>
                          dispatchPersonalLinks({
                            type: 'updateLink',
                            value: e.target.value,
                            passedIndex: index,
                          })
                        }
                      />
                      <button
                        type="button"
                        className="closeButton"
                        color="danger"
                        onClick={() =>
                          dispatchPersonalLinks({ type: 'remove', passedIndex: index })
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
                      className="customEdit"
                      id="linkName"
                      placeholder="enter name"
                      onChange={e => setLinkName(e.target.value)}
                    />
                    <input
                      className="customEdit"
                      id="linkURL"
                      placeholder="enter link"
                      onChange={e => setLinkURL(e.target.value.trim())}
                    />
                    <button
                      type="button"
                      className="addButton"
                      onClick={() =>
                        dispatchPersonalLinks({
                          type: 'add',
                          value: { Name: linkName, Link: linkURL },
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </Card>
            </CardBody>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="info"
            onClick={() => {
              updateLink(personalLinks, adminLinks);
              closeModal();
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

export default EditLinkModal;
