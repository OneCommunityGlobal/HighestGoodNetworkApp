import { Label, Form, Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { fetchBMProjects } from '~/actions/bmdashboard/projectActions';
import { getReactSelectStyles } from '../../ItemList/selectStyles.js';
import styles from './Equipments.module.css';

const PROJECT_KEY = 'Equipment_selected_projects';
const ITEM_KEY = 'Equipment_selected_items';

function EquipmentsInputs({
  equipment,
  setEquipment,
  project,
  setProject,
  localProjectValues,
  setLocalProjectValues,
  localEquipmentValues,
  setLocalEquipmentValues,
}) {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [projectOptions, setProjectOptions] = useState([]);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const equipments = useSelector(state => state.bmEquipments.equipmentslist);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, []);

  // Load persisted values from localStorage on mount
  useEffect(() => {
    try {
      const savedProjects = JSON.parse(localStorage.getItem(PROJECT_KEY));
      if (Array.isArray(savedProjects) && savedProjects.length > 0) {
        setLocalProjectValues(savedProjects);
        setProject(savedProjects.map(p => p.value));
      }
      const savedEquipments = JSON.parse(localStorage.getItem(ITEM_KEY));
      if (Array.isArray(savedEquipments) && savedEquipments.length > 0) {
        setLocalEquipmentValues(savedEquipments);
        setEquipment(savedEquipments.map(e => e.value));
      }
    } catch (error) {
      console.error('Failed to parse cached equipment filters:', error);
    }
  }, []);

  // Build project options from Redux
  useEffect(() => {
    const options = projects.map(proj => ({ label: proj.name, value: proj._id }));
    setProjectOptions(options);
  }, [projects]);

  // Build equipment options filtered by selected projects
  useEffect(() => {
    if (!equipments.length) return;
    let list = equipments;
    if (project.length > 0) {
      list = equipments.filter(rec => project.includes(rec.project?._id));
    }
    const names = [...new Set(list.map(rec => rec.itemType?.name).filter(Boolean))];
    setEquipmentOptions(names.map(name => ({ label: name, value: name })));
  }, [equipments, project]);

  const handleProjectChange = selected => {
    const values = selected || [];
    setLocalProjectValues(values);
    setProject(values.map(v => v.value));
    setLocalEquipmentValues([]);
    setEquipment([]);
    localStorage.setItem(PROJECT_KEY, JSON.stringify(values));
    localStorage.removeItem(ITEM_KEY);
  };

  const handleEquipmentChange = selected => {
    const values = selected || [];
    setLocalEquipmentValues(values);
    setEquipment(values.map(v => v.value));
    localStorage.setItem(ITEM_KEY, JSON.stringify(values));
  };

  return (
    <div className={styles.container}>
      <Form>
        <Row className={`align-items-center ${styles.InputsMargin}`}>
          <Col className={`${styles.InputsMargin}`}>
            <Row className="justify-content-start align-items-center">
              <Label for="select-equipment-project" lg={2} md={3}>
                Project:
              </Label>
              <Col lg={10} md={9}>
                <Select
                  inputId="select-equipment-project"
                  isMulti
                  isSearchable
                  isClearable
                  options={projectOptions}
                  value={localProjectValues}
                  onChange={handleProjectChange}
                  isDisabled={!projects?.length}
                  placeholder="Search or select projects..."
                  classNamePrefix="react-select"
                  styles={getReactSelectStyles(darkMode)}
                />
              </Col>
            </Row>
          </Col>

          <Col className={`${styles.InputsMargin}`}>
            <Row className="justify-content-start align-items-center">
              <Label lg={3} md={3} for="select-equipment-type">
                Equipment:
              </Label>
              <Col lg={9} md={9}>
                <Select
                  inputId="select-equipment-type"
                  isMulti
                  isSearchable
                  isClearable
                  options={equipmentOptions}
                  value={localEquipmentValues}
                  onChange={handleEquipmentChange}
                  isDisabled={!equipments?.length}
                  placeholder="Search or select equipment..."
                  classNamePrefix="react-select"
                  styles={getReactSelectStyles(darkMode)}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

EquipmentsInputs.propTypes = {
  equipment: PropTypes.array.isRequired,
  setEquipment: PropTypes.func.isRequired,
  project: PropTypes.array.isRequired,
  setProject: PropTypes.func.isRequired,
  localProjectValues: PropTypes.array.isRequired,
  setLocalProjectValues: PropTypes.func.isRequired,
  localEquipmentValues: PropTypes.array.isRequired,
  setLocalEquipmentValues: PropTypes.func.isRequired,
};

export default EquipmentsInputs;
