import './DragAndDrop.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';

const DragAndDrop = () => {
  return (
    <div id="file-upload-form">
        <input id="file-upload-input" type="file" name="file-upload-input" multiple={false} />
       <label htmlFor="file-upload-input" id="file-upload-label">
          <div>
              <FontAwesomeIcon icon={faImage} className="file-upload-icon" />
                <p>Drag and drop your picture here or</p>
                <button className="upload-button">Upload a file</button>
              </div>
      </label>
    </div>
  )
}

export default DragAndDrop;
