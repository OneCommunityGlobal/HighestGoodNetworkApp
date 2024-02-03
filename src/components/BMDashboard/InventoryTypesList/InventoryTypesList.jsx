import { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { fetchInvTypeByType } from 'actions/bmdashboard/invTypeActions';
import { fetchInvUnits } from 'actions/bmdashboard/invUnitActions';
import { Accordion, Card } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { resetDeleteInvTypeResult } from 'actions/bmdashboard/invTypeActions';
import { toast } from 'react-toastify';
import BMError from '../shared/BMError';
import TypesTable from './TypesTable';
import UnitsTable from './invUnitsTable';
import AccordionToggle from './AccordionToggle';
import './TypesList.css';

export function InventoryTypesList(props) {
  const { deleteInvTypeResult, errors, dispatch } = props;

  // NOTE: depend on redux action implementation
  const categories = ['Materials', 'Consumables', 'Equipments', 'Reusables', 'Tools'];

  const [isError, setIsError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // dispatch inventory type fetch action on load
  useEffect(() => {
    // NOTE: depend on redux action implementation
    dispatch(fetchInvTypeByType('Materials'));
    dispatch(fetchInvTypeByType('Consumables'));
    dispatch(fetchInvTypeByType('Equipments'));
    dispatch(fetchInvTypeByType('Reusables'));
    dispatch(fetchInvTypeByType('Tools'));
    dispatch(fetchInvUnits());
  }, []);

  useEffect(() => {
    if (deleteInvTypeResult.error) {
      toast.error(`Error deleting type.`);
      dispatch(resetDeleteInvTypeResult());
    } else if (deleteInvTypeResult.success) {
      toast.success(`Type deleted.`);
      dispatch(resetDeleteInvTypeResult());
    }
  }, [deleteInvTypeResult]);

  // trigger error state if an error object is added to props
  useEffect(() => {
    if (Object.entries(errors).length) setIsError(true);
  }, [errors]);

  // error state
  if (isError) {
    return (
      <div>
        <h3>All Inventory Types</h3>
        <BMError errors={errors} />
      </div>
    );
  }

  return (
    <div className="types-list-container">
      <h1>All Inventory Types</h1>

      <div className="timestamp-container">
        <span>Time:</span>
        <DatePicker
          selected={currentTime}
          onChange={date => setCurrentTime(date)}
          dateFormat="MM-dd-yyyy hh:mm:ss"
          id="timestamp"
          showTimeInput
          // NOTE: all users can edit since the User Class has not been implemented yet
          // disabled
        />
      </div>

      <Accordion>
        {categories?.map((category, index) => {
          return (
            <Card key={category}>
              <AccordionToggle as={Card.Header} eventKey={index + 1}>
                {category}
              </AccordionToggle>
              <Accordion.Collapse eventKey={index + 1}>
                <Card.Body className="accordion-collapse">
                  <TypesTable category={category} />
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          );
        })}

        <Card>
          <AccordionToggle as={Card.Header} eventKey={categories.length + 1}>
            Unit of Measurement
          </AccordionToggle>
          <Accordion.Collapse eventKey={categories.length + 1}>
            <Card.Body className="accordion-collapse">
              <UnitsTable />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>

      <div className="button-container">
        {/* NOTE: should redirect to the Equipment/Tool List Page, which is not implemented yet */}
        <a href="#back-to-previous" target="_blank" id="back-to-previous" role="button">
          Back to previous list page
        </a>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  errors: state.errors,
  deleteInvTypeResult: state.bmInvTypes.deletedResult,
});

export default connect(mapStateToProps)(InventoryTypesList);
