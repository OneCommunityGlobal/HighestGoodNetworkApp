import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export function WeeklySummaryFilterModal(props) {
  return (
    <Modal isOpen={props.showFilterModal} className={props.darkMode ? 'text-light' : ''}>
      <ModalHeader className={props.darkMode ? 'bg-space-cadet' : ''}>Add Filter Name</ModalHeader>
      <ModalBody className={props.darkMode ? 'bg-yinmn-blue' : ''}>
        <input
          type="text"
          className="filter-input"
          id="filter-name-input"
          placeholder="Enter filter name"
          onChange={e => {
            props.inputChange(e.target.value);
          }}
        />
      </ModalBody>
      <ModalFooter className={props.darkMode ? 'bg-space-cadet' : ''}>
        <Button
          onClick={() => {
            props.modalClose();
          }}
          color="primary"
          style={props.darkMode ? props.boxStyleDark : props.boxStyle}
        >
          Close
        </Button>
        <Button
          onClick={() => {
            props.onSaveFilter();
          }}
          color="secondary"
        >
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export function WeeklySummaryFilterActionButtons(props) {
  return (
    <>
      {props.selectedFilterId && props.selectedFilterId !== '' && props.selectedCodes.length > 0 && (
        <button
          type="button"
          className="mr-2 btn btn-link"
          onClick={() => {
            props.onClickActionHandler('delete');
          }}
        >
          Delete Filter
        </button>
      )}
      {props.selectedFilterId && props.selectedFilterId !== '' && props.selectedCodes.length > 0 && (
        <button
          type="button"
          className="mr-2 btn btn-link"
          onClick={() => {
            props.onClickActionHandler('update');
          }}
        >
          Update Filter
        </button>
      )}
      {props.selectedCodes && props.selectedCodes.length > 0 && (
        <button
          type="button"
          className="mr-2 btn btn-link"
          onClick={() => {
            props.onClickActionHandler('Save');
          }}
        >
          Save Filter
        </button>
      )}
    </>
  );
}

export function WeeklySummaryFilterLinksList(props) {
  return (
    <div className="Filter_Container">
      {props.availableFilters?.length > 0 &&
        props.availableFilters.map((data, index) => {
          return (
            <button
              type="button"
              className={`filter-link_${index} mb-2 mr-2 btn btn-link`}
              onClick={() => props.onClickHandler(index, data)}
            >
              {data.filterName} &nbsp;
            </button>
          );
        })}
    </div>
  );
}
