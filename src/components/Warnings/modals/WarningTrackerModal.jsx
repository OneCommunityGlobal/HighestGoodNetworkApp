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
import hasPermission from 'utils/permissions';
import {
  postNewWarning,
  getWarningDescriptions,
  updateWarningDescription,
  deleteWarningDescription,
  editWarningDescription,
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
  userRole,
}) {
  const [toggeleWarningInput, setToggeleWarningInput] = useState(false);
  const [newWarning, setNewWarning] = useState('');
  const [warningDescriptions, setWarningDescriptions] = useState([]);
  const [toggleDeleteModal, setToggleDeleteModal] = useState(false);
  const [warningToDelete, setWarningToDelete] = useState(null);
  const [warningEdited, setWarningEdited] = useState(false);
  const [editedWarning, setEditedWarning] = useState(null);
  const [warningWasEdited, setWarningWasEdited] = useState(false);
  const [isPermanent, setIsPermanent] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const rolesAllowedToTracking = ['Administrator', 'Owner'];
  const canAddWarningTracker =
    rolesAllowedToTracking.includes(userRole) || dispatch(hasPermission('addWarningTracker'));
  const canDeactivateWarningTracker =
    rolesAllowedToTracking.includes(userRole) ||
    dispatch(hasPermission('deactivateWarningTracker'));
  const canReactivateWarningTracker =
    rolesAllowedToTracking.includes(userRole) ||
    dispatch(hasPermission('reactivateWarningTracker'));
  const canDeleteWarningTracker =
    rolesAllowedToTracking.includes(userRole) || dispatch(hasPermission('deleteWarningTracker'));

  const fetchWarningDescriptions = async () => {
    dispatch(getWarningDescriptions()).then(res => {
      if (res.error) {
        setError(res.error);
        return;
      }
      setWarningDescriptions(res);
    });
  };
  useEffect(() => {
    fetchWarningDescriptions();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setWarningWasEdited(false);
    }, 5000);
  }, [warningWasEdited]);

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

  const handleEditWarningDescription = (e, warningId) => {
    setWarningEdited(true);

    const updatedWarningDescriptions = warningDescriptions.map(warning => {
      if (warning._id === warningId) {
        const updatedWarning = { ...warning, warningTitle: e.target.value };
        setEditedWarning(updatedWarning);
        return updatedWarning;
      }
      return { ...warning, disabled: true };
    });
    setWarningDescriptions(updatedWarningDescriptions);
  };

  const handleCancelEdit = () => {
    fetchWarningDescriptions();
    setWarningEdited(false);
    setWarningWasEdited(false);
  };

  const handleSaveEditedWarning = () => {
    dispatch(editWarningDescription(editedWarning)).then(res => {
      if (res.error) {
        setError(res.error);
        setWarningEdited(false);
        setEditedWarning(null);
        fetchWarningDescriptions();
        return;
      }
      setWarningEdited(false);
      setEditedWarning(null);
      setError(null);
      getUsersWarnings();
      fetchWarningDescriptions();
      setWarningWasEdited(true);
    });
  };

  // eslint-disable-next-line no-shadow
  const handleAddNewWarning = (e, newWarning) => {
    e.preventDefault();

    if (newWarning === '') return;
    const trimmedWarning = newWarning.trim();
    dispatch(postNewWarning({ newWarning: trimmedWarning, activeWarning: true, isPermanent })).then(
      res => {
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
        setToggeleWarningInput(false);
      },
    );
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
      {warningWasEdited && (
        <Alert key="success" variant="success" color="success" className="alert__container">
          Warning was succesfully edited!
        </Alert>
      )}
      <ModalBody>
        {warningDescriptions.map((warning, index) => (
          <div className="warnings__descriptions" key={warning._id}>
            <img src={reorder} alt="reorder" className="warning__reorder" />
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
                  disabled={!canDeactivateWarningTracker}
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
                  disabled={!canReactivateWarningTracker}
                >
                  <i className="fa fa-plus" />
                </Button>
              </OverlayTrigger>
            )}

            <Button
              color="danger"
              className="warning__descriptions__btn"
              onClick={() => handleTriggerDeleteWarningDescription(warning)}
              disabled={!canDeleteWarningTracker}
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>

            <input
              type="text"
              onChange={e => handleEditWarningDescription(e, warning._id)}
              value={warning.warningTitle}
              disabled={warning?.disabled || warning.isPermanent}
              placeholder="warning title"
              className={`warnings__descriptions__title ${
                warning.activeWarning ? '' : 'warnings__descriptions__title--gray'
              }`}
            />
          </div>
        ))}
        {warningEdited && (
          <div className="btn__container">
            <Button onClick={handleSaveEditedWarning} color="success">
              Save
            </Button>
            <Button onClick={handleCancelEdit} color="danger" className="cancel__btn">
              Cancel
            </Button>
          </div>
        )}

        <div className="btn__container">
          {!toggeleWarningInput && (
            <Button
              className="add__btn"
              color="primary"
              onClick={() => setToggeleWarningInput(true)}
              disabled={!canAddWarningTracker}
            >
              Add New Warning Tracker
            </Button>
          )}

          {toggeleWarningInput && (
            <form className="warning__form" onSubmit={e => handleAddNewWarning(e, newWarning)}>
              <h5 className="warning__form__title">New Warning Tracker</h5>

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
                <label htmlFor="isPermanent" className="warning__permanent">
                  Is Permanent?
                </label>
                <input
                  type="checkbox"
                  label="Is Permanent?"
                  id="isPermanent"
                  onChange={() => setIsPermanent(prev => !prev)}
                  value={isPermanent}
                />
              </div>
              <div className="warning__form__btns">
                <Button
                  color="danger"
                  onClick={() => {
                    setNewWarning(null);
                    setToggeleWarningInput(false);
                  }}
                >
                  Cancel
                </Button>
                <Button color="primary" type="submit" className="form__btn__add">
                  Add
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
