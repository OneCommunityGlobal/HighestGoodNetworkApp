import { Row, Col, Label } from 'reactstrap';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './ProjectSummary.module.css';

const formatCost = value =>
  value === null || value === undefined ? 'No cost data recorded' : `${value} USD`;

const getMaterialSummary = (material, quantityKey, suffix) => {
  const quantity = material?.[quantityKey];
  const unit = material?.itemType?.unit;
  const name = material?.itemType?.name;

  if (quantity === null || quantity === undefined || !unit || !name) {
    return 'No material data recorded';
  }

  return `${quantity} ${unit} of ${name} ${suffix}`;
};

const getRentalSummary = rental => {
  if (!rental?.itemName || !rental.rentalDueDate) return 'No rental data recorded';

  const dueDate = new Date(rental.rentalDueDate);
  if (Number.isNaN(dueDate.getTime())) return 'No rental data recorded';

  const hoursRemaining = Math.max(0, Math.ceil((dueDate.getTime() - Date.now()) / 3600000));
  return `${rental.itemName} rental ends in ${hoursRemaining} hours!`;
};

function ProjectSummary({ project }) {
  const {
    hoursWorked,
    totalMaterialsCost,
    totalEquipmentCost,
    mostMaterialWaste,
    members,
    mostMaterialBought,
    leastMaterialAvailable,
    rentalSummary,
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
          <span className={styles.projectSummarySpan}>{hoursWorked ?? 0}</span>
        </Col>
      </Row>

      <Row className={`${styles.projectSummaryItem} mx-auto`}>
        <Col xs={summaryLabelCol} sm={summaryLabelCol}>
          <Label className={styles.projectSummaryLabel}>Total cost of materials:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className={styles.projectSummarySpan}>{formatCost(totalMaterialsCost)}</span>
        </Col>
      </Row>

      <Row className={`${styles.projectSummaryItem} mx-auto`}>
        <Col xs={summaryLabelCol} sm={summaryLabelCol}>
          <Label className={styles.projectSummaryLabel}>Total cost of equipment:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className={styles.projectSummarySpan}>{formatCost(totalEquipmentCost)}</span>
        </Col>
      </Row>

      <Row className={`${styles.projectSummaryItem} mx-auto`}>
        <Col xs={summaryLabelCol} sm={summaryLabelCol}>
          <Label className={styles.projectSummaryLabel}>Waste:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className={styles.projectSummarySpan}>
            {getMaterialSummary(mostMaterialWaste, 'stockWasted', 'has been wasted!')}
          </span>
        </Col>
      </Row>

      <Row className={`${styles.projectSummaryItem} mx-auto`}>
        <Col xs={summaryLabelCol} sm={summaryLabelCol}>
          <Label className={styles.projectSummaryLabel}>Total members:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className={styles.projectSummarySpan}>{members?.length || 0}</span>
        </Col>
      </Row>

      <Row className={`${styles.projectSummaryItem} mx-auto`}>
        <Col xs={summaryLabelCol} sm={summaryLabelColShort}>
          <Label className={styles.projectSummaryLabel}>Rentals:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={8}>
          <span className={styles.projectSummarySpan}>{getRentalSummary(rentalSummary)}</span>
        </Col>
      </Row>

      <Row className={`${styles.projectSummaryItem} mx-auto`}>
        <Col xs={summaryLabelCol} sm={summaryLabelColShort}>
          <Label className={styles.projectSummaryLabel}>Most material bought:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={8}>
          <span className={styles.projectSummarySpan}>
            {getMaterialSummary(mostMaterialBought, 'stockBought', 'purchased for this project')}
          </span>
        </Col>
      </Row>

      <Row className={`${styles.projectSummaryItem} mx-auto`}>
        <Col xs={summaryLabelCol} sm={summaryLabelColShort}>
          <Label className={styles.projectSummaryLabel}>Stock:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className={styles.projectSummarySpan}>
            {leastMaterialAvailable?.itemType?.name &&
            leastMaterialAvailable?.stockAvailable !== null &&
            leastMaterialAvailable?.stockAvailable !== undefined &&
            leastMaterialAvailable?.itemType?.unit
              ? `${leastMaterialAvailable.itemType.name} is nearly out of stock (${leastMaterialAvailable.stockAvailable} ${leastMaterialAvailable.itemType.unit} remaining)`
              : 'No stock data recorded'}
          </span>
        </Col>
      </Row>
    </div>
  );
}

export default ProjectSummary;
