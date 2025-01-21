/*********************************************************************************
 * Component: MEMBER
 * Author: Henry Ng - 08/01/20
 * Display member of the members list
 ********************************************************************************/
import React, { useState } from 'react';
import { connect, useSelector } from 'react-redux';
import ModalDelete from './../../../common/Modal';
import { deleteWbs } from './../../../../actions/wbs';
import { getPopupById } from './../../../../actions/popupEditorAction';
import { WBS_DELETE_POPUP_ID } from './../../../../constants/popupId';
import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';
import { Link } from 'react-router-dom';
import { NavItem } from 'reactstrap';


const WBSItem = ({ darkMode, index, name, wbsId, projectId, getPopupById, deleteWbs, hasPermission, popupEditor }) => {

  const [showModalDelete, setShowModalDelete] = useState(false);

  const canDeleteWBS = hasPermission('deleteWbs');

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
        <th scope="row">
          <div>{index}</div>
        </th>
        <td className="members__name">
          <NavItem tag={Link} to={`/wbs/tasks/${wbsId}/${projectId}/${name}`} className={darkMode ? 'text-azure' : ''}>
            {name}
          </NavItem>
        </td>
        {canDeleteWBS ? (
          <td className="members__assign">
            <button
              className="btn btn-outline-danger btn-sm"
              type="button"
              onClick={handleOpenDeleteModal}
              style={darkMode ? {} : boxStyle}
            >
              <i className="fa fa-minus" aria-hidden="true"></i>
            </button>
          </td>
        ) : null}
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
const mapStateToProps = (state) => state;
export default connect(mapStateToProps, {
  deleteWbs,
  getPopupById,
  hasPermission,
})(WBSItem);
