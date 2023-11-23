import { useState, useEffect } from 'react';
import { Form, FormControl, Button } from 'react-bootstrap';
import './LessonForm.css';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllRoles } from '../../../actions/role';
import { fetchAllProjects } from '../../../actions/projects';
import Noimg from './images/Noimg3.jpg';

const style = {
  backgroundImage: `url(${Noimg})`,
};
function LessonForm() {
  const dispatch = useDispatch();
  const roles = useSelector(state => state.role.roles);
  const projects = useSelector(state => state.allProjects.projects);
  const [LessonFormtags, setLessonFormTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const { projectId } = useParams();

  const handleTagInput = e => {
    e.preventDefault();
    setTagInput(e.target.value);
  };

  const addTag = e => {
    e.preventDefault();
    const trimmedTagInput = tagInput.trim().replace(/\s+/g, ' '); // Replace consecutive spaces with a single space
    if (trimmedTagInput !== '') {
      if (!LessonFormtags.includes(trimmedTagInput)) {
        setLessonFormTags([...LessonFormtags, trimmedTagInput]);
        setTagInput('');
      }
    }
  };

  const removeTag = tagIndex => {
    const newTags = LessonFormtags.filter((_, index) => index !== tagIndex);
    setLessonFormTags(newTags);
  };
  const removePreviousProject = prevproject => {
    const newTags = LessonFormtags.filter(project => project !== prevproject);
    setLessonFormTags(newTags);
  };
  useEffect(() => {
    // Dispatch the action to fetch roles when the component mounts
    dispatch(getAllRoles());
  }, [dispatch]);

  useEffect(() => {
    // Dispatch the action to fetch projects when the component mounts
    dispatch(fetchAllProjects());
  }, [dispatch]);

  useEffect(() => {
    if (projectId) {
      const projectname = `Project ${projectId}`;
      setLessonFormTags([projectname]);
    }
  }, []);

  const [selectedFile, setSelectedFile] = useState(null);
  const [prevselectedProject, setprevSelectedProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null); // Track selected project
  const handleFileSelection = e => {
    const file = e.target.files[0]; // Get the selected file
    setSelectedFile(file); // Update the state with the selected file
  };

  const handleClick = () => {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleKeyPress = e => {
    e.preventDefault();
    // console.log("hi Keypress")
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  const handleDrop = e => {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const file = e.dataTransfer.files[0];
    setSelectedFile(file);
    // Reset the file input value to clear the selection
    if (fileInput) {
      fileInput.value = '';
    }
  };
  const handleProjectChange = e => {
    const selectedProjectId = e.target.value;
    setSelectedProject(selectedProjectId);
  };
  useEffect(() => {
    if (selectedProject && prevselectedProject !== selectedProject) {
      // Remove the tag for the previously selected project
      if (prevselectedProject) {
        removePreviousProject(prevselectedProject);
      }
      setprevSelectedProject(selectedProject);
      // Check if the selected project is already in tags
      const hasSelectedProject = LessonFormtags.includes(selectedProject);
      // If not, add it to the tags array
      if (!hasSelectedProject) {
        setLessonFormTags(tags => [...tags, selectedProject]);
      }
    }
  }, [selectedProject, prevselectedProject]);
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
              <Form.Label>Add tag</Form.Label>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Input tag for the lesson"
                  value={tagInput}
                  onChange={handleTagInput}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      addTag(e);
                    }
                  }}
                  className="form-control"
                />
                <div className="input-group-append">
                  {/* <Button size="sm" type="button" onClick={addTag} className="btn">
                    Add
                  </Button> */}
                </div>
              </div>
              <div className="TagsDiv">
                {LessonFormtags.map((tag, index) => {
                  const key = `${tag}_${index}`;
                  return (
                    <div className="Tag" key={key}>
                      <span className="TagSpan">{tag}</span>
                      <button
                        className="removeTagBTN"
                        type="button"
                        onClick={() => removeTag(index)}
                      >
                        X
                      </button>
                    </div>
                  );
                })}
              </div>
            </Form.Group>
          </div>
          <div className="FormSelectContainer">
            <div className="SingleFormSelect">
              <Form.Group controlId="Form.ControlSelect1">
                <Form.Label>Belongs to</Form.Label>
                <FormControl
                  onChange={handleProjectChange}
                  as="select"
                  aria-label="Default select example"
                  disabled={!!projectId}
                >
                  {!selectedProject && !projectId && <option>Select Project</option>}
                  {projectId && <option>Project {projectId}</option>}
                  {projects.map(project => (
                    <option key={project._id} value={project.projectName}>
                      {project.projectName}
                    </option>
                  ))}
                </FormControl>
              </Form.Group>
            </div>
            <div className="SingleFormSelect">
              <Form.Group controlId="Form.ControlSelect2">
                {/* By default the lesson can be read by anyone. The author can change the permission to only public to certain roles. */}
                <Form.Label>View by</Form.Label>
                <FormControl as="select" aria-label="Default select example">
                  <option>All</option>
                  {roles.map(role => (
                    <option key={role._id} value={role.roleName}>
                      {role.roleName}
                    </option>
                  ))}
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
                className={`dragAndDropStyle ${selectedFile ? 'fileSelected' : ''}`}
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
