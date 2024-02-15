import { Label, Form, Row, Col } from 'reactstrap';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { fetchBMProjects } from 'actions/bmdashboard/projectActions';
import './ReusablesViewStyle.css';

const DEFAULT_PROJECT = { label: 'All Projects', value: '0' };
const DEFAULT_REUSABLE = { label: 'All Reusables', value: '0' };

function formatDropdownOptions(items, labelKey = 'name', valueKey = '_id') {
  return items.map(item => ({ label: item[labelKey], value: item[valueKey] }));
}

function ReusablesInputs({ reusable, setReusable, project, setProject }) {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects);
  const [formattedProjects, setFormattedProjects] = useState([]);
  const [formattedReusables, setFormattedReusables] = useState([]);
  const reusables = useSelector(state => state.bmReusables.reusablesList);

  const formatProjects = useCallback(() => {
    const projectOptions = formatDropdownOptions(projects);
    setFormattedProjects([DEFAULT_PROJECT, ...projectOptions]);
  }, [projects]);

  const formatReusables = useCallback(() => {
    const filteredReusables =
      project.value === '0'
        ? reusables
        : reusables.filter(rec => rec.project?.name === project.label);
    const uniqueReusables = [...new Set(filteredReusables.map(rec => rec.itemType?.name))];
    const reusableOptions = uniqueReusables.map(name => ({ label: name, value: name }));
    setFormattedReusables([DEFAULT_REUSABLE, ...reusableOptions]);
  }, [reusables, project]);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  useEffect(() => {
    formatProjects();
  }, [formatProjects]);

  useEffect(() => {
    formatReusables();
  }, [formatReusables]);

  const projectHandler = selectedOption => {
    setProject(selectedOption);
    setReusable(DEFAULT_REUSABLE);
  };

  const reusablesHandler = selectedOption => {
    setReusable(selectedOption);
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
                  defaultValue={DEFAULT_PROJECT}
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
                  defaultValue={DEFAULT_REUSABLE}
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
