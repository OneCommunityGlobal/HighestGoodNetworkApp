import { Label, Form, Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { fetchBMProjects } from '~/actions/bmdashboard/projectActions';
import styles from './Equipments.module.css';

function EquipmentsInputs({ equipment, setEquipment, project, setProject }) {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [formattedProjects, setFormattedProjects] = useState([]);
  const [formattedEquipments, setFormattedEquipments] = useState([]);
  const equipments = useSelector(state => state.bmEquipments.equipmentslist);

  // Helper function to get option styles based on state and dark mode
  const getOptionStyles = (provided, state) => {
    let backgroundColor;

    if (state.isFocused) {
      backgroundColor = darkMode ? '#3d3d3d' : '#f8f9fa';
    } else {
      backgroundColor = darkMode ? '#2d2d2d' : '#ffffff';
    }

    return {
      ...provided,
      backgroundColor,
      color: darkMode ? '#ffffff' : '#000000',
      '&:hover': {
        backgroundColor: darkMode ? '#3d3d3d' : '#e9ecef',
      },
    };
  };

  // Custom styles for react-select in dark mode
  const customSelectStyles = {
    control: provided => ({
      ...provided,
      backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
      borderColor: darkMode ? '#404040' : '#ced4da',
      color: darkMode ? '#ffffff' : '#000000',
      '&:hover': {
        borderColor: darkMode ? '#4dabf7' : '#80bdff',
      },
    }),
    menu: provided => ({
      ...provided,
      backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
      border: darkMode ? '1px solid #404040' : '1px solid #ced4da',
    }),
    option: getOptionStyles,
    singleValue: provided => ({
      ...provided,
      color: darkMode ? '#ffffff' : '#000000',
    }),
    input: provided => ({
      ...provided,
      color: darkMode ? '#ffffff' : '#000000',
    }),
    placeholder: provided => ({
      ...provided,
      color: darkMode ? '#888888' : '#6c757d',
    }),
  };

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
      if (project.value === '0') {
        equipmentsSet = [...new Set(equipments.map(rec => rec.itemType?.name))];
      } else {
        equipmentsSet = [
          ...new Set(
            equipments
              .filter(rec => rec.project?.name === project.label)
              .map(rec => rec.itemType?.name),
          ),
        ];
      }
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
        <Row className={`align-items-center ${styles.InputsMargin}`}>
          <Col className={`${styles.InputsMargin}`}>
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
                  styles={customSelectStyles}
                />
              </Col>
            </Row>
          </Col>

          <Col className={`${styles.InputsMargin}`}>
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
                  styles={customSelectStyles}
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
  equipment: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  }).isRequired,
  setEquipment: PropTypes.func.isRequired,
  project: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  }).isRequired,
  setProject: PropTypes.func.isRequired,
};

export default EquipmentsInputs;
