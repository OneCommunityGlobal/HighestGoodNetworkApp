/* eslint-disable testing-library/no-node-access */
import { useState, useEffect } from 'react';
import { Form, FormControl, Button } from 'react-bootstrap';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import postNewLesson from '../../../actions/bmdashboard/lessonActions';
import { getAllRoles } from '../../../actions/role';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import Noimg from './images/Noimg3.jpg';
import styles from './LessonForm.module.css';

const style = {
  backgroundImage: `url(${Noimg})`,
};

function LessonForm() {
  const dispatch = useDispatch();
  const history = useHistory();
  const darkMode = useSelector(state => state.theme.darkMode);
  const user = useSelector(state => state.auth.user);
  const userId = user ? user.userid : null;
  const roles = useSelector(state => state.role.roles);
  const projects = useSelector(state => state.bmProjects);
  const [LessonFormtags, setLessonFormTags] = useState([]);
  const [permanentTags, setPermanentTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedRole, setSelectedRole] = useState('All');
  const [LessonText, setLessonText] = useState(null);
  const [LessonTitleText, setLessonTitleText] = useState(null);
  const { projectId } = useParams();
  const [projectname, setProjectName] = useState(null);
  const [filteredTags, setFilteredTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

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

  useEffect(() => {
    fetchTags();
    dispatch(fetchBMProjects(projectId));
    dispatch(getAllRoles());
  }, [dispatch, projectId]);

  useEffect(() => {
    const handleClickOutside = event => {
      const dropdown = document.querySelector(`.${styles.tagDropdown}`);
      const input = document.querySelector(`.${styles.formControl}`);
      if (dropdown && !dropdown.contains(event.target) && input && !input.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (projectId) {
      const foundProject = projects.find(project => project._id === projectId);
      if (foundProject) {
        setProjectName(foundProject.name);
        setSelectedProject(projectId);
      }
    }
  }, [projectId, projects]);

  const handleFileSelection = e => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleClick = () => {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleKeyPress = e => {
    e.preventDefault();
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  const onHandleCancel = () => {
    history.goBack();
  };

  const handleDrop = e => {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const file = e.dataTransfer.files[0];
    setSelectedFile(file);
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
      if (response && response._id) {
        toast.success('Lesson Added');
        fetchTags();
      } else {
        toast.error('Unexpected Response: Lesson may not have been added');
      }
    } catch (error) {
      toast.error('Error Adding Lesson', error.message || 'Unknown error');
    }
  };

  return (
    <div className={`${styles.masterContainer} ${darkMode ? styles.darkModeMaster : ''}`}>
      <div className={`${styles.formContainer} ${darkMode ? styles.darkModeForm : ''}`}>
        <Form onSubmit={LessonFormSubmit}>
          <div className="WriteLessonAndTagDiv">
            <Form.Group className="LessonFrom" controlId="exampleForm.ControlTextarea1">
              <Form.Label className={`${styles.lessonLabel} ${darkMode ? 'text-light' : ''}`}>
                Lesson Title
              </Form.Label>
              <span className="red-asterisk">* </span>
              <Form.Control
                required
                className={`LessonTitle ${darkMode ? styles.darkModeInput : ''}`}
                type="text"
                placeholder="Enter title here"
                onChange={handleLessonTitleInput}
                maxLength={40}
              />
            </Form.Group>
            <Form.Group className="LessonForm" controlId="exampleForm.ControlTextarea1">
              <Form.Label className={`${styles.lessonLabel} ${darkMode ? 'text-light' : ''}`}>
                Write a Lesson
              </Form.Label>
              <span className="red-asterisk">* </span>
              <Form.Control
                required
                className={`${styles.lessonPlaceholderText} ${
                  darkMode ? styles.darkModeInput : ''
                }`}
                as="textarea"
                placeholder="Enter the lesson you learn..."
                rows={10}
                onChange={handleLessonInput}
              />
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlInput1">
              <Form.Label className={darkMode ? 'text-light' : ''}>
                Add tag (Press enter to add tag)
              </Form.Label>
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
                  className={`${styles.formControl} ${darkMode ? styles.darkModeInput : ''}`}
                />
                {showDropdown && filteredTags.length > 0 && (
                  <div
                    className={`${styles.tagDropdown} ${darkMode ? styles.darkModeDropdown : ''}`}
                  >
                    {filteredTags.map(tag => (
                      <button
                        key={tag}
                        className={`${styles.tagOption} ${darkMode ? 'text-light' : ''}`}
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
                  <div className={`${styles.tag} ${darkMode ? styles.darkModeTag : ''}`} key={tag}>
                    <span className={`${styles.tagSpan}`}>{tag}</span>
                    <button
                      className={`${styles.removeTagBTN} ${darkMode ? 'text-light' : ''}`}
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
                <Form.Label className={darkMode ? 'text-light' : ''}>Belongs to</Form.Label>
                <FormControl
                  onChange={handleProjectChange}
                  as="select"
                  className={darkMode ? styles.darkModeInput : ''}
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
                <Form.Label className={darkMode ? 'text-light' : ''}>View by</Form.Label>
                <FormControl
                  as="select"
                  className={darkMode ? styles.darkModeInput : ''}
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
              <Form.Label className={darkMode ? 'text-light' : ''}>Upload Appendix</Form.Label>
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
                className={`${styles.dragAndDropStyle} ${selectedFile ? styles.fileSelected : ''} ${
                  darkMode ? styles.darkModeDragDrop : ''
                }`}
              >
                {selectedFile ? (
                  <p className={darkMode ? 'text-light' : ''}>Selected File: {selectedFile.name}</p>
                ) : (
                  <div className={`${styles.textAndImageDiv}`}>
                    <div className={`${styles.imageDiv}`} style={style} />
                    <p className={`${styles.dragandDropText} ${darkMode ? 'text-azure' : ''}`}>
                      Drag and drop a file here
                    </p>
                  </div>
                )}
              </div>
            </Form.Group>
          </div>
          <div className={`${styles.buttonDiv}`}>
            <Button
              className={`${styles.lessonFormButtonCancel} ${
                darkMode ? styles.darkModeBtnCancel : ''
              }`}
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
