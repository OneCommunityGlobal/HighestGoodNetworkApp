/*********************************************************************************
 * Component: MEMBER
 * Author: Henry Ng - 08/01/20
 * Display member of the members list
 ********************************************************************************/
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import ModalDelete from './../../../common/Modal';
import { deleteWBS } from './../../../../actions/wbs';
import { UserRole } from './../../../../utils/enums';
import { getPopupById } from './../../../../actions/popupEditorAction';
import { WBS_DELETE_POPUP_ID } from './../../../../constants/popupId';
const WBSItem = (props) => {
  const [showModalDelete, setShowModalDelete] = useState(false);

  const confirmDelete = () => {
    props.deleteWBS(props.wbsId);
    setShowModalDelete(false);
  };

  return (
    <React.Fragment>
      <tr>
        <th scope="row">
          <div>{props.index}</div>
        </th>
        <td className="members__name">
          <a href={`/wbs/tasks/${props.wbsId}/${props.projectId}/${props.name}`}>{props.name}</a>
        </td>
        {props.auth.user.role === UserRole.Administrator ? (
          <td className="members__assign">
            <button
              className="btn btn-outline-danger btn-sm"
              type="button"
              onClick={(e) => {
                setShowModalDelete(true);
                props.getPopupById(WBS_DELETE_POPUP_ID);
              }}
            >
              <i className="fa fa-minus" aria-hidden="true"></i>
            </button>
          </td>
        ) : null}
      </tr>

      <ModalDelete
        isOpen={showModalDelete}
        closeModal={() => setShowModalDelete(false)}
        confirmModal={() => confirmDelete()}
        modalMessage={props.popupEditor.currPopup.popupContent || ''}
        modalTitle="Confirm Deletion"
      />
    </React.Fragment>
  );
};
const mapStateToProps = (state) => state;
export default connect(mapStateToProps, { deleteWBS, getPopupById })(WBSItem);
