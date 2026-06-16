import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';
import { fetchInvTypeByType } from '~/actions/bmdashboard/invTypeActions';
import { fetchInvUnits } from '~/actions/bmdashboard/invUnitActions';
import { Accordion, Card, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  FaCubes,
  FaShoppingCart,
  FaTools,
  FaRecycle,
  FaWrench,
  FaRulerCombined,
} from 'react-icons/fa';
import BMError from '../shared/BMError';
import TypesTable from './TypesTable';
import UnitsTable from './invUnitsTable';
import AccordionToggle from './AccordionToggle';
import styles from './TypesList.module.css';

const categoryIcons = {
  Materials: <FaCubes />,
  Consumables: <FaShoppingCart />,
  Equipment: <FaTools />,
  Reusables: <FaRecycle />,
  Tools: <FaWrench />,
};

export function InventoryTypesList(props) {
  const { invUnits, errors, dispatch } = props;
  const categories = [
    { label: 'Materials', route: '/bmdashboard/materials' },
    { label: 'Consumables', route: '/bmdashboard/consumables' },
    { label: 'Equipment', route: '/bmdashboard/equipment' },
    { label: 'Reusables', route: '/bmdashboard/reusables' },
    { label: 'Tools', route: '/bmdashboard/tools' },
  ];

  const [isError, setIsError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    dispatch(fetchInvTypeByType('Materials'));
    dispatch(fetchInvTypeByType('Consumables'));
    dispatch(fetchInvTypeByType('Equipments'));
    dispatch(fetchInvTypeByType('Reusables'));
    dispatch(fetchInvTypeByType('Tools'));
    dispatch(fetchInvUnits());
  }, []);

  useEffect(() => {
    if (Object.entries(errors).length) setIsError(true);
  }, [errors]);

  if (isError) {
    return (
      <div>
        <h3>All Inventory Types</h3>
        <BMError errors={errors} />
      </div>
    );
  }

  return (
    <div className={`${styles.typesListContainer}`}>
      <h1>All Inventory Types</h1>
      <div className={`${styles.timestampContainer}`}>
        <span>Time:</span>
        <DatePicker
          selected={currentTime}
          onChange={date => setCurrentTime(date)}
          dateFormat="MM-dd-yyyy HH:mm:ss"
          id="timestamp"
          showTimeInput
          timeFormat="HH:mm"
          portalId="root"
          popperPlacement="bottom-start"
        />
      </div>
      <Accordion>
        {categories?.map((category, index) => {
          return (
            <Card key={category.label}>
              <AccordionToggle as={Card.Header} eventKey={index + 1}>
                <span className={styles.categoryIcon}>{categoryIcons[category.label]}</span>
                <Link
                  to={category.route}
                  className={styles.categoryLink}
                  onClick={e => e.stopPropagation()}
                >
                  {category.label}
                </Link>
              </AccordionToggle>
              <Accordion.Collapse eventKey={index + 1}>
                <Card.Body className={`${styles.accordionCollapse}`}>
                  <TypesTable category={category.label} />
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          );
        })}
        <Card>
          <AccordionToggle as={Card.Header} eventKey={categories.length + 1}>
            <span className={styles.categoryIcon}>
              <FaRulerCombined />
            </span>
            <Link
              to="/bmdashboard/units"
              className={styles.categoryLink}
              onClick={e => e.stopPropagation()}
            >
              Unit of Measurement
            </Link>
          </AccordionToggle>
          <Accordion.Collapse eventKey={categories.length + 1}>
            <Card.Body className={`${styles.accordionCollapse}`}>
              <UnitsTable invUnits={invUnits} />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </div>
  );
}

const mapStateToProps = state => ({
  errors: state.errors,
  invUnits: state.bmInvUnits.list,
});

export default connect(mapStateToProps)(InventoryTypesList);
