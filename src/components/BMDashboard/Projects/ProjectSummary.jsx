import { Row, Col, Label } from 'reactstrap';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './ProjectSummary.module.css';

function ProjectSummary({ project }) {
  const {
    hoursWorked,
    totalMaterialsCost,
    totalEquipmentCost,
    mostMaterialWaste,
    members,
    mostMaterialBought,
    leastMaterialAvailable,
  } = project;

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const summaryLabelCol = windowWidth < 700 ? 12 : 4;
  const summaryValueCol = windowWidth < 700 ? 12 : 8;
  const summaryLabelColShort = windowWidth < 700 ? 6 : 4;

  return (
    <div
      className={`${darkMode ? styles.darkProjectSummaryContent : styles.projectSummaryContent}`}
    >
      <Row className={`${styles.projectSummaryHeader} mx-auto`}>
        <h2>{project.name} Summary</h2>
      </Row>

      <Row className={`${styles.projectSummaryItem} mx-auto`}>
        <Col xs={summaryLabelCol} sm={summaryLabelCol}>
          <Label className={styles.projectSummaryLabel}>Total hours of work done:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className={styles.projectSummarySpan}>{hoursWorked}</span>
        </Col>
      </Row>

      <Row className={`${styles.projectSummaryItem} mx-auto`}>
        <Col xs={summaryLabelCol} sm={summaryLabelCol}>
          <Label className={styles.projectSummaryLabel}>Total cost of materials:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className={styles.projectSummarySpan}>{totalMaterialsCost} USD</span>
        </Col>
      </Row>

      <Row className={`${styles.projectSummaryItem} mx-auto`}>
        <Col xs={summaryLabelCol} sm={summaryLabelCol}>
          <Label className={styles.projectSummaryLabel}>Total cost of equipment:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className={styles.projectSummarySpan}>{totalEquipmentCost} USD</span>
        </Col>
      </Row>

      <Row className={`${styles.projectSummaryItem} mx-auto`}>
        <Col xs={summaryLabelCol} sm={summaryLabelCol}>
          <Label className={styles.projectSummaryLabel}>Waste:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className={styles.projectSummarySpan}>
            {mostMaterialWaste?.stockWasted} {mostMaterialWaste?.itemType.unit} of{' '}
            {mostMaterialWaste?.itemType.name} has been wasted!
          </span>
        </Col>
      </Row>

      <Row className={`${styles.projectSummaryItem} mx-auto`}>
        <Col xs={summaryLabelCol} sm={summaryLabelCol}>
          <Label className={styles.projectSummaryLabel}>Total members:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className={styles.projectSummarySpan}>{members.length}</span>
        </Col>
      </Row>

      <Row className={`${styles.projectSummaryItem} mx-auto`}>
        <Col xs={summaryLabelCol} sm={summaryLabelColShort}>
          <Label className={styles.projectSummaryLabel}>Rentals:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={8}>
          <span className={styles.projectSummarySpan}>Excavator 2 rental ends in 72 hours!</span>
        </Col>
      </Row>

      <Row className={`${styles.projectSummaryItem} mx-auto`}>
        <Col xs={summaryLabelCol} sm={summaryLabelColShort}>
          <Label className={styles.projectSummaryLabel}>Most material bought:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={8}>
          <span className={styles.projectSummarySpan}>
            {mostMaterialBought?.stockBought} {mostMaterialBought?.itemType.unit} of{' '}
            {mostMaterialBought?.itemType.name} purchased for this project
          </span>
        </Col>
      </Row>

      <Row className={`${styles.projectSummaryItem} mx-auto`}>
        <Col xs={summaryLabelCol} sm={summaryLabelColShort}>
          <Label className={styles.projectSummaryLabel}>Stock:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className={styles.projectSummarySpan}>
            {leastMaterialAvailable?.itemType.name} is nearly out of stock (
            {leastMaterialAvailable?.stockAvailable} {leastMaterialAvailable?.itemType.unit}{' '}
            remaining)
          </span>
        </Col>
      </Row>
    </div>
  );
}

export default ProjectSummary;
