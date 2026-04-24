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
import { OverlayTrigger, Popover } from 'react-bootstrap';
import WarningModal from '../../Warnings/modals/WarningModal';
import BlueSquareEmailCCPopup from '../BlueSquareEmailCCPopup';
import CcUserList from './CCUserList';
import PropTypes from 'prop-types';

// Helper component to render blue square metadata (manual assignment and edit history)
const BlueSquareMetadata = ({ blueSquareData, fontColor, darkMode }) => {
  const hasManualAssignment = blueSquareData?.manullyAssigned;
  const hasEditHistory = blueSquareData?.editedBy && blueSquareData.editedBy.length > 0;
  
  if (!hasManualAssignment && !hasEditHistory) return null;

  return (
    <>
      {hasManualAssignment && (
        <FormGroup>
          <Label className={fontColor} for="manullyAssigned">
            <strong>Manual Assignment</strong>
          </Label>
          <div className={fontColor}>
            {blueSquareData?.manullyAssignedBy?.firstName && blueSquareData?.manullyAssignedBy?.lastName
              ? `${blueSquareData.manullyAssignedBy.firstName} ${blueSquareData.manullyAssignedBy.lastName}`
              : 'Admin User'}
          </div>
        </FormGroup>
      )}
      
      {hasEditHistory && (
        <FormGroup>
          <div style={{ textAlign: 'right', fontSize: '0.9em', color: darkMode ? '#ccc' : '#666' }}>
            <strong>Edited By</strong>{' '}
            {blueSquareData.editedBy[blueSquareData.editedBy.length - 1].firstName}{' '}
            {blueSquareData.editedBy[blueSquareData.editedBy.length - 1].lastName}
            {blueSquareData.editedBy[blueSquareData.editedBy.length - 1].date && (
              <span>
                {' '}
                {new Date(blueSquareData.editedBy[blueSquareData.editedBy.length - 1].date).toLocaleDateString()}
              </span>
            )}
          </div>
        </FormGroup>
      )}
    </>
  );
};

BlueSquareMetadata.propTypes = {
  blueSquareData: PropTypes.shape({
    manullyAssigned: PropTypes.bool,
    manullyAssignedBy: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
    editedBy: PropTypes.arrayOf(
      PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        date: PropTypes.string,
      })
    ),
  }),
  fontColor: PropTypes.string.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

BlueSquareMetadata.defaultProps = {
  blueSquareData: null,
};

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
    modifyBlueSquares(id, dateStamp, summary, 'delete');
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
    modifyBlueSquares(id, dateStamp, summary, 'delete');
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
                        <div className={styles.customTitle}>Name</div>
                        <div className={styles.customTitle}>Link URL</div>
                      </div>

                      {adminLinks.map((link, index) => (
                        <div key={index} style={{ display: 'flex', margin: '5px' }}>
                          <input
                            className={styles.customInput}
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
                            className={styles.customInput}
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
                            className={styles.closeButton}
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
                        <div className={styles.customTitle}>+ ADD LINK:</div>
                      </div>

                      <div style={{ display: 'flex', margin: '5px' }}>
                        <input
                          className={styles.customEdit}
                          id="linkName"
                          placeholder="enter name"
                          onChange={e => setAdminLinkName(e.target.value)}
                        />
                        <input
                          className={styles.customEdit}
                          id="linkURL"
                          placeholder="enter link"
                          onChange={e => setAdminLinkURL(e.target.value.trim())}
                        />
                        <button
                          className={styles.addButton}
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
                      <div className={styles.customTitle}>Name</div>
                      <div className={styles.customTitle}>Link URL</div>
                    </div>

                    {personalLinks.map((link, index) => (
                      <div key={index} style={{ display: 'flex', margin: '5px' }}>
                        <input
                          className={styles.customInput}
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
                          className={styles.customInput}
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
                          className={styles.closeButton}
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
                      <div className={styles.customTitle}>+ ADD LINK:</div>
                    </div>

                    <div style={{ display: 'flex', margin: '5px' }}>
                      <input
                        className={styles.customEdit}
                        id="linkName"
                        placeholder="enter name"
                        onChange={e => setLinkName(e.target.value)}
                      />
                      <input
                        className={styles.customEdit}
                        id="linkURL"
                        placeholder="enter link"
                        onChange={e => setLinkURL(e.target.value.trim())}
                      />
                      <button
                        className={styles.addButton}
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
                <Input type="date" name="date" id="date" value={dateStamp} onChange={handleChange} />
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
                  <Input type="date" onChange={e => setDateStamp(e.target.value)} value={dateStamp} />
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

              {/* Display Manual Assignment and Edit History */}
              <BlueSquareMetadata blueSquareData={blueSquare[0]} fontColor={fontColor} darkMode={darkMode} />

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
                    style={{ minHeight: '200px', overflow: 'hidden' }}
                    onInput={e => adjustTextareaHeight(e.target)}
                  />
                ) : (
                  <p>{blueSquare[0]?.description}</p>
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

              {/* Display Manual Assignment and Edit History */}
              <BlueSquareMetadata blueSquareData={blueSquare[0]} fontColor={fontColor} darkMode={darkMode} />

              <FormGroup>
                <Label className={fontColor} for="description">
                  Summary
                </Label>
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
              <Button color="secondary" onClick={openCc} style={boxStyling} className={styles['mr-2']}>
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
                    modifyBlueSquares('', dateStamp, summary, 'add');
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
                        modifyBlueSquares(id, dateStamp, summary, 'update');
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
                        modifyBlueSquares(id, dateStamp, summary, 'delete');
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