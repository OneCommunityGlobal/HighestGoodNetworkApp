import React, { useState } from 'react'
import { connect } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'
import { updatePopupEditor } from './../../../actions/popupEditorAction'
import './style.css'

const PopupText = (props) => {
  const [content, setContent] = useState(props.content);
  const [displaySave, setDisplaySave] = useState(true);
  const save = (id) => {
    setDisplaySave(false);
    props.updatePopupEditor(id, content);
    setTimeout(() => {
      setDisplaySave(true);
    }, 1000);
  }

  return <>
    <div className='m-cover'>
      <div className='m-header'>
        {props.title}
      </div>

      <div className='m-body'>
        <Editor
          init={{
            menubar: false,
            toolbar: 'bold italic',
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
        <div className='id'>{props.id}</div>
        {displaySave ?
          <div className='save'><button type="button" className="ml-1 p-1 align-middle btn btn-success" onClick={() => save(props.id)}>Save</button></div>
          : null}
      </div>
    </div >
  </>
}
export default connect(state => state, { updatePopupEditor })(PopupText)
