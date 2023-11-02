import { useState, useRef } from 'react';
import { Form, FormControl, Button } from 'react-bootstrap';
import './LessonForm.css';
import Noimg from './images/Noimg3.jpg';

const style = {
  backgroundImage: `url(${Noimg})`,
};
function LessonForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const dropTargetRef = useRef(null);
  // TODO fix handleDrop
  // const handleDrop = (e) => {
  //   e.preventDefault();
  //   e.stopPropagation(); // Prevent the default behavior
  //   console.log("handledrop")
  //   const file = e.target.files[0]; // Get the selected file
  //   setSelectedFile(file);
  // };

  // const handleDragOver = e => {
  //   e.preventDefault();
  //   // console.log("hi")
  // };
  const handleFileSelection = e => {
    const file = e.target.files[0]; // Get the selected file
    setSelectedFile(file); // Update the state with the selected file
  };

  const handleClick = () => {
    // console.log(selectedFile,"hi click")
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleKeyPress = () => {
    // console.log("hi Keypress")
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  const handleDrop = e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setSelectedFile(file);
  };
  return (
    <div className="MasterContainer">
      <div className="FormContainer">
        <Form>
          <div className="WriteLessonAndTagDiv">
            <Form.Group className="LessonForm" controlId="exampleForm.ControlTextarea1">
              <Form.Label className="LessonLabel">Write a Lesson</Form.Label>
              <Form.Control
                className="LessonPlaceholderText"
                as="textarea"
                placeholder="Enter the lesson you learn..."
                rows={10}
              />
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlInput1">
              {/* Can have multiple tags. Needs to add tag for belonging project name automatically. */}
              <Form.Label>Add tag</Form.Label>
              <Form.Control type="text" placeholder="Input tag for the lesson" />
            </Form.Group>
          </div>
          <div className="FormSelectContainer">
            <div className="SingleFormSelect">
              <Form.Group controlId="Form.ControlSelect1">
                <Form.Label>Belongs to</Form.Label>
                <FormControl as="select" aria-label="Default select example">
                  <option>Project 1</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </FormControl>
              </Form.Group>
            </div>
            <div className="SingleFormSelect">
              <Form.Group controlId="Form.ControlSelect2">
                {/* By default the lesson can be read by anyone. The author can change the permission to only public to certain roles. */}
                <Form.Label>View by</Form.Label>
                <FormControl as="select" aria-label="Default select example">
                  <option>All</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </FormControl>
              </Form.Group>
            </div>
          </div>
          <div className="DragAndDropFormGroup">
            <Form.Group controlId="exampleForm.ControlFile1">
              <Form.Label>Upload Appendix</Form.Label>
              <input
                type="file"
                id="fileInput"
                style={{ display: 'none' }}
                onChange={handleFileSelection}
              />
              <div
                role="button"
                tabIndex={0}
                onClick={handleClick}
                onKeyPress={handleKeyPress}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                ref={dropTargetRef}
                className="dragAndDropStyle"
              >
                {selectedFile ? (
                  <p>Selected File: {selectedFile.name}</p>
                ) : (
                  <div className="TextAndImageDiv">
                    <div className="ImageDiv" style={style} />

                    <p className="DragandDropText">Drag and drop a file here</p>
                  </div>
                )}
              </div>
            </Form.Group>
          </div>
          <div className="ButtonDiv">
            <Button className="LessonFormButtonCancel" type="cancel">
              Cancel
            </Button>
            <Button className="LessonFormButtonSubmit" type="submit">
              Post
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
export default LessonForm;
