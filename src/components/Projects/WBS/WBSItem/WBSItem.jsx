/*********************************************************************************
 * Component: MEMBER
 * Author: Henry Ng - 08/01/20
 * Display member of the members list
 ********************************************************************************/
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect, useSelector } from 'react-redux';
import ModalDelete from './../../../common/Modal';
import { deleteWbs } from './../../../../actions/wbs';
import { getPopupById } from './../../../../actions/popupEditorAction';
import { WBS_DELETE_POPUP_ID } from './../../../../constants/popupId';
import hasPermission from '~/utils/permissions';
import { boxStyle } from '~/styles';
import { Link } from 'react-router-dom';
import { NavItem } from 'reactstrap';


import { permissions } from '../../../../utils/constants';
const WBSItem = ({ darkMode, index, name, wbsId, projectId, getPopupById, deleteWbs, hasPermission, popupEditor, taskSelectionMode, taskSelectionReturnPath }) => {

  const [showModalDelete, setShowModalDelete] = useState(false);

  const canDeleteWBS = hasPermission(permissions.deleteWbs);

  const handleDelete = () => {
    deleteWbs(wbsId);
    setShowModalDelete(false);
  };

  const handleOpenDeleteModal = () => {
    setShowModalDelete(true);
    getPopupById(WBS_DELETE_POPUP_ID);
  };

  return (
    <React.Fragment>
      <tr>
        <th scope="row" style={{ maxWidth: '150px', textAlign: 'center' }}>
          {index}
        </th>
        <td style={{ textAlign: 'left' }}>
          <NavItem tag={Link} to={{
            pathname: `/wbs/tasks/${wbsId}/${projectId}/${name}`,
            state: taskSelectionMode
              ? { taskSelectionMode: true, returnPath: taskSelectionReturnPath }
              : undefined,
          }} className={darkMode ? 'text-azure' : ''}>
            {name}
          </NavItem>
        </td>
        <td style={{ width: '50px', textAlign: 'center' }}>
          {canDeleteWBS ? (
            <button
              className="btn btn-outline-danger btn-sm"
              type="button"
              onClick={handleOpenDeleteModal}
              style={darkMode ? {} : boxStyle}
            >
              <i className="fa fa-minus" aria-hidden="true"></i>
            </button>
          ) : null}
        </td>
      </tr>

      <ModalDelete
        isOpen={showModalDelete}
        closeModal={() => setShowModalDelete(false)}
        confirmModal={handleDelete}
        modalMessage={popupEditor.currPopup.popupContent || ''}
        modalTitle="Confirm Deletion"
        darkMode={darkMode}
      />
    </React.Fragment>
  );
};

WBSItem.propTypes = {
  darkMode: PropTypes.bool,
  index: PropTypes.number,
  name: PropTypes.string,
  wbsId: PropTypes.string,
  projectId: PropTypes.string,
  getPopupById: PropTypes.func,
  deleteWbs: PropTypes.func,
  hasPermission: PropTypes.func,
  popupEditor: PropTypes.shape({
    currPopup: PropTypes.shape({
      popupContent: PropTypes.string,
    }),
  }),
  taskSelectionMode: PropTypes.bool,
  taskSelectionReturnPath: PropTypes.string,
};

WBSItem.defaultProps = {
  darkMode: false,
  index: 0,
  name: '',
  wbsId: '',
  projectId: '',
  getPopupById: () => {},
  deleteWbs: () => {},
  hasPermission: () => false,
  popupEditor: { currPopup: { popupContent: '' } },
  taskSelectionMode: false,
  taskSelectionReturnPath: '',
};

const mapStateToProps = (state) => state;
export default connect(mapStateToProps, {
  deleteWbs,
  getPopupById,
  hasPermission,
})(WBSItem);
