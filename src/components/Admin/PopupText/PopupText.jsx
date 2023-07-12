import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import { updatePopupEditor, backupPopupEditor } from './../../../actions/popupEditorAction';
import ModalBackupConfirm from './../../common/Modal';
import axios from 'axios';
import { ENDPOINTS } from './../../../utils/URL';
import './style.css';
import { boxStyle } from 'styles';

const PopupText = props => {
  const [content, setContent] = useState(props.content);
  const [displaySave, setDisplaySave] = useState(true);
  const [pressed, setPressed] = useState(2);
  const [isPopup, setIsPopup] = useState(false);

  const save = id => {
    setDisplaySave(false);
    props.updatePopupEditor(id, content, props.title);
    setTimeout(() => {
      setDisplaySave(true);
    }, 1000);
  };

  const pressBackup = () => {
    setPressed(pressed - 1);
    if (pressed === 1) {
      setIsPopup(true);
    }
  };

  const getBackupData = async popupId => {
    const request = await axios.get(ENDPOINTS.POPUP_EDITOR_BACKUP_BY_ID(popupId));
    setContent(request.data.popupContent);
  };

  return (
    <div>
      <div className="m-cover">
        <div className="m-header">
          {props.title}
          <div className="save">
            {pressed >= 0
              ? `Press ${pressed > 1 ? `${pressed} times` : ``} to backup this data.`
              : 'Backup successful '}{' '}
            {pressed > 0 ? (
              <button
                type="button"
                className="ml-1 p-1 align-middle btn btn-warning"
                onClick={() => pressBackup()}
                style={boxStyle}
              >
                Backup
              </button>
            ) : null}
          </div>
        </div>

        <div className="m-body">
          <Editor
            init={{
              menubar: false,
              plugins: 'advlist autolink autoresize lists link charmap table paste help',
              toolbar:
                'bold italic  underline numlist   |  removeformat link bullist  outdent indent',
              branding: false,
              min_height: 180,
              max_height: 300,
              autoresize_bottom_margin: 1,
            }}
            value={content}
            onEditorChange={content => setContent(content)}
          />
        </div>

        <div className="m-footer">
          {displaySave ? (
            <div className="save">
              <button
                type="button"
                className="ml-1 p-1 align-middle btn btn-success"
                onClick={() => save(props.id)}
                style={boxStyle}
              >
                Apply
              </button>
            </div>
          ) : null}
          <button
            type="button"
            className="btn btn-outline-info"
            onClick={() => getBackupData(props.id)}
            style={boxStyle}
          >
            Restore
          </button>
          <div className="id">{props.id}</div>
        </div>

        <ModalBackupConfirm
          isOpen={isPopup}
          modalMessage={
            'Are you sure you want to save this data to backup store. This action can not be undo.'
          }
          modalTitle={'Warning'}
          closeModal={() => {
            setIsPopup(false);
          }}
          confirmModal={() => {
            props.backupPopupEditor(props.id, content, props.title);
            setIsPopup(false);
            setPressed(pressed - 1);
          }}
        />
      </div>
    </div>
  );
};
export default connect(state => state, { updatePopupEditor, backupPopupEditor })(PopupText);
