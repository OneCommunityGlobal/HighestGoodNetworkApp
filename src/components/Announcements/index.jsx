import { useState } from 'react';
import './Announcements.css';
import { useDispatch } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'; // Import Editor from TinyMCE
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';

function Announcements() {
  const dispatch = useDispatch();
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [headerContent, setHeaderContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [testEmail, setTestEmail] = useState('');

  const handleEmailListChange = e => {
    const emails = e.target.value.split(',');
    setEmailList(emails);
  };
  
  const handleHeaderContentChange = e => {
    setHeaderContent(e.target.value);
  }

  const convertImageToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addImageToEmailContent = e => {
    const imageFile = document.querySelector('input[type="file"]').files[0];
    convertImageToBase64(imageFile, base64Image => {
      const imageTag = `<img src="${base64Image}" alt="Header Image" style="width: 100%; max-width: 100%; height: auto;">`;
      setHeaderContent(prevContent => `${imageTag}${prevContent}`);
      const editor = tinymce.get('email-editor');
      if (editor) {
        editor.insertContent(imageTag);
        setEmailContent(editor.getContent());
      }
    });
    e.target.value = '';
  };
  // const htmlContent = `<html><head><title>Weekly Update</title></head><body>${emailContent}</body></html>`;
  const addHeaderToEmailContent = () => {
    if (!headerContent) return;
    const imageTag = `<img src="${headerContent}" alt="Header Image" style="width: 100%; max-width: 100%; height: auto;">`;
      const editor = tinymce.get('email-editor');
      if (editor) {
        editor.insertContent(imageTag);
        setEmailContent(editor.getContent());
      }
  };
  const handleSendEmails = () => {
    const htmlContent = emailContent;
    // Send the HTML content using your sendEmail function
    dispatch(sendEmail(emailList.join(','), 'Weekly Update', htmlContent));
  };

  const handleBroadcastEmails = () => {
    const htmlContent = `
    <div style="max-width: 500px; width: 100%; margin: auto;">
      ${emailContent}
    </div>
  `;
    dispatch(broadcastEmailsToAll('Weekly Update', htmlContent));
  };

  return (
    <>
      <div className="email-update-container">
        <div className="editor">
          <h3>Weekly Progress Editor</h3>
          <br />
          <Editor
            id="email-editor"
            apiKey="rpfrv9z58kbaoauzv9dncv73jeqv7c5lo73gqlk9rx5p726p" // Replace with your TinyMCE API key
            initialValue="<p>This is the initial content of the editor</p>"
            init={{
              selector: 'textarea#open-source-plugins',
              height: 500,
              menubar: false,
              plugins: [
                'advlist autolink lists link image paste',
                'charmap print preview anchor help',
                'searchreplace visualblocks code',
                'insertdatetime media table paste wordcount',
              ],
              image_title: true,
              automatic_uploads: true,
              file_picker_callback(cb, value, meta) {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');

                /*
                  Note: In modern browsers input[type="file"] is functional without
                  even adding it to the DOM, but that might not be the case in some older
                  or quirky browsers like IE, so you might want to add it to the DOM
                  just in case, and visually hide it. And do not forget do remove it
                  once you do not need it anymore.
                */

                input.onchange = function() {
                  const file = this.files[0];

                  const reader = new FileReader();
                  reader.onload = function() {
                    /*
                      Note: Now we need to register the blob in TinyMCEs image blob
                      registry. In the next release this part hopefully won't be
                      necessary, as we are looking to handle it internally.
                    */
                    const id = `blobid${new Date().getTime()}`;
                    const { blobCache } = tinymce.activeEditor.editorUpload;
                    const base64 = reader.result.split(',')[1];
                    const blobInfo = blobCache.create(id, file, base64);
                    blobCache.add(blobInfo);

                    /* call the callback and populate the Title field with the file name */
                    cb(blobInfo.blobUri(), { title: file.name });
                  };
                  reader.readAsDataURL(file);
                };

                input.click();
              },
              a11y_advanced_options: true,
              menubar: 'file insert edit view format tools',
              toolbar:
                'undo redo | formatselect | bold italic | blocks fontfamily fontsize | image \
                alignleft aligncenter alignright | \
                bullist numlist outdent indent | removeformat | help',
            }}
            onEditorChange={(content, editor) => {
              setEmailContent(content);
            }}
          />
          <button type="button" className="send-button" onClick={handleBroadcastEmails}>
            Broadcast Weekly Update
          </button>
        </div>
        <div className="emails">
          Email List (comma-separated):
          <input type="text" onChange={handleEmailListChange} />
          <button type="button" className="send-button" onClick={handleSendEmails}>
            Send Email to specific user
          </button>
          <div>
            <hr />
            <p>Insert header or image link</p>
            <div style={{ overflow: 'hidden' }}>
              <input type="text" onChange={handleHeaderContentChange}/>
            </div>
            <button type="button" className="send-button" onClick={addHeaderToEmailContent}>
              Insert
            </button>
            <hr />
            <p>Upload Header (or footer)</p>
            <div style={{ overflow: 'hidden' }}>
              <input type="file" onChange={addImageToEmailContent} />
            </div>
          </div>
        </div>
      </div>
      {/* <div className="email-content-preview-section">
        <div className="email-content-preview-title">
          <h3>Preview</h3>
        </div>
        <div className="email-content-preview" dangerouslySetInnerHTML={{ __html: emailContent }} />
      </div> */}
    </>
  );
}

export default Announcements;

