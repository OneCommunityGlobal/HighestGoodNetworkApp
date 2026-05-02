import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchInvTypeByType } from '~/actions/bmdashboard/invTypeActions';
import { fetchInvUnits } from '~/actions/bmdashboard/invUnitActions';
import { Accordion, Card } from 'react-bootstrap';
import BMError from '../shared/BMError';
import UnitsTable from './invUnitsTable';
import AccordionToggle from './AccordionToggle';
import styles from './TypesList.module.css';

const categories = [
  { label: 'Materials', route: '/bmdashboard/materials' },
  { label: 'Consumables', route: '/bmdashboard/consumables' },
  { label: 'Equipments', route: '/bmdashboard/equipment' },
  { label: 'Reusables', route: '/bmdashboard/reusables' },
  { label: 'Tools', route: '/bmdashboard/tools' },
];

export function InventoryTypesList(props) {
  const { invUnits, errors, dispatch } = props;
  const [isError, setIsError] = useState(false);

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
    <div className={styles.typesListContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>All Inventory Types</h1>
        <p className={styles.pageSubtitle}>Select a category to view and manage inventory</p>
      </div>

      {/* Category Cards Grid */}
      <div className={styles.categoryGrid}>
        {categories.map(({ label, route }) => (
          <Link key={label} to={route} className={styles.categoryCard}>
            <span className={styles.categoryCardLabel}>{label}</span>
            <div className={styles.categoryCardArrow}>›</div>
          </Link>
        ))}
      </div>

      {/* Unit of Measurement */}
      <div className={styles.unitSection}>
        <h2 className={styles.unitSectionTitle}>Unit of Measurement</h2>
        <Accordion>
          <Card className={styles.unitCard}>
            <AccordionToggle as={Card.Header} eventKey={1} className={styles.cardHeader}>
              View all units
            </AccordionToggle>
            <Accordion.Collapse eventKey={1}>
              <Card.Body className={styles.accordionCollapse}>
                <UnitsTable invUnits={invUnits} />
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  errors: state.errors,
  invUnits: state.bmInvUnits.list,
});

export default connect(mapStateToProps)(InventoryTypesList);
