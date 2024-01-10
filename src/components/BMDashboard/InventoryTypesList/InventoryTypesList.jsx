import { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { fetchMaterialTypes } from 'actions/bmdashboard/invTypeActions';
import BMError from '../shared/BMError';

export function InventoryTypesList(props) {
  const { invTypes, errors, dispatch } = props;

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
  console.log(invTypes);

  return (
    <div>
      <h3>All Inventory Types</h3>
    </div>
  );
}

const mapStateToProps = state => ({
  invTypes: state.bmInvTypes,
  errors: state.errors,
});

export default connect(mapStateToProps)(InventoryTypesList);
