import { Label, Form, Row, Col } from 'reactstrap';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { fetchBMProjects } from 'actions/bmdashboard/projectActions';
import './Consumables.css';

function ConsumablesInputs({ consumable, setConsumable, project, setProject }) {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects);
  const [formattedProjects, setFormattedProjects] = useState([]); // For React-Select
  const [formattedConsumables, setFormattedConsumables] = useState([]); // For React-Select
  const consumables = useSelector(state => state.bmConsumables.consumableslist);

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
    let consumablesSet = [];
    let _formattedConsumables = [{ label: 'All Consumables', value: '0' }];

    if (consumables.length) {
      if (project.value === '0')
        consumablesSet = [...new Set(consumables.map(rec => rec.itemType?.name))];
      else
        consumablesSet = [
          ...new Set(
            consumables
              .filter(rec => rec.project?.name === project.label)
              .map(rec => rec.itemType?.name),
          ),
        ];
    }
    const temp = consumablesSet.map(con => {
      return { label: con, value: con };
    });
    _formattedConsumables = _formattedConsumables.concat(temp);
    setFormattedConsumables(_formattedConsumables);
  }, [consumables, project]);

  const projectHandler = selected => {
    setProject(selected);
    setConsumable({ label: 'All Consumables', value: '0' });
  };

  const consumableHandler = selected => {
    setConsumable(selected);
  };

  return (
    <div className="container">
      <Form>
        <Row className="align-items-center InputsMargin">
          <Col className="InputsMargin">
            <Row className="justify-content-start align-items-center">
              <Label for="selectconsumable" lg={2} md={3}>
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
                Consumable:
              </Label>
              <Col lg={9} md={9}>
                <Select
                  onChange={consumableHandler}
                  options={formattedConsumables}
                  value={consumable}
                  defaultValue={{ label: 'All Consumables', value: '0' }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default ConsumablesInputs;
