import moment from 'moment';
import { Input, Label, Form, Row, Col } from 'reactstrap';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { fetchBMProjects } from '~/actions/bmdashboard/projectActions';

function UpdateMaterialsBulkInputs({ date, setDate, project, setProject }) {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects);
  const darkMode = useSelector(state => state.theme.darkMode);
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
                  classNamePrefix="react-select"
                  styles={{
                    control: base => ({
                      ...base,
                      backgroundColor: darkMode ? '#0f172a' : base.backgroundColor,
                      borderColor: darkMode ? '#475569' : base.borderColor,
                      color: darkMode ? '#ffffff' : base.color,
                    }),
                    menu: base => ({
                      ...base,
                      backgroundColor: darkMode ? '#0f172a' : base.backgroundColor,
                      borderColor: darkMode ? '#475569' : base.borderColor,
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: darkMode
                        ? state.isSelected
                          ? '#1C8BCC'
                          : state.isFocused
                          ? '#334155'
                          : '#0f172a'
                        : base.backgroundColor,
                      color: darkMode ? '#ffffff' : base.color,
                    }),
                    singleValue: base => ({
                      ...base,
                      color: darkMode ? '#ffffff' : base.color,
                    }),
                    placeholder: base => ({
                      ...base,
                      color: darkMode ? '#cbd5e1' : base.color,
                    }),
                    input: base => ({
                      ...base,
                      color: darkMode ? '#ffffff' : base.color,
                    }),
                  }}
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
