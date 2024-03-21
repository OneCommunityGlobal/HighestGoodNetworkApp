/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-vars */
/* eslint-disable spaced-comment */
/* eslint-disable no-undef */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-alert */
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert } from 'reactstrap';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import {
  postNewWarning,
  getWarningDescriptions,
  updateWarningDescription,
  deleteWarningDescription,
} from '../../../actions/warnings';

import reorder from '../reorder.svg';

/**
 *
 *
 * Modal displaying information about how time entry works
 * @param {*} props
 * @param {Boolean} props.visible
 * @param {Func} props.setVisible
 */
function WarningTrackerModal({
  toggleWarningTrackerModal,
  getUsersWarnings,
  setToggleWarningTrackerModal,
}) {
  const [toggeleWarningInput, setToggeleWarningInput] = useState(false);
  const [newWarning, setNewWarning] = useState('');
  const [warningDescriptions, setWarningDescriptions] = useState([]);
  const [toggleDeleteModal, setToggleDeleteModal] = useState(false);
  const [warningToDelete, setWarningToDelete] = useState(null);

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

  const handleTriggerDeleteWarningDescription = warning => {
    setToggleDeleteModal(true);
    setWarningToDelete(warning);
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

  const handleChange = e => {
    setNewWarning(e.target.value);
  };

  // eslint-disable-next-line no-shadow
  const handleAddNewWarning = (e, newWarning) => {
    e.preventDefault();

    if (newWarning === '') return;
    dispatch(postNewWarning({ newWarning, activeWarning: true })).then(res => {
      setNewWarning('');
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

  if (toggleDeleteModal) {
    const { warningTitle, _id } = warningToDelete;

    return (
      <Modal isOpen={toggleDeleteModal} toggle={() => setToggleDeleteModal(false)}>
        <ModalBody>
          <h2>Whooooo Tiger!! </h2>
          <p>Are you sure you want to delete this warning? </p>
          <p>Deleteing this warning will delete all associated data tied to it from all users.</p>
          <p className="modal__warning__deletion">Warning Title: {warningTitle}</p>
        </ModalBody>

        <ModalFooter>
          <Button onClick={() => setToggleDeleteModal(false)} color="danger">
            No, I changed my mind!
          </Button>

          <Button
            onClick={() => {
              handleDeleteWarningDescription(warningToDelete._id);
              setToggleDeleteModal(false);
              setError('Deletion was successful');
            }}
            color="primary"
          >
            Yes I am sure!
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal isOpen={toggleWarningTrackerModal} toggle={() => setToggleWarningTrackerModal(false)}>
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
              onClick={() => handleTriggerDeleteWarningDescription(warning)}
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
                onChange={e => setNewWarning(e.target.value)}
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
                    setToggleWarningTrackerModal(false);
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
        <Button color="danger" onClick={() => setToggleWarningTrackerModal(false)}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default WarningTrackerModal;
