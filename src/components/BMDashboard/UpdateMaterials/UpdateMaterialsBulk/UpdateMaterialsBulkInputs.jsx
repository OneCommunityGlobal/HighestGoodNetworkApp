import './UpdateMaterialsBulk.css';
import * as moment from 'moment';
import { Input, Label, Form, Row, Col } from 'reactstrap';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import Select from 'react-select';
import { fetchBMProjects } from 'actions/bmdashboard/projectActions';

function UpdateMaterialsBulkInputs({ date, setDate, project, setProject }) {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects);
  const [formattedProjects, setFormattedProjects] = useState([]);
  const today = moment(new Date()).format('YYYY-MM-DD');
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

  const dateHandler = e => {
    const newDate = moment(e.target.value).format('YYYY-MM-DD');
    setDate(newDate);
  };
  const changeProjectHandler = selectedOption => {
    const proj = selectedOption;
    setProject(proj);
  };

  return (
    <div className="container">
      <Form>
        <Row className="align-items-center logMaterialInputRow">
          <Col lg={6} md={12} className="logMaterialInputCol">
            <Row className="justify-content-start align-items-center">
              <Label for="selectdate" lg={2} md={3}>
                Date:
              </Label>
              <Col lg={10} md={9}>
                <Input
                  max={today}
                  value={date}
                  onChange={dateHandler}
                  id="selectdate"
                  name="select"
                  type="date"
                />
              </Col>
            </Row>
          </Col>

          <Col lg={6} md={12} className="logMaterialInputCol">
            <Row className="justify-content-start align-items-center">
              <Label lg={3} md={3} for="selectproject">
                Project:
              </Label>
              <Col lg={9} md={9}>
                <Select
                  onChange={changeProjectHandler}
                  options={formattedProjects}
                  value={project}
                  defaultValue={{ label: 'All Projects', value: '0' }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default UpdateMaterialsBulkInputs;
