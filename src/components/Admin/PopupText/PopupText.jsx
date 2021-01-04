import React, { useState } from 'react'
import { connect } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'
import { updatePopupEditor, backupPopupEditor } from './../../../actions/popupEditorAction'
import axios from 'axios'
import { ENDPOINTS } from "./../../../utils/URL";
import './style.css'

const PopupText = (props) => {
  const [content, setContent] = useState(props.content);
  const [displaySave, setDisplaySave] = useState(true);
  const [pressed, setPressed] = useState(7);

  const save = (id) => {
    setDisplaySave(false);
    props.updatePopupEditor(id, content);
    setTimeout(() => {
      setDisplaySave(true);
    }, 1000);
  }

  const pressBackup = (id) => {
    setPressed(pressed - 1);
    if (pressed === 1) {
      props.backupPopupEditor(id, content);
    }
  }

  const getBackupData = async (popupId) => {
    const request = await axios.get(ENDPOINTS.POPUP_EDITOR_BACKUP_BY_ID(popupId));
    setContent(request.data.popupContent);
  }

  return <>
    <div className='m-cover'>
      <div className='m-header'>
        {props.title}
        <div className='save'>{pressed > 0 ? (`Press ${pressed > 1 ? `${pressed} times` : `${pressed} time`} to backup this data.`) : 'Backup successful'} {pressed > 0 ? <button type="button" className="ml-1 p-1 align-middle btn btn-warning" onClick={() => pressBackup(props.id)}>Backup</button> : null}</div>
      </div>

      <div className='m-body'>
        <Editor
          init={{
            menubar: false,
            plugins:
              'advlist autolink autoresize lists link charmap table paste help',
            toolbar: 'bold italic  underline numlist   |  removeformat link bullist  outdent indent',
            branding: false,
            min_height: 180,
            max_height: 300,
            autoresize_bottom_margin: 1,
          }}
          value={content}
          onEditorChange={(content) => setContent(content)}
        />

      </div>

      <div className='m-footer'>

        {displaySave ?
          <div className='save'><button type="button" className="ml-1 p-1 align-middle btn btn-success" onClick={() => save(props.id)}>Apply
          </button></div>
          : null}
        <button type="button" className="btn btn-outline-info" onClick={() => getBackupData(props.id)}>Restore</button>
        <div className='id'>{props.id}</div>

      </div>
    </div >
  </>
}
export default connect(state => state, { updatePopupEditor, backupPopupEditor })(PopupText)
