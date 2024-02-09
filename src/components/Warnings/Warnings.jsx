import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Alert } from 'react-bootstrap';
import {
  getWarningsByUserId,
  postWarningByUserId,
  deleteWarningsById,
  postNewWarning,
  getCurrentWarnings,
  deleteWarningDescription,
} from '../../actions/warnings';
import WarningsModal from './WarningsModal';
import WarningItem from './WarningItem';

// steps to refactor
//cron job to check if user has any warnings left of the description that was deleted

//to begin add/remove warnings from the user
//modal will pop up to remove a description
// if clikcing the dlete it will warn them again saying are you if so if it does it will delte teh warning from the scheema
//then cron job will run afterwards
//fetch the descriptions array the display the warnings for the user.

import './Warnings.css';
import { set } from 'lodash';
// Better Descriptions (“i” = ,ltd = Please be more specific in your time log descriptions.)
// Log Time to Tasks (“i” = ,lttt = Please log all time working on specific tasks to those tasks rather than the general category. )
// Log Time as You Go (“i” = ,ltayg = Reminder to please log your time as you go. At a minimum, please log daily any time you work.)
// Log Time to Action Items (“i” = ,ltayg = Reminder to please log your time as you go. At a minimum, please log daily any time you work.)
// Intangible Time Log w/o Reason (“i” = ,itlr = The timer should be used for all time logged, so any time logged as intangible must also include in the time log description an explanation for why you didn’t use the timer.

export default function Warning({ personId, username, userRole }) {
  const dispatch = useDispatch();

  const [usersWarnings, setUsersWarnings] = useState([]);
  const [warningDescriptions, setWarningDescriptions] = useState([]);
  const [warningsModal, setWarningsModal] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [error, setError] = useState(null);

  const handleToggle = () => {
    setToggle(prev => !prev);
    dispatch(getWarningsByUserId(personId)).then(res => {
      if (res.error) {
        setError(res);
        setUsersWarnings([]);
        return;
      }
      setUsersWarnings(res);
    });
  };

  // useEffect(() => {
  //   // dispatch(getWarningsByUserId(personId)).then(res => {
  //   //   if (res.error) {
  //   //     setError(res);
  //   //     setUsersWarnings([]);
  //   //     return;
  //   //   }
  //   //   setUsersWarnings(res);
  //   // });
  // }, []);

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
      //maybe a bug here
      setUsersWarnings(res);
    });
  };

  //modal will appear to add or remove descriptions
  // pass the descriptions

  //   'Log Time to Action Items', b
  // 'Intangible Time Log w/o Reason',
  const handleEditDescriptions = () => {
    dispatch(getCurrentWarnings()).then(res => {
      if (res?.error) {
        setError(res);
        setUsersWarnings([]);
        return;
      }
      setWarningDescriptions(res);
      setWarningsModal(true);
    });
    // dispatch(postNewWarning('Log Time to Action Items'));
  };

  const handleAddNewWarning = (e, newWarning) => {
    e.preventDefault();

    if (newWarning === '') return;
    dispatch(postNewWarning({ newWarning, activeWarning: true })).then(res => {
      setWarningDescriptions(res);
    });
  };

  const handleDeleteDescription = warningId => {
    const response = confirm('are you sure you want to delte it?');
    if (response) {
      dispatch(deleteWarningDescription(warningId)).then(res => {
        // setWarningDescriptions(res);
        // console.log('res', res);
        setWarningDescriptions(prev => prev.filter(warning => warning._id !== warningId));
      });
      //compelte delete logic if canceld then nothing will happen
      // console.log('conosle dlete logic will occur');
    }
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
          {/* {userRole === 'Owner' && <Button>+/-</Button>} */}
          <Button className="btn" size="sm" onClick={handleEditDescriptions}>
            +/-
          </Button>
        </div>

        {warningsModal && (
          <WarningsModal
            warningsModal={warningsModal}
            warningDescriptions={warningDescriptions}
            setWarningsModal={setWarningsModal}
            handleDeleteDescription={handleDeleteDescription}
            handleAddNewWarning={handleAddNewWarning}
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
