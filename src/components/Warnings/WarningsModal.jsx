/* eslint-disable no-unused-vars */
/* eslint-disable spaced-comment */
/* eslint-disable no-undef */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-alert */
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert } from 'reactstrap';
import { useEffect, useState } from 'react';
import {
  postNewWarning,
  getWarningDescriptions,
  deleteWarningDescription,
  updateWarningDescription,
} from '../../actions/warnings';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

import reorder from './reorder.svg';

/**
 *
 *
 * Modal displaying information about how time entry works
 * @param {*} props
 * @param {Boolean} props.visible
 * @param {Func} props.setVisible
 */
function WarningsModal({
  setToggleModal,
  visible,
  deleteWarning,
  deleteWarningTriggered,
  warning,
  handleIssueWarning,
  setWarningsModal,
  setToggleWarningModal,
  toggleWarningModal,
  getUsersWarnings,
  // handleDeleteDescription,
  // handleAddNewWarning,
  // handleDeactivate,
}) {
  const { today, id, colorAssigned, warningText, username } = warning || {};
  const [toggeleWarningInput, setToggeleWarningInput] = useState(false);
  const [newWarning, setNewWarning] = useState('');
  const [warningDescriptions, setWarningDescriptions] = useState([]);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchWarningDescriptions = async () => {
      dispatch(getWarningDescriptions()).then(res => {
        if (res.error) {
          setError(res.error);
          return;
        }
        setWarningDescriptions(res);
      });
    };
    fetchWarningDescriptions();
  }, []);

  const handleOverlayTrigger = title => {
    if (title === 'info') {
      return (
        <Popover id="details">
          <Popover.Title as="h4">Information</Popover.Title>
          <Popover.Content>
            <p className="modal__information">
              Pressing the "+" button will allow you to activate the warning tracker.
            </p>
            <p className="modal__information">
              Pressing the "-" button will allow you to deactivate the warning tracker.
            </p>
            <p className="modal__information">
              Pressing the "x" button will allow you to delete the warning tracker. This will also
              delete all assoicated warnings for every user (be careful doing this!).
            </p>
            <p className="modal__information">
              Pressing the "Add New Warning Tracker" button will allow you to add a new warning to
              the list.
            </p>
          </Popover.Content>
        </Popover>
      );
    }
    return (
      <Popover id="details">
        <Popover.Title as="h4">Description</Popover.Title>
        <Popover.Content>
          This will {title} this warning tracker,{' '}
          {title === 'activate'
            ? 'showing all saved warning-tracking data of this type'
            : 'retaining the data but hiding all warning tracking of this type'}
        </Popover.Content>
      </Popover>
    );
  };

  const handleDeleteWarningDescription = warningId => {
    dispatch(deleteWarningDescription(warningId)).then(res => {
      if (res.error) {
        setError(res.error);
        return;
      }
      setWarningDescriptions(prev => prev.filter(warning => warning._id !== warningId));
      getUsersWarnings();
    });
  };

  const handleDeactivate = warningId => {
    dispatch(updateWarningDescription(warningId)).then(res => {
      if (res.error) {
        setError(res.error);
        return;
      }
      setWarningDescriptions(prev =>
        prev.map(warning => {
          if (warning._id === warningId) {
            return { ...warning, activeWarning: !warning.activeWarning };
          }
          return warning;
        }),
      );
      getUsersWarnings();
    });
  };

  const handleChange = e => {
    setNewWarning(e.target.value);
  };

  const handleAddNewWarning = (e, newWarning) => {
    e.preventDefault();

    if (newWarning === '') return;
    dispatch(postNewWarning({ newWarning, activeWarning: true })).then(res => {
      setNewWarning('');
      console.log('res inside the modal', res);
      if (res?.error) {
        setError(res.error);
        return;
      }
      if (res?.message) {
        setError(res.message);
        return;
      }
      setWarningDescriptions(res.newWarnings);
      getUsersWarnings();
      setError(null);
    });
  };

  if (deleteWarning) {
    return (
      <Modal isOpen={visible} toggle={() => setToggleModal(false)}>
        <ModalHeader>Delete Warning</ModalHeader>
        <ModalBody>
          <h2>Are you sure you want to delete this warning?</h2>
        </ModalBody>

        <ModalFooter>
          <Button onClick={() => setToggleModal(false)} color="danger">
            Cancel
          </Button>

          <Button
            onClick={() => {
              deleteWarningTriggered();
              setToggleModal(false);
            }}
            color="primary"
          >
            Delete Warning
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
  if (toggleWarningModal) {
    return (
      <Modal isOpen={toggleWarningModal} toggle={() => setToggleWarningModal(false)}>
        <ModalHeader className="modal__header">
          Current Warning Descriptions
          <OverlayTrigger
            placement="right"
            delay={{ show: 100, hide: 250 }}
            overlay={handleOverlayTrigger('info')}
          >
            <i
              data-toggle="tooltip"
              style={{
                fontSize: 24,
                cursor: 'pointer',
                marginLeft: '10px',
                color: 'rgb(0, 204, 255)',
              }}
              aria-hidden="true"
              className="fa fa-info-circle"
            />
          </OverlayTrigger>
        </ModalHeader>
        {error && (
          <Alert key="error" variant="danger" color="danger" className="alert__container">
            {error}
          </Alert>
        )}
        <ModalBody>
          {warningDescriptions.map(warning => (
            <div className="warnings__descriptions" key={warning._id}>
              <img src={reorder} alt="" className="warning__reorder" />
              {warning.activeWarning ? (
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 100, hide: 250 }}
                  overlay={handleOverlayTrigger('deactive')}
                >
                  <Button
                    color="warning"
                    className="warning__descriptions__btn"
                    onClick={() => handleDeactivate(warning._id)}
                  >
                    <i className="fa fa-minus" />
                  </Button>
                </OverlayTrigger>
              ) : (
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 100, hide: 250 }}
                  overlay={handleOverlayTrigger('activate')}
                >
                  <Button
                    color="success"
                    className="warning__descriptions__btn"
                    onClick={() => handleDeactivate(warning._id)}
                  >
                    <i className="fa fa-plus" />
                  </Button>
                </OverlayTrigger>
              )}

              <Button
                color="danger"
                className="warning__descriptions__btn"
                onClick={() => handleDeleteWarningDescription(warning._id)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </Button>
              <p
                className={`warnings__descriptions__title ${
                  warning.activeWarning ? '' : 'warnings__descriptions__title--gray'
                }`}
              >
                {warning.warningTitle}
              </p>
            </div>
          ))}
          <div className="btn__container">
            {!toggeleWarningInput && (
              <Button
                className="add__btn"
                color="primary"
                onClick={() => setToggeleWarningInput(true)}
              >
                {/* <i className="fa fa-plus" /> */}
                Add New Warning Tracker
              </Button>
            )}

            {toggeleWarningInput && (
              <form className="warning__form" onSubmit={e => handleAddNewWarning(e, newWarning)}>
                <label htmlFor="warning" className="warning__title">
                  Warning Tracker Title
                </label>
                <input
                  type="text"
                  id="warning"
                  required
                  className="warning__input"
                  value={newWarning}
                  onChange={e => {
                    handleChange(e);
                  }}
                />
                <div>
                  <Button color="primary" type="submit">
                    Add
                  </Button>
                  <Button
                    color="danger"
                    className="cancel__btn"
                    onClick={() => {
                      setNewWarning(null);
                      setWarningsModal(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="danger" onClick={() => setToggleWarningModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
  return (
    <div>
      <Modal isOpen={visible} toggle={() => setToggleModal(false)}>
        <ModalHeader>Issue Warning</ModalHeader>
        <ModalBody>
          <h3>Are you sure you want to issue a warning to: {username}?</h3>
          <p>
            The warning will be because they didn&apos;t meet the criteria for the following
            warning: "{warningText}"
          </p>
          <p>The color will be {colorAssigned}</p>
        </ModalBody>

        <ModalFooter className="warning-modal-footer">
          <Button
            onClick={() => {
              handleIssueWarning(warning);
              // subtmit wanring here to backend
              setToggleModal(false);
            }}
          >
            Log Warning Only
          </Button>

          <Button
            onClick={() => {
              //email will be sent and logged
              alert('EMAIL SENT!!');
              handleIssueWarning({ ...warning, colorAssigned: 'yellow' });
              setToggleModal(false);
            }}
            color="warning"
          >
            Issue Warning
          </Button>

          <Button
            onClick={() => {
              alert('BLUE SQUARE ISSUED!!');
              handleIssueWarning({ ...warning, colorAssigned: 'red' });
              setToggleModal(false);
            }}
            color="primary"
          >
            Issue Blue Square
          </Button>
          <Button onClick={() => setToggleModal(false)} color="danger">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default WarningsModal;
