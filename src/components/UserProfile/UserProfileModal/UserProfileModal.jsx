/* eslint-disable react/function-component-definition */
import React, { useEffect, useState, useReducer } from 'react';
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
import { boxStyle, boxStyleDark } from '~/styles';
import styles from '../../Header/DarkMode.module.css';
import hasPermission from '~/utils/permissions';
import { connect, useSelector } from 'react-redux';
// carlos: needed for fetching author name
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { formatYYYYMMDDToMMDDYY } from '~/utils/formatDate';
// development: needed for warning system and CC list
import { OverlayTrigger, Popover } from 'react-bootstrap';
import WarningModal from '../../Warnings/modals/WarningModal';
import BlueSquareEmailCCPopup from '../BlueSquareEmailCCPopup';
import CcUserList from './CCUserList';
import PropTypes from 'prop-types';

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
    // carlos: needed to fetch logged-in user's name when adding blue square
    auth,
    // development: needed for warning system
    specialWarnings,
    handleLogWarning,
  } = props;

  let blueSquare = [];

  if (type !== 'message' && type !== 'addBlueSquare') {
    if (id.length > 0) {
      blueSquare = userProfile.infringements?.filter(blueSquare => blueSquare._id === id);
    }
  }

  const darkMode = useSelector(state => state.theme.darkMode);

  const canPutUserProfile = props.hasPermission('putUserProfile');
  const canEditInfringements = props.hasPermission('editInfringements');
  const canDeleteInfringements = props.hasPermission('deleteInfringements');

  const [warningType, setWarningType] = useState('');

  const [linkName, setLinkName] = useState('');
  const [linkURL, setLinkURL] = useState('');

  const [adminLinkName, setAdminLinkName] = useState('');
  const [adminLinkURL, setAdminLinkURL] = useState('');
  const [showCcModal, setShowCcModal] = useState(false);

  const toggleCcModal = () => setShowCcModal(!showCcModal);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-CA').split('T')[0];
  };

  function getLastInitial(lastName) {
    return lastName != "System" ? lastName.charAt(0).toUpperCase() : lastName;
  }

  if (blueSquare.length === 0) {
    blueSquare = [
      {
        date: getCurrentDate(),
        description:
          'This is auto-generated text. You must save the document first before viewing newly created blue squares.',
      },
    ];
  }

  const [dateStamp, setDateStamp] = useState(blueSquare[0]?.date || getCurrentDate());
  const [summary, setSummary] = useState(blueSquare[0]?.description || '');

  const [addButton, setAddButton] = useState(false);
  const [summaryFieldView, setSummaryFieldView] = useState(false);
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

  // carlos: author name state and fetch
  const [firstName, setFirstName] = useState(blueSquare[0]?.authorFirstName || "");
  const [lastName, setLastName] = useState(blueSquare[0]?.authorLastName || "");
  useEffect(() => {
    if (type === 'addBlueSquare' && auth?.user?.userid) {
      axios.get(ENDPOINTS.USER_PROFILE(auth.user.userid)).then(response => {
        setFirstName(response.data.firstName);
        setLastName(response.data.lastName);
      });
    }
  }, []);

  // development: warning system handlers
  const handleWarningChange = (warningTitle, warn, color) => {
    setWarningSelections(prevData => {
      const updatedData = {
        ...prevData,
        [warningTitle]: { warn, color },
        bothTriggered: true,
      };

      const issueBlueSquare = Object.entries(updatedData)
        .filter(([key]) => key !== 'bothTriggered' && key !== 'issueBlueSquare')
        .reduce((acc, [warningTitle, selection]) => {
          acc[warningTitle] = selection?.warn === 'Issue Blue Square';
          return acc;
        }, {});

      return {
        ...updatedData,
        issueBlueSquare,
      };
    });
  };

  const handleSubmitWarning = (warningData = warningSelections) => {
    setShowWarningSpinner(true);
    handleLogWarning(warningData);
    modifyBlueSquares(id, dateStamp, summary, '', '', 'delete');
  };

  const handleLoggingBothWarnings = () => {
    const updatedSelections = specialWarnings.reduce((acc, specialWarning) => {
      acc[specialWarning.title] = { warn: 'Log Warning', color: 'blue' };
      return acc;
    }, {});

    updatedSelections.bothTriggered = true;

    const issueBlueSquare = Object.entries(updatedSelections)
      .filter(([key]) => key !== 'bothTriggered' && key !== 'issueBlueSquare')
      .reduce((acc, [warningTitle, selection]) => {
        acc[warningTitle] = selection?.warn === 'Issue Blue Square';
        return acc;
      }, {});

    const finalSelections = {
      ...updatedSelections,
      issueBlueSquare,
    };

    handleSubmitWarning(finalSelections);
  };

  const handleToggleLogWarning = warningData => {
    if (warningData === 'both') {
      if (specialWarnings[0].warnings.length <= 1 && specialWarnings[1].warnings.length <= 1) {
        handleLoggingBothWarnings();
        return;
      }
      setDisplayBothModal(true);
      setWarningType({
        specialWarnings,
        username: `${userProfile.firstName} ${userProfile.lastName}`,
        warningText: `${specialWarnings[0].title} and ${specialWarnings[0].warnings.length + 1}x ${specialWarnings[1].title}`,
      });
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
    modifyBlueSquares(id, dateStamp, summary, '', '', 'delete');
  };

  function checkFields(field1, field2) {
    if (field1.trim() && field2.trim()) {
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
  const darkInputStyle = darkMode ? { backgroundColor: '#2d3748', borderColor: '#4a5568', color: '#fff' } : {};
  const darkDateStyle = darkMode ? { ...darkInputStyle, colorScheme: 'dark' } : {};

  const [ccModalOpen, setCcModalOpen] = useState(false);
  const allUsers = useSelector(state => state.allUserProfiles?.userProfiles) || [];
  const currentUser = allUsers.find(u => u._id === userProfile._id) || userProfile;
  const [ccCount, setCcCount] = useState(currentUser?.infringementCCList?.length || 0);

  useEffect(() => {
    setCcCount(currentUser?.infringementCCList?.length || 0);
  }, [currentUser?.infringementCCList?.length]);

  const handleCcListUpdate = () => {
    setCcCount(currentUser?.infringementCCList?.length || 0);
  };

  const openCc = () => setCcModalOpen(true);
  const closeCc = () => setCcModalOpen(false);

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
          handleWarningChange={handleWarningChange}
          handleSubmitWarning={handleSubmitWarning}
          warningSelections={warningSelections}
          numberOfWarnings={Math.max(
            warningType.specialWarnings[0].warnings.length,
            warningType.specialWarnings[1].warnings.length,
          )}
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

      <Modal
        isOpen={isOpen}
        toggle={closeModal}
        className={darkMode ? `text-light ${styles['dark-mode']}` : ''}
      >
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
                <Input type="date" name="date" id="date" value={dateStamp} onChange={handleChange} style={darkDateStyle} />
              </FormGroup>

              <FormGroup hidden={summaryFieldView}>
                <Label className={fontColor} for="report">
                  Summary
                </Label>
                {/* carlos: show who is assigning the blue square */}
                <Input
                  id="asignment"
                  readOnly
                  className={fontColor}
                  value={`Assigned by ${firstName} ${getLastInitial(lastName)} ${formatYYYYMMDDToMMDDYY(dateStamp)}:`}
                  style={darkInputStyle}
                />
                <Input
                  type="textarea"
                  id="summary"
                  onChange={handleChange}
                  value={summary}
                  style={{ minHeight: '200px', overflow: 'hidden', ...darkInputStyle }}
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
                    style={darkDateStyle}
                  />
                ) : (
                  <span> {blueSquare[0]?.date}</span>
                )}
              </FormGroup>

              <FormGroup>
                <Label className={fontColor} for="createdDate">
                  {`Created Date: `}
                  <span>{blueSquare[0]?.createdDate}</span>
                </Label>
              </FormGroup>

              <FormGroup>
                <Label className={fontColor} for="report">
                  Summary
                </Label>
                {/* carlos: show who assigned the blue square */}
                <Input
                  id="asignment"
                  readOnly
                  className={fontColor}
                  value={`Assigned by ${firstName} ${getLastInitial(lastName)} ${formatYYYYMMDDToMMDDYY(dateStamp)}:`}
                  style={darkInputStyle}
                />
                {canEditInfringements ? (
                  <Input
                    type="textarea"
                    id="summary"
                    onChange={handleChange}
                    value={summary}
                    style={{ minHeight: '200px', overflow: 'hidden', ...darkInputStyle }}
                    onInput={e => adjustTextareaHeight(e.target)}
                  />
                ) : (
                  <p className={fontColor}>{blueSquare[0]?.description}</p>
                )}
                <CcUserList users={blueSquare[0]?.ccdUsers} />
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
                  {`Created Date: `}
                  <span>{blueSquare[0]?.createdDate}</span>
                </Label>
              </FormGroup>

              <FormGroup>
                <Label className={fontColor} for="description">
                  Summary
                </Label>
                {/* carlos: show who assigned the blue square */}
                <p className={fontColor}>{`Assigned by ${firstName} ${getLastInitial(lastName)} ${formatYYYYMMDDToMMDDYY(dateStamp)}:`}</p>
                <p className={fontColor}>{blueSquare[0]?.description}</p>
                <CcUserList users={blueSquare[0]?.ccdUsers} />
              </FormGroup>
            </>
          )}

          {type === 'save' && modalMessage}
          {type === 'message' && modalMessage}
          {type === 'image' && modalMessage}
        </ModalBody>

        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <div className="d-flex w-100 align-items-center">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Button color="secondary" onClick={openCc} style={boxStyling} className="mr-2">
                CC List
              </Button>
              {ccCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-3px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {ccCount}
                </span>
              )}
            </div>

            <div
              className="ml-auto d-flex align-items-center"
              style={{ gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', width: '80%' }}
            >
              {type === 'addBlueSquare' && (
                <Button
                  color="danger"
                  id="addBlueSquare"
                  disabled={addButton}
                  onClick={() => {
                    modifyBlueSquares('', dateStamp, summary, firstName, lastName, 'add');
                  }}
                  style={boxStyling}
                >
                  Submit
                </Button>
              )}

              {type === 'modBlueSquare' && (
                <>
                  {canEditInfringements && (
                    <Button
                      color="info"
                      onClick={() => {
                        modifyBlueSquares(id, dateStamp, summary, firstName, lastName, 'update');
                      }}
                      style={{ ...boxStyling, width: '25%' }}
                    >
                      Update
                    </Button>
                  )}

                  {canDeleteInfringements && (
                    <Button
                      color="danger"
                      onClick={() => {
                        modifyBlueSquares(id, dateStamp, summary, firstName, lastName, 'delete');
                      }}
                      style={{ ...boxStyling, width: '25%' }}
                    >
                      Delete
                    </Button>
                  )}

                  <Button
                    color="primary"
                    onClick={closeModal}
                    style={{ ...boxStyling, width: '25%' }}
                  >
                    Cancel
                  </Button>

                  {specialWarnings?.map(warning => (
                    <OverlayTrigger
                      key={warning.abbreviation}
                      placement="top"
                      delay={{ show: 100, hide: 100 }}
                      overlay={
                        <Popover id="popover-basic">
                          <Popover.Title
                            as="h4"
                            style={{
                              textAlign: 'center',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0,
                                width: '100%',
                                lineHeight: 1.1,
                              }}
                            >
                              <p style={{ margin: 0, width: '100%', textAlign: 'center' }}>
                                Remove Blue Square
                              </p>
                              {warning.abbreviation === 'RBS4NS' ? (
                                <p style={{ margin: 0, width: '100%', textAlign: 'center' }}>
                                  for No Summary
                                </p>
                              ) : (
                                <p style={{ margin: 0, width: '100%', textAlign: 'center' }}>
                                  for Hours Close Enough
                                </p>
                              )}
                            </div>
                          </Popover.Title>

                          <Popover.Content>
                            {warning.abbreviation === 'RBS4NS'
                              ? 'Logs a warning for the first two occurrences. On the third occurrence, logs and emails the warning. On the fourth and subsequent occurrences, logs the warning and prompts the user to either email the warning or issue a blue square.'
                              : 'Issues a warning if hours were close enough (above 85% of the weekly commitment). Logs a warning for the first two occurrences. On the third occurrence, logs and emails the warning. On the fourth and subsequent occurrences, logs the warning and prompts the user to either email the warning or issue a blue square.'}
                          </Popover.Content>
                        </Popover>
                      }
                    >
                      <Button
                        color="warning"
                        onClick={() => {
                          handleToggleLogWarning(warning);
                        }}
                        name={warning.abbreviation}
                        style={{ ...boxStyling, width: '25%' }}
                      >
                        {warning.abbreviation}
                      </Button>
                    </OverlayTrigger>
                  ))}

                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 100, hide: 100 }}
                    overlay={
                      <Popover>
                        <Popover.Title
                          as="h4"
                          style={{
                            textAlign: 'center',
                          }}
                        >
                          Removes Blue Square for both Hours Close Enough and No Summary
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
                      onClick={() => {
                        handleToggleLogWarning('both');
                      }}
                      style={{ ...boxStyling, width: '25%' }}
                    >
                      Both
                    </Button>
                  </OverlayTrigger>
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
                    Close
                  </Button>
                  <Button
                    color="info"
                    onClick={() => {
                      window.open('https://picresize.com/');
                    }}
                    style={boxStyling}
                  >
                    Resize
                  </Button>
                </>
              )}

              {type === 'save' ? (
                <Button color="primary" onClick={closeModal} style={boxStyling}>
                  Close
                </Button>
              ) : type !== 'modBlueSquare' ? (
                <Button color="primary" onClick={closeModal} style={boxStyling}>
                  Cancel
                </Button>
              ) : (
                ''
              )}
            </div>
          </div>
        </ModalFooter>
      </Modal>

      <BlueSquareEmailCCPopup
        isOpen={ccModalOpen}
        onClose={closeCc}
        darkMode={darkMode}
        userId={userProfile._id}
        onCcListUpdate={handleCcListUpdate}
      />
    </>
  );
};

UserProfileModal.propTypes = {
  specialWarnings: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      warnings: PropTypes.arrayOf(PropTypes.string),
      abbreviation: PropTypes.string,
    }),
  ),
};

export default connect(null, { hasPermission })(UserProfileModal);