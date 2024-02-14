import { Label, Form, Row, Col } from 'reactstrap';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { fetchBMProjects } from 'actions/bmdashboard/projectActions';
import { fetchAllReusables } from 'actions/bmdashboard/reusableActions';
import './ReusablesViewStyle.css';

function ReusablesInputs({ reusable, setReusable, project, setProject }) {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects);
  const [formattedProjects, setFormattedProjects] = useState([]);
  const [formattedReusables, setFormattedReusables] = useState([]);
  const reusables = useSelector(state => state.bmReusables.reusablesList);

  useEffect(() => {
    dispatch(fetchBMProjects());
    dispatch(fetchAllReusables());
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
    let reusablesSet = [];
    let _formattedReusables = [{ label: 'All Reusables', value: '0' }]; // Changed to _formattedReusables and label text

    if (reusables.length) {
      if (project.value === '0')
        reusablesSet = [...new Set(reusables.map(rec => rec.itemType?.name))];
      else
        reusablesSet = [
          ...new Set(
            reusables
              .filter(rec => rec.project?.name === project.label)
              .map(rec => rec.itemType?.name),
          ),
        ];
    }

    const temp = reusablesSet.map(reusable => {
      return { label: reusable, value: reusable };
    });
    _formattedReusables = _formattedReusables.concat(temp);
    setFormattedReusables(_formattedReusables);
  }, [reusables, project]);


  const projectHandler = selected => {
    setProject(selected);
    setReusable({ label: 'All Reusables', value: '0' });
  };

  const reusablesHandler = selected => {
    setReusable(selected);
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
                Reusable:
              </Label>
              <Col lg={9} md={9}>
                <Select
                  onChange={reusablesHandler}
                  options={formattedReusables}
                  value={reusable}
                  defaultValue={{ label: 'All Reusables', value: '0' }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default ReusablesInputs;
