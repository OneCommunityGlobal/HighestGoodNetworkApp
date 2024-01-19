import { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { fetchMaterialTypes } from 'actions/bmdashboard/invTypeActions';
import { Accordion, Card } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import BMError from '../shared/BMError';
import TypesTable from './TypesTable';
import './TypesList.css';
import { equipmentTypes, consumableTypes, toolTypes, reusableTypes } from './mockData';
import AccordionToggle from './AccordionToggle';

export function InventoryTypesList(props) {
  const { materialTypes, errors, dispatch } = props;

  const [isError, setIsError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // dispatch inventory type fetch action on load
  // NOTE: only materials for now
  useEffect(() => {
    dispatch(fetchMaterialTypes());
  }, []);

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
        <Card>
          <AccordionToggle as={Card.Header} eventKey="0">
            Material
          </AccordionToggle>
          <Accordion.Collapse eventKey="0">
            <Card.Body>
              <TypesTable itemTypes={materialTypes} category="Material" />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card>
          <AccordionToggle as={Card.Header} eventKey="1">
            Tool
          </AccordionToggle>
          <Accordion.Collapse eventKey="1">
            <Card.Body>
              <TypesTable itemTypes={toolTypes} category="Tool" />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card>
          <AccordionToggle as={Card.Header} eventKey="2">
            Equipment
          </AccordionToggle>
          <Accordion.Collapse eventKey="2">
            <Card.Body>
              <TypesTable itemTypes={equipmentTypes} category="Equipment" />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card>
          <AccordionToggle as={Card.Header} eventKey="3">
            Consumable
          </AccordionToggle>
          <Accordion.Collapse eventKey="3">
            <Card.Body>
              <TypesTable itemTypes={consumableTypes} category="Consumable" />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card>
          <AccordionToggle as={Card.Header} eventKey="4">
            Reusable
          </AccordionToggle>
          <Accordion.Collapse eventKey="4">
            <Card.Body>
              <TypesTable itemTypes={reusableTypes} category="Reusable" />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>

      <div className="button-container">
        {/* TODO: should redirect to the Equipment/Tool List Page, which is not implemented yet */}
        <a href="#back-to-previous" target="_blank" id="back-to-previous" role="button">
          Back to previous list page
        </a>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  // invTypes: state.bmInvTypes,
  materialTypes: state.bmInvTypes,
  errors: state.errors,
});

export default connect(mapStateToProps)(InventoryTypesList);
