/* eslint-disable testing-library/no-node-access */
import { useState, useEffect } from 'react';
import { Form, FormControl, Button } from 'react-bootstrap';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import postNewLesson from '../../../actions/bmdashboard/lessonActions';
import { getAllRoles } from '../../../actions/role';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
// import { fetchAllProjects } from '../../../actions/projects'; // fetch all projects (not bmprojects)
import Noimg from './images/Noimg3.jpg';
import styles from './LessonForm.module.css';

const style = {
  backgroundImage: `url(${Noimg})`,
};
function LessonForm() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user); // grab user from store
  const userId = user ? user.userid : null; // get userID from user object
  const roles = useSelector(state => state.role.roles); // grab all roles from store
  // const projects = useSelector(state => state.allProjects.projects); // grab all projects from store(not BM projects)
  const projects = useSelector(state => state.bmProjects); // grab all BM projects from store
  const [LessonFormtags, setLessonFormTags] = useState([]); // save all tags user inputs
  const [permanentTags, setPermanentTags] = useState([]);
  const [tagInput, setTagInput] = useState(''); // track user input in tag input
  const [selectedFile, setSelectedFile] = useState(null); // track file that was selected or droped in upload appendix
  const [selectedProject, setSelectedProject] = useState(null); // Track selected project in Belongs to dropdown
  const [selectedRole, setSelectedRole] = useState('All'); // track selected role in View by dropdown
  const [LessonText, setLessonText] = useState(null); // track lesson text
  const [LessonTitleText, setLessonTitleText] = useState(null); // track lessontitle text
  const { projectId } = useParams(); // passed project id in parameters
  const [projectname, setProjectName] = useState(null);
  // track filtered tags
  const [filteredTags, setFilteredTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // track user input in the tag input feild

  const handleTagInput = e => {
    e.preventDefault();
    const input = e.target.value;
    setTagInput(input);

    if (input.trim()) {
      const filtered = permanentTags.filter(tag => tag.toLowerCase().includes(input.toLowerCase()));
      setFilteredTags(filtered);
      setShowDropdown(true);
    } else {
      setFilteredTags([]);
      setShowDropdown(false);
    }
  };

  const handleTagSelection = selectedTag => {
    if (!LessonFormtags.includes(selectedTag)) {
      setLessonFormTags([...LessonFormtags, selectedTag]);
    }
    setTagInput('');
    setShowDropdown(false);
  };

  // when user hits enter add the tag to LessonFromtags
  const addTag = async e => {
    e.preventDefault();
    const trimmedTagInput = tagInput.trim().replace(/\s+/g, ' ');
    if (trimmedTagInput && !LessonFormtags.includes(trimmedTagInput)) {
      try {
        const response = await axios.post(ENDPOINTS.BM_TAG_ADD, {
          tag: trimmedTagInput,
        });
        if (response.data) {
          setLessonFormTags(prev => [...prev, trimmedTagInput]);
          setPermanentTags(response.data);
          setTagInput('');
          toast.success('Tag added successfully');
        }
      } catch (error) {
        const errorMsg = error.response?.data?.details || error.message;
        toast.error(`Failed to add tag: ${errorMsg}`);
      }
    }
  };
  // removes tag when 'x' is clicked from LessonFormtags variable
  const removeTag = tagToRemove => {
    const newTags = LessonFormtags.filter(tag => tag !== tagToRemove);
    setLessonFormTags(newTags);
  };
  const fetchTags = async () => {
    try {
      const response = await axios.get(ENDPOINTS.BM_TAGS);
      setPermanentTags(response.data);
    } catch (error) {
      toast.error('Error fetching tags: ', error.message);
    }
  };
  // Dispatch the action to fetch roles and projects when the component mounts
  useEffect(() => {
    fetchTags();
    dispatch(fetchBMProjects(projectId));
    dispatch(getAllRoles());
  }, [dispatch, projectId]);
  // logic if there is a projectId passed in params(on project specific from) to add the project tag automatically

  // useEffect handles click away from input drop down menu
  useEffect(() => {
    const handleClickOutside = event => {
      // is click outside dropdown?
      const dropdown = document.querySelector('.tag-dropdown');
      const input = document.querySelector('.form-control');
      if (dropdown && !dropdown.contains(event.target) && !input.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    // if clicked outside
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (projectId) {
      // Fetch the project with the given projectId
      const foundProject = projects.find(project => project._id === projectId);
      // Check if the project is found
      if (foundProject) {
        // Set the project name as a tag
        setProjectName(foundProject.name);
        setSelectedProject(projectId);
      }
    }
  }, [projectId, projects]);
  // when user selects a file updates selectedFile variable
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

  const onHandleCancel = () => {
    window.location.href = `/bmdashboard/projects/${projectId}`;
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
    const selectedProjectInput = e.target.value;
    setSelectedProject(selectedProjectInput);
  };
  const handleRoleChange = e => {
    const selectedRoleInput = e.target.value;
    setSelectedRole(selectedRoleInput);
  };
  const handleLessonInput = e => {
    const lessonforminput = e.target.value;
    setLessonText(lessonforminput);
  };
  const handleLessonTitleInput = e => {
    const lessonformtitleinput = e.target.value;
    setLessonTitleText(lessonformtitleinput);
  };

  // Lesson submit. all the data from user input is in here
  const LessonFormSubmit = async e => {
    e.preventDefault();
    if (!selectedProject) {
      toast.info('Need to select a project');
      return;
    }
    const lessonData = {
      title: LessonTitleText,
      content: LessonText,
      tags: LessonFormtags,
      author: userId,
      relatedProject: selectedProject,
      allowedRoles: selectedRole,
      files: selectedFile,
    };
    try {
      const response = await dispatch(postNewLesson(lessonData));
      // Check if the response indicates success
      if (response && response._id) {
        toast.success('Lesson Added');
        fetchTags();
      } else {
        // Handle unexpected response
        toast.error('Unexpected Response: Lesson may not have been added');
      }
    } catch (error) {
      // Handle errors, and display the error message
      toast.error('Error Adding Lesson', error.message || 'Unknown error');
    }
  };
  return (
    <div className={`${styles.masterContainer}`}>
      <div className={`${styles.formContainer}`}>
        <Form onSubmit={LessonFormSubmit}>
          <div className="WriteLessonAndTagDiv">
            <Form.Group className="LessonFrom" controlId="exampleForm.ControlTextarea1">
              <Form.Label className={`${styles.lessonLabel}`}>Lesson Title</Form.Label>
              <span className="red-asterisk">* </span>
              <Form.Control
                required
                className="LessonTitle"
                type="text"
                placeholder="Enter title here"
                onChange={handleLessonTitleInput}
                maxLength={40}
              />
            </Form.Group>
            <Form.Group className="LessonForm" controlId="exampleForm.ControlTextarea1">
              <Form.Label className={`${styles.lessonLabel}`}>Write a Lesson</Form.Label>
              <span className="red-asterisk">* </span>
              <Form.Control
                required
                className={`${styles.lessonPlaceholderText}`}
                as="textarea"
                placeholder="Enter the lesson you learn..."
                rows={10}
                onChange={handleLessonInput}
              />
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlInput1">
              <Form.Label>Add tag (Press enter to add tag)</Form.Label>
              <div className={`${styles.inputGroup}`}>
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
                  className={`${styles.formControl}`}
                />
                {showDropdown && filteredTags.length > 0 && (
                  <div className={`${styles.tagDropdown}`}>
                    {filteredTags.map(tag => (
                      <button
                        key={tag}
                        className={styles.tagOption}
                        onClick={() => handleTagSelection(tag)}
                        type="button"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className={`${styles.tagsDiv}`}>
                {LessonFormtags.map(tag => (
                  <div className={`${styles.tag}`} key={tag}>
                    <span className={`${styles.tagSpan}`}>{tag}</span>
                    <button
                      className={`${styles.removeTagBTN}`}
                      type="button"
                      onClick={() => removeTag(tag)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </Form.Group>
          </div>
          <div className={`${styles.formSelectContainer}`}>
            <div className={`${styles.singleFormSelect}`}>
              <Form.Group controlId="Form.ControlSelect1">
                <Form.Label>Belongs to</Form.Label>
                <FormControl
                  onChange={handleProjectChange}
                  as="select"
                  aria-label="Default select example"
                  disabled={!!projectId}
                >
                  {!selectedProject && !projectId && <option>Select Project</option>}
                  {projectId && <option value={projectId}>Project {projectname}</option>}
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </FormControl>
              </Form.Group>
            </div>
            <div className={`${styles.singleFormSelect}`}>
              <Form.Group controlId="Form.ControlSelect2">
                <Form.Label>View by</Form.Label>
                <FormControl
                  as="select"
                  aria-label="Default select example"
                  onChange={handleRoleChange}
                >
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
                  <div className={`${styles.textAndImageDiv}`}>
                    <div className={`${styles.imageDiv}`} style={style} />
                    <p className={`${styles.dragandDropText}`}>Drag and drop a file here</p>
                  </div>
                )}
              </div>
            </Form.Group>
          </div>
          <div className={`${styles.buttonDiv}`}>
            <Button
              className={`${styles.lessonFormButtonCancel}`}
              type="cancel"
              onClick={onHandleCancel}
            >
              Back
            </Button>
            <Button className={`${styles.lessonFormButtonSubmit}`} type="submit">
              Post
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
export default LessonForm;
