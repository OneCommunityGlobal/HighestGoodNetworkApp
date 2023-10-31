import { useState } from 'react';
import { Form, FormControl, Button } from 'react-bootstrap';
import './LessonForm.css';

function LessonForm() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrop = e => {
    e.preventDefault();
    // console.log("hi")
    const file = e.dataTransfer.files[0];
    setSelectedFile(file);
  };

  const handleDragOver = e => {
    e.preventDefault();
    // console.log("hi")
  };

  return (
    <div className="MasterContainer">
      <div className="FormContainer">
        <Form>
          <Form.Group controlId="exampleForm.ControlTextarea1">
            <Form.Label className="LessonLabel">Write a Lesson</Form.Label>
            <Form.Control as="textarea" rows={10} />
          </Form.Group>
          <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label>Add tag</Form.Label>
            <Form.Control type="text" placeholder="Input tag for the lesson" />
          </Form.Group>
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
          <Form.Group controlId="exampleForm.ControlFile1">
            <Form.Label>Drag and Drop Image or File</Form.Label>
            <div onDrop={handleDrop} onDragOver={handleDragOver} className="dragAndDropStyle">
              {selectedFile ? (
                <p>Selected File: {selectedFile.name}</p>
              ) : (
                <div className="TextAndImageDiv">
                  <div className="ImageDiv" />

                  <p>Drag and drop a file here, or click to select one</p>
                </div>
              )}
            </div>
          </Form.Group>
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
