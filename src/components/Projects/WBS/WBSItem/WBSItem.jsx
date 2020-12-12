/*********************************************************************************
 * Component: MEMBER
 * Author: Henry Ng - 08/01/20
 * Display member of the members list
 ********************************************************************************/
import React, { useState } from 'react'
import { connect } from 'react-redux'
import ModalDelete from './../../../common/Modal'
import { deleteWBS } from './../../../../actions/wbs'
import { UserRole } from './../../../../utils/enums'

const WBSItem = (props) => {
  console.log(props);


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
        {props.auth.user.role === UserRole.Administrator ?
          <td className='members__assign'>
            <button className="btn btn-outline-danger btn-sm" type="button" onClick={(e) => setShowModalDelete(true)}>
              <i className="fa fa-minus" aria-hidden="true"></i>
            </button>
          </td>
          : null}

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
const mapStateToProps = state => state;
export default connect(mapStateToProps, { deleteWBS })(WBSItem)

