import { useState, useReducer } from 'react';
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
import { connect, useSelector } from 'react-redux';
import { boxStyle, boxStyleDark } from '../../../styles';
import '../../Header/DarkMode.css';
import hasPermission from '../../../utils/permissions';

function UserProfileModal(props) {
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

  if (type !== 'message' && type !== 'addBlueSquare') {
    if (id.length > 0) {
      blueSquare = userProfile.infringements?.filter(blueSquareParam => blueSquareParam._id === id);
    }
  }

  const darkMode = useSelector(state => state.theme.darkMode);

  const canPutUserProfile = props.hasPermission('putUserProfile');
  const canEditInfringements = props.hasPermission('editInfringements');
  const canDeleteInfringements = props.hasPermission('deleteInfringements');

  const [linkName, setLinkName] = useState('');
  const [linkURL, setLinkURL] = useState('');

  const [adminLinkName, setAdminLinkName] = useState('');
  const [adminLinkURL, setAdminLinkURL] = useState('');

  const [dateStamp, setDateStamp] = useState(blueSquare[0]?.date || '');
  const [summary, setSummary] = useState(blueSquare[0]?.description || '');

  const [addButton, setAddButton] = useState(true);
  const [summaryFieldView, setSummaryFieldView] = useState(true);

  const [personalLinks, dispatchPersonalLinks] = useReducer(
    (personalLinksParam, { typeParam, value, passedIndex }) => {
      switch (typeParam) {
        case 'add':
          return [...personalLinksParam, value];
        case 'remove':
          return personalLinksParam.filter((_, index) => index !== passedIndex);
        case 'updateName':
          return personalLinksParam.filter((_, index) => {
            const param1 = _;
            if (index === passedIndex) {
              param1.Name = value;
            }
            return param1;
          });
        case 'updateLink':
          return personalLinksParam.filter((_, index) => {
            const param2 = _;
            if (index === passedIndex) {
              param2.Link = value;
            }
            return param2;
          });
        default:
          return personalLinksParam;
      }
    },
    userProfile.personalLinks,
  );

  const [adminLinks, dispatchAdminLinks] = useReducer(
    (adminLinksParam, { typeParam2, value, passedIndex }) => {
      switch (typeParam2) {
        case 'add':
          return [...adminLinksParam, value];
        case 'remove':
          return adminLinksParam.filter((_, index) => index !== passedIndex);
        case 'updateName':
          return adminLinksParam.filter((_, index) => {
            const param3 = _;
            if (index === passedIndex) {
              param3.Name = value;
            }
            return param3;
          });
        case 'updateLink':
          return adminLinksParam.filter((_, index) => {
            const param4 = _;
            if (index === passedIndex) {
              param4.Link = value;
            }
            return param4;
          });
        default:
          return adminLinksParam;
      }
    },
    userProfile.adminLinks,
  );

  function checkFields(field1, field2) {
    // console.log('f1:', field1, ' f2:', field2);

    if (field1 != null && field2 != null) {
      setAddButton(false);
    } else {
      setAddButton(true);
    }
  }

  const adjustTextareaHeight = originalTextarea => {
    const textarea = originalTextarea;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

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

  const boxStyling = darkMode ? boxStyleDark : boxStyle;
  const fontColor = darkMode ? 'text-light' : '';

  return (
    <Modal isOpen={isOpen} toggle={closeModal} className={darkMode ? 'text-light dark-mode' : ''}>
      <ModalHeader toggle={closeModal} className={darkMode ? 'bg-space-cadet' : ''}>
        {modalTitle}
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
                      <div key={link.Name || link.Link} style={{ display: 'flex', margin: '5px' }}>
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
                          type="button"
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
                    <div key={link.Name || link.Link} style={{ display: 'flex', margin: '5px' }}>
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
                <Input type="date" onChange={e => setDateStamp(e.target.value)} value={dateStamp} />
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
  );
}

export default connect(null, { hasPermission })(UserProfileModal);
