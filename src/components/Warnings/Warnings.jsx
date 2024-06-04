import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Alert } from 'react-bootstrap';
import {
  getWarningsByUserId,
  postWarningByUserId,
  deleteWarningsById,
} from '../../actions/warnings';
import WarningsModal from './WarningsModal';
import WarningTrackerModal from './modals/WarningTrackerModal';
import WarningItem from './WarningItem';
import './Warnings.css';

export default function Warning({ personId, username, userRole }) {
  const dispatch = useDispatch();

  const [usersWarnings, setUsersWarnings] = useState([]);
  const [toggleWarningModal, setToggleWarningModal] = useState(false);
  const [toggleWarningTrackerModal, setToggleWarningTrackerModal] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsersWarningsById = async () => {
    dispatch(getWarningsByUserId(personId)).then(res => {
      if (res.error) {
        setError(res);
        setUsersWarnings([]);
        return;
      }
      setUsersWarnings(res);
    });
  };

  const handleToggle = () => {
    setToggle(prev => !prev);
    fetchUsersWarningsById();
  };

  const handleDeleteWarning = async warningId => {
    dispatch(deleteWarningsById(warningId, personId)).then(res => {
      if (res.error) {
        setError(res);
        setUsersWarnings([]);
        return;
      }
      setUsersWarnings(res);
    });
  };
  const handlePostWarningDetails = async ({
    id,
    colorAssigned: color,
    todaysDate: dateAssigned,
    warningText,
  }) => {
    const data = {
      userId: personId,
      iconId: id,
      color,
      date: dateAssigned,
      description: warningText,
    };

    dispatch(postWarningByUserId(data)).then(res => {
      if (res.error) {
        setError(res);
        setUsersWarnings([]);
        return;
      }
      setUsersWarnings(res);
    });
  };

  const warnings = !toggle
    ? null
    : usersWarnings.map(warning => (
        <WarningItem
          key={warning.title}
          warnings={warning.warnings}
          warningText={warning.title}
          handlePostWarningDetails={handlePostWarningDetails}
          username={username}
          submitWarning={handlePostWarningDetails}
          handleDeleteWarning={handleDeleteWarning}
        />
      ));

  return (
    (userRole === 'Administrator' || userRole === 'Owner') && (
      <div className="warnings-container">
        <div className="button__container">
          <Button
            className="btn btn-warning warning-btn tracking__btn"
            size="sm"
            onClick={handleToggle}
          >
            {toggle ? 'Hide' : 'Tracking'}
          </Button>

          {userRole === 'Owner' && (
            <Button
              className="btn"
              size="sm"
              onClick={() => setToggleWarningTrackerModal(prev => !prev)}
            >
              +/-
            </Button>
          )}
        </div>
        {toggleWarningModal && (
          <WarningsModal
            toggleWarningModal={toggleWarningModal}
            personId={personId}
            setToggleWarningModal={setToggleWarningModal}
            getUsersWarnings={fetchUsersWarningsById}
          />
        )}
        {toggleWarningTrackerModal && (
          <WarningTrackerModal
            toggleWarningTrackerModal={toggleWarningTrackerModal}
            personId={personId}
            setToggleWarningTrackerModal={setToggleWarningTrackerModal}
            getUsersWarnings={fetchUsersWarningsById}
          />
        )}
        <div className="warning-wrapper"> {warnings}</div>
        <div className="error-container">
          {error && (
            <Alert key="warning" variant="warning">
              {error.error}
            </Alert>
          )}
        </div>
      </div>
    )
  );
}
