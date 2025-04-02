import { Label, Form, Row, Col } from 'reactstrap';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { fetchBMProjects } from 'actions/bmdashboard/projectActions';
import './Equipments.css';

function EquipmentsInputs({ equipment, setEquipment, project, setProject }) {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects);
  const [formattedProjects, setFormattedProjects] = useState([]); // For React-Select
  const [formattedEquipments, setFormattedEquipments] = useState([]); // For React-Select
  const equipments = useSelector(state => state.bmEquipments.equipmentslist);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, []);

  useEffect(() => {
    let _formattedProjects = [{ label: 'All Projects', value: '0' }];
    const tempProjs = projects.map(proj => {
      return { label: proj.name, value: proj._id };
    });
    _formattedProjects = _formattedProjects.concat(tempProjs);
    setFormattedProjects(_formattedProjects);
  }, [projects]);

  useEffect(() => {
    let equipmentsSet = [];
    let _formattedEquipments = [{ label: 'All Equipments', value: '0' }];

    if (equipments.length) {
      if (project.value === '0')
        equipmentsSet = [...new Set(equipments.map(rec => rec.itemType?.name))];
      else
        equipmentsSet = [
          ...new Set(
            equipments
              .filter(rec => rec.project?.name === project.label)
              .map(rec => rec.itemType?.name),
          ),
        ];
    }
    const temp = equipmentsSet.map(con => {
      return { label: con, value: con };
    });
    _formattedEquipments = _formattedEquipments.concat(temp);
    setFormattedEquipments(_formattedEquipments);
  }, [equipments, project]);

  const projectHandler = selected => {
    setProject(selected);
    setEquipment({ label: 'All Equipments', value: '0' });
  };

  const equipmentHandler = selected => {
    setEquipment(selected);
  };

  return (
    <div className="container">
      <Form>
        <Row className="align-items-center InputsMargin">
          <Col className="InputsMargin">
            <Row className="justify-content-start align-items-center">
              <Label for="selectequipment" lg={2} md={3}>
                Project:
              </Label>
              <Col lg={10} md={9}>
                <Select
                  onChange={projectHandler}
                  options={formattedProjects}
                  value={project}
                  defaultValue={{ label: 'All Projects', value: '0' }}
                />
              </Col>
            </Row>
          </Col>

          <Col className="InputsMargin">
            <Row className="justify-content-start align-items-center">
              <Label lg={3} md={3} for="selectproject">
                Equipment:
              </Label>
              <Col lg={9} md={9}>
                <Select
                  onChange={equipmentHandler}
                  options={formattedEquipments}
                  value={equipment}
                  defaultValue={{ label: 'All Equipments', value: '0' }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default EquipmentsInputs;
