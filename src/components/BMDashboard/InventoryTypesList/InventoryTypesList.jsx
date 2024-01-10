import { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { fetchMaterialTypes } from 'actions/bmdashboard/invTypeActions';
import { Accordion, Card } from 'react-bootstrap';
import BMError from '../shared/BMError';

import TypesTable from './TypesTable';
import './TypesList.css';

// NOTE: placeholder data
const placeText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.s';

export function InventoryTypesList(props) {
  const { materialTypes, errors, dispatch } = props;

  const [isError, setIsError] = useState(false);

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

  // NOTE: logs
  // console.log(materialTypes);

  return (
    <div className="types-list-container">
      <h3>All Inventory Types</h3>

      <Accordion defaultActiveKey="0" className="accordion">
        <Card className="card">
          <Accordion.Toggle as={Card.Header} eventKey="0" className="card-header">
            Material
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="0">
            <Card.Body>
              <TypesTable itemTypes={materialTypes} />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card>
          <Accordion.Toggle as={Card.Header} eventKey="1">
            Tool
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="1">
            <Card.Body>{placeText}</Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card>
          <Accordion.Toggle as={Card.Header} eventKey="2">
            Equipment
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="2">
            <Card.Body>{placeText}</Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card>
          <Accordion.Toggle as={Card.Header} eventKey="3">
            Consumable
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="3">
            <Card.Body>{placeText}</Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card>
          <Accordion.Toggle as={Card.Header} eventKey="4">
            Reusable
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="4">
            <Card.Body>{placeText}</Card.Body>
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
