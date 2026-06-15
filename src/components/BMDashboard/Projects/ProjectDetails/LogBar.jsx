import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './ProjectDetails.module.css';

/* --------------------------------------------
    STYLED BUTTON WRAPPER
--------------------------------------------- */
const Btn = ({ to, color, children }) => (
  <Link to={to}>
    <Button
      type="button"
      className={`${styles.button} ${styles.btn} ${styles[`button--${color}`]}`}
    >
      {children}
    </Button>
  </Link>
);

/* --------------------------------------------
    1️⃣  DAILY LOGGING BUTTONS
--------------------------------------------- */
export const LoggingButtons = ({ darkMode }) => {
  return (
    <>
      <Btn to="/bmdashboard/timelog" color="green">
        Time
      </Btn>
      <Btn to="/bmdashboard/materials/add" color="green">
        Material
      </Btn>
      <Btn to="/bmdashboard/tools/log" color="green">
        Tool/Equipment
      </Btn>
    </>
  );
};

/* --------------------------------------------
    2️⃣  ADD NEW ITEM BUTTONS
--------------------------------------------- */
export const AddItemButtons = ({ projectId }) => {
  return (
    <>
      <Btn to="/teams" color="blue">
        Team
      </Btn>
      <Btn to="/bmdashboard/materials/add" color="blue">
        Material
      </Btn>
      <Btn to="/bmdashboard/tools/add" color="blue">
        Tool/Equipment
      </Btn>
      <Btn to={`/bmdashboard/lessonform/${projectId}`} color="blue">
        Lessons
      </Btn>
    </>
  );
};

/* --------------------------------------------
    3️⃣ TEAM BUTTONS
--------------------------------------------- */
export const TeamButtons = ({ projectId }) => {
  return (
    <>
      <Btn to="/teams" color="indigo">
        Create New Team
      </Btn>
      <Btn to="/teams" color="indigo">
        Edit Existing Team
      </Btn>
      <Btn to={`/bmdashboard/issues/add/${projectId}`} color="maroon">
        Log Issue
      </Btn>
      <Btn to="/bmdashboard/issues/" color="indigo">
        View Issues
      </Btn>
    </>
  );
};

export default function LogBar() {
  // Only used for backward compatibility
  return null;
}
