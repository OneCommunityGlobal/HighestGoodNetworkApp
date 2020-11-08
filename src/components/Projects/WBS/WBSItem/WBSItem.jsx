/*********************************************************************************
 * Component: MEMBER
 * Author: Henry Ng - 08/01/20
 * Display member of the members list
 ********************************************************************************/
import React, { useState } from 'react'
import { connect } from 'react-redux'
import ModalDelete from './../../../common/Modal'
import { deleteWBS } from './../../../../actions/wbs'

const WBSItem = (props) => {
  const [showModalDelete, setShowModalDelete] = useState(false);

  const confirmDelete = () => {
    props.deleteWBS(props.wbsId);
    setShowModalDelete(false);
  }


  return (
    <React.Fragment>
      <tr >
        <th scope="row"><div>{props.index}</div></th>
        <td className='members__name' >
          <a href={`/wbs/tasks/${props.wbsId}/${props.projectId}/${props.name}`}>
            {props.name}
          </a>
        </td>

        <td className='members__assign'>
          <button className="btn btn-outline-danger btn-sm" type="button" onClick={(e) => setShowModalDelete(true)}>
            <i className="fa fa-minus" aria-hidden="true"></i>
          </button>
        </td>

      </tr>


      <ModalDelete
        isOpen={showModalDelete}
        closeModal={() => setShowModalDelete(false)}
        confirmModal={() => confirmDelete()}
        modalMessage={`Are you sure you want to delete this ${props.name}`}
        modalTitle="Confirm Deletion"
      />

    </React.Fragment>
  )
}

export default connect(null, { deleteWBS })(WBSItem)

