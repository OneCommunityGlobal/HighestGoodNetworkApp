import { Row, Col, Label } from 'reactstrap';
// function calculateTotalCost(items) {
//   return items.reduce((total, item) => total + parseInt(item.cost, 10), 0);
// }

function ProjectSummary({ project }) {
  // const totalMaterialsCost = calculateTotalCost(project.materials);
  // const totalEquipmentCost = calculateTotalCost(project.tools);

  return (
    <div className="project-summary_content">
      <Row className="project-summary_header">
        <h2>{project.name} summary</h2>
      </Row>
      <Row className="project-summary_item">
        <Col xs="6">
          <Label className="project-summary_label">Total hours of work done:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">25 hrs</span>
        </Col>
      </Row>
      <Row className="project-summary_item">
        <Col xs="6">
          <Label className="project-summary_label">Total cost of materials:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">250 USD</span>
        </Col>
      </Row>
      <Row className="project-summary_item">
        <Col xs="6">
          <Label className="project-summary_label">Total cost of equipment:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">150 USD</span>
        </Col>
      </Row>
      <Row className="project-summary_item">
        <Col xs="6">
          <Label className="project-summary_label">Total wastage:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">25 USD</span>
        </Col>
      </Row>
      <Row className="project-summary_item">
        <Col xs="6">
          <Label className="project-summary_label">No of teams:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">{project.team.length}</span>
        </Col>
      </Row>
      <Row className="project-summary_item">
        <Col xs="6">
          <Label className="project-summary_label">Total number of tools/equipment: </Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">5</span>
        </Col>
      </Row>
      <Row className="project-summary_item">
        <Col xs="6">
          <Label className="project-summary_label">Equipment return due in 72hrs:</Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">Yes</span>
        </Col>
      </Row>
      <Row className="project-summary_item">
        <Col xs="6">
          <Label className="project-summary_label">
            Number of materials with quantity less than 20% left:
          </Label>
        </Col>
        <Col xs="6">
          <span className="project-summary_span">None</span>
        </Col>
      </Row>
  </div>
  );
}

export default ProjectSummary;
