import React, { useState, useReducer } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  FormGroup,
  CardBody,
  Card,
  Col,
} from 'reactstrap';
import { boxStyle } from 'styles';
import hasPermission from 'utils/permissions';
import { connect } from 'react-redux';

const UserProfileModal = props => {
  const {
    isOpen,
    closeModal,
    updateLink,
    modifyBlueSquares,
    modalTitle,
    modalMessage,
    type,
    userProfile,
    id,
  } = props;
  let blueSquare = [
    {
      date: 'ERROR',
      description:
        'This is auto generated text. You must save the document first before viewing newly created blue squares.',
    },
  ];

  if (type === 'modBlueSquare' || type === 'viewBlueSquare') {
    if (id.length > 0) {
      blueSquare = userProfile.infringements?.filter(blueSquare => blueSquare._id === id);
    }
  }

  const canPutUserProfile = props.hasPermission('putUserProfile');
  const canEditAdminLinks = props.hasPermission('manageAdminLinks');

  const [linkName, setLinkName] = useState('');
  const [linkURL, setLinkURL] = useState('');

  const [adminLinkName, setAdminLinkName] = useState('');
  const [adminLinkURL, setAdminLinkURL] = useState('');

  const [dateStamp, setDateStamp] = useState(blueSquare[0]?.date || '');
  const [summary, setSummary] = useState(blueSquare[0]?.description || '');

  const [addButton, setAddButton] = useState(true);
  const [summaryFieldView, setSummaryFieldView] = useState(true);

  const [personalLinks, dispatchPersonalLinks] = useReducer(
    (personalLinks, { type, value, passedIndex }) => {
      switch (type) {
        case 'add':
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
      switch (type) {
        case 'add':
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

  const handleChange = event => {
    event.preventDefault();

    if (event.target.id === 'linkName') {
      setLinkName(event.target.value.trim());
    } else if (event.target.id === 'linkURL') {
      setLinkURL(event.target.value.trim());
    } else if (event.target.id === 'summary') {
      setSummary(event.target.value);
      checkFields(dateStamp, summary);
    } else if (event.target.id === 'date') {
      setDateStamp(event.target.value);
      setSummaryFieldView(false);
      checkFields(dateStamp, summary);
    }
  };

  function checkFields(field1, field2) {
    console.log('f1:', field1, ' f2:', field2);

    if (field1 != null && field2 != null) {
      setAddButton(false);
    } else {
      setAddButton(true);
    }
  }

  return (
    <Modal isOpen={isOpen} toggle={closeModal}>
      <ModalHeader toggle={closeModal}>{modalTitle}</ModalHeader>
      <ModalBody>
        {type === 'updateLink' && (
          <div>
            {(canPutUserProfile || canEditAdminLinks) && (
              <CardBody>
                <Card>
                  <Label style={{ display: 'flex', margin: '5px' }}>Admin Links:</Label>
                  <Col>
                    <div style={{ display: 'flex', margin: '5px' }}>
                      <div className="customTitle">Name</div>
                      <div className="customTitle">Link URL</div>
                    </div>
                    {adminLinks.map((link, index) => (
                      <div key={index} style={{ display: 'flex', margin: '5px' }}>
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

                    <div style={{ display: 'flex', margin: '5px' }}>
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
                  </Col>
                </Card>
              </CardBody>
            )}
            <CardBody>
              <Card>
                <Label style={{ display: 'flex', margin: '5px' }}>Personal Links:</Label>
                <Col>
                  <div style={{ display: 'flex', margin: '5px' }}>
                    <div className="customTitle">Name</div>
                    <div className="customTitle">Link URL</div>
                  </div>
                  {personalLinks.map((link, index) => (
                    <div key={index} style={{ display: 'flex', margin: '5px' }}>
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

                  <div style={{ display: 'flex', margin: '5px' }}>
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
                </Col>
              </Card>
            </CardBody>
          </div>
        )}

        {type === 'addBlueSquare' && (
          <>
            <FormGroup>
              <Label for="date">Date</Label>
              <Input type="date" name="date" id="date" onChange={handleChange} />
            </FormGroup>

            <FormGroup hidden={summaryFieldView}>
              <Label for="report">Summary</Label>
              <Input type="textarea" id="summary" onChange={handleChange} />
            </FormGroup>
          </>
        )}

        {type === 'modBlueSquare' && (
          <>
            <FormGroup>
              <Label for="date">Date</Label>
              <Input type="date" onChange={e => setDateStamp(e.target.value)} value={dateStamp} />
            </FormGroup>
            <FormGroup>
              <Label for="createdDate">
                Created Date:
                {blueSquare[0]?.createdDate}
              </Label>
            </FormGroup>
            <FormGroup>
              <Label for="report">Summary</Label>
              <Input type="textarea" onChange={e => setSummary(e.target.value)} value={summary} />
            </FormGroup>
          </>
        )}

        {type === 'viewBlueSquare' && (
          <>
            <FormGroup>
              <Label for="date">
                Date:
                {blueSquare[0]?.date}
              </Label>
            </FormGroup>
            <FormGroup>
              <Label for="createdDate">
                Created Date:
                {blueSquare[0]?.createdDate}
              </Label>
            </FormGroup>
            <FormGroup>
              <Label for="description">Summary</Label>
              <Label>{blueSquare[0]?.description}</Label>
            </FormGroup>
          </>
        )}

        {type === 'save' && modalMessage}

        {type === 'message' && modalMessage}

        {type === 'image' && modalMessage}
      </ModalBody>

      <ModalFooter>
        {type === 'addBlueSquare' && (
          <Button
            color="danger"
            id="addBlueSquare"
            disabled={addButton}
            onClick={() => {
              modifyBlueSquares('', dateStamp, summary, 'add');
            }}
            style={boxStyle}
          >
            Submit
          </Button>
        )}

        {type === 'modBlueSquare' && (
          <>
            <Button
              color="info"
              onClick={() => {
                modifyBlueSquares(id, dateStamp, summary, 'update');
              }}
              style={boxStyle}
            >
              Update
            </Button>
            <Button
              color="danger"
              onClick={() => {
                modifyBlueSquares(id, dateStamp, summary, 'delete');
              }}
              style={boxStyle}
            >
              Delete
            </Button>
          </>
        )}

        {type === 'updateLink' && (
          <Button
            color="info"
            onClick={() => {
              updateLink(personalLinks, adminLinks);
            }}
          >
            Update
          </Button>
        )}

        {type === 'image' && (
          <>
            <Button color="primary" onClick={closeModal} style={boxStyle}>
              {' '}
              Close{' '}
            </Button>
            <Button
              color="info"
              onClick={() => {
                window.open('https://picresize.com/');
              }}
              style={boxStyle}
            >
              {' '}
              Resize{' '}
            </Button>
          </>
        )}

        {type === 'save' ? (
          <Button color="primary" onClick={closeModal} style={boxStyle}>
            Close
          </Button>
        ) : (
          <Button color="primary" onClick={closeModal} style={boxStyle}>
            Cancel
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default connect(null, { hasPermission })(UserProfileModal);
