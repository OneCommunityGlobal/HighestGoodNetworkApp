import React from 'react';
import { Container, Button } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import styles from './AssignAtoms.module.css';
import AssignAtomModal from '../AssignAtomModal';
import { showModal } from '~/actions/educationPortal/atomActions';
import NavigationBar from '../StudentDashboard/NavigationBar';

const AssignAtoms = () => {
  const dispatch = useDispatch();
  const authUser = useSelector(state => state.auth.user);

  // Handle opening assign atoms modal
  const handleAssignAtoms = () => {
    const studentId = authUser?._id || authUser?.id;
    const studentName =
      `${authUser?.firstName || ''} ${authUser?.lastName || ''}`.trim() || 'Student';
    dispatch(showModal(studentId, studentName));
  };

  return (
    <div className={styles.assignAtomsPage}>
      <NavigationBar />

      <Container className={styles.mainContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1 className={styles.title}>Assign Atoms</h1>
              <p className={styles.subtitle}>Assign learning atoms to students</p>
            </div>
          </div>
        </div>

        {/* Assign Atoms Button */}
        <div className={styles.buttonContainer}>
          <Button color="primary" onClick={handleAssignAtoms} className={styles.assignAtomsButton}>
            Assign Atoms
          </Button>
        </div>
      </Container>

      {/* Assign Atoms Modal */}
      <AssignAtomModal />
    </div>
  );
};

export default AssignAtoms;
