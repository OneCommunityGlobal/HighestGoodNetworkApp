/* eslint-disable react/function-component-definition */
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
  Spinner,
} from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import '../../Header/DarkMode.css';
import hasPermission from 'utils/permissions';
import { connect, useSelector } from 'react-redux';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import WarningModal from 'components/Warnings/modals/WarningModal';
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
    specialWarnings,
    handleLogWarning,
    handlePostWarnings,
  } = props;
  let blueSquare = [
    {
      date: 'ERROR',
      description:
        'This is auto generated text. You must save the document first before viewing newly created blue squares.',
    },
  ];

  if (type !== 'message' && type !== 'addBlueSquare') {
    if (id.length > 0) {
      blueSquare = userProfile.infringements?.filter(blueSquare => blueSquare._id === id);
    }
  }

  const darkMode = useSelector(state => state.theme.darkMode);

  const canPutUserProfile = props.hasPermission('putUserProfile');
  const canEditInfringements = props.hasPermission('editInfringements');
  const canDeleteInfringements = props.hasPermission('deleteInfringements');

  // const [toggleLogWarning, setToggleLogWarning] = useState(false);
  const [warningType, setWarningType] = useState('');

  const [linkName, setLinkName] = useState('');
  const [linkURL, setLinkURL] = useState('');

  const [adminLinkName, setAdminLinkName] = useState('');
  const [adminLinkURL, setAdminLinkURL] = useState('');

  const [dateStamp, setDateStamp] = useState(blueSquare[0]?.date || '');
  const [summary, setSummary] = useState(blueSquare[0]?.description || '');

  const [addButton, setAddButton] = useState(true);
  const [summaryFieldView, setSummaryFieldView] = useState(true);
  const [displayWarningModal, setDisplayWarningModal] = useState(false);
  const [displayBothModal, setDisplayBothModal] = useState(false);
  const [showWarningSpinner, setShowWarningSpinner] = useState(false);
  const [warningSelections, setWarningSelections] = useState({});
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
      adjustTextareaHeight(event.target);
    } else if (event.target.id === 'date') {
      setDateStamp(event.target.value);
      setSummaryFieldView(false);
      checkFields(dateStamp, summary);
    }
  };

  const handleWarningChange = (warningTitle, warn, color) => {
    setWarningSelections(prevData => {
      return {
        ...prevData,
        [warningTitle]: { warn, color },
      };
    });
  };

  const handleSubmitWarning = () => {
    setShowWarningSpinner(true);
    console.log('warning data', warningSelections);
    handlePostWarnings(warningSelections);
    setShowWarningSpinner(false);
  };
  const handleToggleLogWarning = warningData => {
    console.log('specialWarnings:', specialWarnings);
    if (warningData === 'both') {
      setDisplayBothModal(true);
      setWarningType({
        specialWarnings,
        username: `${userProfile.firstName} ${userProfile.lastName}`,
        warningText: `${specialWarnings[0].title} and ${specialWarnings[1].title}`,
      });
      // setWarningType({...specialWarnings[0], warnings: specialWarnings});
      return;
    }
    setWarningType({
      ...warningData,
      username: `${userProfile.firstName} ${userProfile.lastName}`,
      warningText: warningData.title,
    });

    if (warningData.warnings.length < 2) {
      setDisplayWarningModal(false);
      handleLogNewWarning({ ...warningData, colorAssigned: 'blue' });
      return;
    }
    setDisplayWarningModal(true);
  };
  const handleLogNewWarning = warningData => {
    setShowWarningSpinner(true);
    setWarningType('');
    handleLogWarning(warningData);

    modifyBlueSquares(id, dateStamp, summary, 'delete');
  };
  function checkFields(field1, field2) {
    // console.log('f1:', field1, ' f2:', field2);

    if (field1 != null && field2 != null) {
      setAddButton(false);
    } else {
      setAddButton(true);
    }
  }

  const adjustTextareaHeight = textarea => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const boxStyling = darkMode ? boxStyleDark : boxStyle;
  const fontColor = darkMode ? 'text-light' : '';

  return (
    <>
      {displayBothModal && (
        <WarningModal
          issueBothWarnings={true}
          warning={warningType}
          setToggleModal={() => setDisplayBothModal(false)}
          userProfileHeader={true}
          userProfileModal={true}
          handleIssueWarning={handleLogNewWarning}
          visible={displayBothModal}
          userProfileModal={true}
          handleWarningChange={handleWarningChange}
          handleSubmitWarning={handleSubmitWarning}
        />
      )}
      {displayWarningModal && (
        <WarningModal
          numberOfWarnings={warningType.warnings.length}
          warning={warningType}
          visible={displayWarningModal}
          setToggleModal={() => setDisplayWarningModal(false)}
          handleIssueWarning={handleLogNewWarning}
          userProfileHeader={true}
          userProfileModal={true}
          handleWarningChange={handleWarningChange}
        />
      )}

      <Modal isOpen={isOpen} toggle={closeModal} className={darkMode ? 'text-light dark-mode' : ''}>
        <ModalHeader toggle={closeModal} className={darkMode ? 'bg-space-cadet' : ''}>
          {modalTitle} {showWarningSpinner && <Spinner color="primary" width="300px" />}{' '}
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          {type === 'updateLink' && (
            <div>
              {canPutUserProfile && (
                <CardBody>
                  <Card>
                    <Label className={fontColor} style={{ display: 'flex', margin: '5px' }}>
                      Admin Links:
                    </Label>
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
                            onClick={() =>
                              dispatchAdminLinks({ type: 'remove', passedIndex: index })
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
                  <Label className={fontColor} style={{ display: 'flex', margin: '5px' }}>
                    Personal Links:
                  </Label>
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
                <Label className={fontColor} for="date">
                  Date
                </Label>
                <Input type="date" name="date" id="date" onChange={handleChange} />
              </FormGroup>

              <FormGroup hidden={summaryFieldView}>
                <Label className={fontColor} for="report">
                  Summary
                </Label>
                <Input
                  type="textarea"
                  id="summary"
                  onChange={handleChange}
                  value={summary}
                  style={{ minHeight: '200px', overflow: 'hidden' }}
                  onInput={e => adjustTextareaHeight(e.target)}
                />
              </FormGroup>
            </>
          )}

          {type === 'modBlueSquare' && (
            <>
              <FormGroup>
                <Label className={fontColor} for="date">
                  Date:
                </Label>
                {canEditInfringements ? (
                  <Input
                    type="date"
                    onChange={e => setDateStamp(e.target.value)}
                    value={dateStamp}
                  />
                ) : (
                  <span> {blueSquare[0]?.date}</span>
                )}
              </FormGroup>
              <FormGroup>
                <Label className={fontColor} for="createdDate">
                  Created Date:
                  <span>{blueSquare[0]?.createdDate}</span>
                </Label>
              </FormGroup>
              <FormGroup>
                <Label className={fontColor} for="report">
                  Summary
                </Label>
                {canEditInfringements ? (
                  <Input
                    type="textarea"
                    id="summary"
                    onChange={handleChange}
                    value={summary}
                    style={{ minHeight: '200px', overflow: 'hidden' }} // 4x taller than usual
                    onInput={e => adjustTextareaHeight(e.target)} // auto-adjust height
                  />
                ) : (
                  <p>{blueSquare[0]?.description}</p>
                )}
              </FormGroup>
            </>
          )}

          {type === 'viewBlueSquare' && (
            <>
              <FormGroup>
                <Label className={fontColor} for="date">
                  Date:
                  <span>{blueSquare[0]?.date}</span>
                </Label>
              </FormGroup>
              <FormGroup>
                <Label className={fontColor} for="createdDate">
                  Created Date:
                  <span>{blueSquare[0]?.createdDate}</span>
                </Label>
              </FormGroup>
              <FormGroup>
                <Label className={fontColor} for="description">
                  Summary
                </Label>
                <p className={fontColor}>{blueSquare[0]?.description}</p>
              </FormGroup>
            </>
          )}

          {type === 'save' && modalMessage}

          {type === 'message' && modalMessage}

          {type === 'image' && modalMessage}
        </ModalBody>

        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          {type === 'addBlueSquare' && (
            <Button
              color="danger"
              id="addBlueSquare"
              disabled={addButton}
              onClick={() => {
                modifyBlueSquares('', dateStamp, summary, 'add');
              }}
              style={boxStyling}
            >
              Submit
            </Button>
          )}

          {type === 'modBlueSquare' && (
            <>
              {specialWarnings?.map(warning => (
                <OverlayTrigger
                  key={warning.abbreviation}
                  placement="top"
                  delay={{ show: 100, hide: 100 }}
                  overlay={
                    <Popover id="popover-basic">
                      <Popover.Title as="h4" className="popover__title">
                        <p>Removed Blue Square </p>
                        {warning.abbreviation === 'RBS4NS' ? (
                          <p>for No Summary</p>
                        ) : (
                          <p>for Not Enough Hours Logged</p>
                        )}{' '}
                      </Popover.Title>
                      <Popover.Content>
                        {warning.abbreviation === 'RBS4NS'
                          ? 'Issues a warning if no summary was submitted'
                          : 'Issues a warning if hours were not completed'}
                      </Popover.Content>
                    </Popover>
                  }
                >
                  <Button
                    color="warning"
                    onClick={e => {
                      handleToggleLogWarning(warning);
                    }}
                    name={warning.abbreviation}
                    style={boxStyling}
                  >
                    {warning.abbreviation}
                  </Button>
                </OverlayTrigger>
              ))}
              {
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 100, hide: 100 }}
                  overlay={
                    <Popover id="popover-basic" className="popover__title">
                      <Popover.Title as="h4">
                        Removes Blue Square for both Not Enough Hours and No Summary
                      </Popover.Title>
                      <Popover.Content>
                        Logs both hours and no summary being completed
                      </Popover.Content>
                    </Popover>
                  }
                >
                  <Button
                    color="warning"
                    name="both"
                    onClick={e => {
                      handleToggleLogWarning('both');
                    }}
                    style={boxStyling}
                  >
                    Both
                  </Button>
                </OverlayTrigger>
              }

              {canEditInfringements && (
                <Button
                  color="info"
                  onClick={() => {
                    modifyBlueSquares(id, dateStamp, summary, 'update');
                  }}
                  style={boxStyling}
                >
                  Update
                </Button>
              )}
              {canDeleteInfringements && (
                <Button
                  color="danger"
                  onClick={() => {
                    modifyBlueSquares(id, dateStamp, summary, 'delete');
                  }}
                  style={boxStyling}
                >
                  Delete
                </Button>
              )}
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
              <Button color="primary" onClick={closeModal} style={boxStyling}>
                {' '}
                Close{' '}
              </Button>
              <Button
                color="info"
                onClick={() => {
                  window.open('https://picresize.com/');
                }}
                style={boxStyling}
              >
                {' '}
                Resize{' '}
              </Button>
            </>
          )}

          {type === 'save' ? (
            <Button color="primary" onClick={closeModal} style={boxStyling}>
              Close
            </Button>
          ) : (
            <Button color="primary" onClick={closeModal} style={boxStyling}>
              Cancel
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
};

export default connect(null, { hasPermission })(UserProfileModal);
