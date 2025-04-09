import { Row, Col, Label } from 'reactstrap';
import { useState, useEffect } from 'react';
import './ProjectSummary.css'; // Import the CSS file

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

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const summaryLabelCol = windowWidth < 700 ? 12 : 4; // full-width on smaller screens
  const summaryValueCol = windowWidth < 700 ? 12 : 8; // full-width on smaller screens
  const summaryLabelColShort = windowWidth < 700 ? 6 : 4; // adjust for shorter labels

  return (
    <div className="project-summary_content">
      <Row className="project-summary_header mx-auto">
        <h2>{project.name} Summary</h2>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs={summaryLabelCol} sm={summaryLabelCol}>
          <Label className="project-summary_label">Total hours of work done:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className="project-summary_span">{hoursWorked}</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs={summaryLabelCol} sm={summaryLabelCol}>
          <Label className="project-summary_label">Total cost of materials:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className="project-summary_span">{totalMaterialsCost} USD</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs={summaryLabelCol} sm={summaryLabelCol}>
          <Label className="project-summary_label">Total cost of equipment:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className="project-summary_span">{totalEquipmentCost} USD</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs={summaryLabelCol} sm={summaryLabelCol}>
          <Label className="project-summary_label">Waste:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className="project-summary_span">
            {mostMaterialWaste?.stockWasted} {mostMaterialWaste?.itemType.unit} of{' '}
            {mostMaterialWaste?.itemType.name} has been wasted!
          </span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs={summaryLabelCol} sm={summaryLabelCol}>
          <Label className="project-summary_label">Total members:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol}>
          <span className="project-summary_span">{members.length}</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs={summaryLabelCol} sm={summaryLabelColShort}>
          <Label className="project-summary_label">Rentals:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={8}>
          <span className="project-summary_span">Excavator 2 rental ends in 72 hours!</span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs={summaryLabelCol} sm={summaryLabelColShort}>
          <Label className="project-summary_label">Most material bought:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={8} className="project-summary_value">
          <span className="project-summary_span">
            {mostMaterialBought?.stockBought} {mostMaterialBought?.itemType.unit} of{' '}
            {mostMaterialBought?.itemType.name} purchased for this project
          </span>
        </Col>
      </Row>
      <Row className="project-summary_item mx-auto">
        <Col xs={summaryLabelCol} sm={summaryLabelColShort}>
          <Label className="project-summary_label">Stock:</Label>
        </Col>
        <Col xs={summaryValueCol} sm={summaryValueCol} className="project-summary_value">
          <span className="project-summary_span">
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
