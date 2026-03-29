/* eslint-disable testing-library/no-node-access */
import { useState, useEffect, useRef } from 'react';
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
  // Redux and Router hooks
  const dispatch = useDispatch();
  const history = useHistory();
  const { projectId } = useParams();
  const user = useSelector(state => state.auth.user);
  const userId = user ? user.userid : null;
  const roles = useSelector(state => state.role.roles);
  const projects = useSelector(state => state.bmProjects);
  const darkMode = useSelector(state => state.theme.darkMode);

  // Local state
  const [LessonFormtags, setLessonFormTags] = useState([]);
  const [permanentTags, setPermanentTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedRole, setSelectedRole] = useState('All');
  const [LessonText, setLessonText] = useState(null);
  const [LessonTitleText, setLessonTitleText] = useState(null);
  const [projectname, setProjectName] = useState(null);
  const [filteredTags, setFilteredTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suppressInitialFocus, setSuppressInitialFocus] = useState(true);
  const [hasUserFocused, setHasUserFocused] = useState(false);

  const lessonTitleRef = useRef(null);
  const lessonTextRef = useRef(null);
  const formContainerRef = useRef(null);
  const allowNextFocusRef = useRef(false);

  // Filter tags for autocomplete as user types
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

  // Add a tag from the dropdown selection
  const handleTagSelection = selectedTag => {
    if (!LessonFormtags.includes(selectedTag)) {
      setLessonFormTags([...LessonFormtags, selectedTag]);
    }
    setTagInput('');
    setShowDropdown(false);
  };

  // Create a new tag via API if it doesn't exist, then add to local state
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

  // Initial data fetch on component mount
  useEffect(() => {
    fetchTags();
    dispatch(fetchBMProjects(projectId));
    dispatch(getAllRoles());
  }, [dispatch, projectId]);

  // Focus and Selection management
  useEffect(() => {
    if (document.activeElement && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const blurTargets = () => {
      lessonTitleRef.current?.blur();
      lessonTextRef.current?.blur();
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
    blurTargets();
    const timer = setTimeout(blurTargets, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const clearInactiveSelection = () => {
      const active = document.activeElement;
      [lessonTitleRef.current, lessonTextRef.current].forEach(el => {
        if (!el || el === active) return;
        if (typeof el.setSelectionRange === 'function') {
          el.setSelectionRange(0, 0);
        }
      });
    };
    document.addEventListener('selectionchange', clearInactiveSelection);
    document.addEventListener('mouseup', clearInactiveSelection);
    document.addEventListener('keyup', clearInactiveSelection);
    return () => {
      document.removeEventListener('selectionchange', clearInactiveSelection);
      document.removeEventListener('mouseup', clearInactiveSelection);
      document.removeEventListener('keyup', clearInactiveSelection);
    };
  }, []);

  const blockInitialFocus = e => {
    if (!suppressInitialFocus) return;
    if (allowNextFocusRef.current) {
      allowNextFocusRef.current = false;
      setSuppressInitialFocus(false);
      return;
    }
    const target = e.target;
    if (target && typeof target.blur === 'function') {
      target.blur();
    }
  };

  const allowFocusOnUserAction = () => {
    allowNextFocusRef.current = true;
    setHasUserFocused(true);
  };

  // Handle outside clicks to close the tag dropdown
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

  // Set default project if projectId exists in URL
  useEffect(() => {
    if (projectId) {
      const foundProject = projects.find(project => project._id === projectId);
      if (foundProject) {
        setProjectName(foundProject.name);
        setSelectedProject(projectId);
      }
    }
  }, [projectId, projects]);

  // --- File Upload Handlers (Click and Drag-n-Drop) ---
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

  const handleDrop = e => {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const file = e.dataTransfer.files[0];
    setSelectedFile(file);
    if (fileInput) {
      fileInput.value = '';
    }
  };
  // ----------------------------------------------------

  const onHandleCancel = () => {
    history.goBack();
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

  const clearOtherSelections = target => {
    if (typeof window.getSelection === 'function') {
      const selection = window.getSelection();
      if (selection && selection.removeAllRanges) {
        selection.removeAllRanges();
      }
    }
    const refs = [lessonTitleRef.current, lessonTextRef.current];
    refs.forEach(el => {
      if (!el || el === target) return;
      if (typeof el.setSelectionRange === 'function') {
        const end = el.value ? el.value.length : 0;
        el.setSelectionRange(end, end);
      }
    });
  };

  const clearSelectionGlobal = () => {
    if (typeof window.getSelection === 'function') {
      const selection = window.getSelection();
      if (selection && selection.removeAllRanges) {
        selection.removeAllRanges();
      }
    }
    [lessonTitleRef.current, lessonTextRef.current].forEach(el => {
      if (el && typeof el.setSelectionRange === 'function') {
        el.setSelectionRange(0, 0);
      }
    });
  };

  const enforceDarkInputStyle = e => {
    if (!darkMode) return;
    const target = e.currentTarget;
    clearOtherSelections(target);
    target.style.setProperty('background-color', '#3A506B', 'important');
    target.style.setProperty('color', '#ffffff', 'important');
    target.style.setProperty('border-color', '#556B8D', 'important');
    target.style.setProperty('box-shadow', '0 0 0 1000px #3A506B inset', 'important');
    target.style.setProperty('-webkit-box-shadow', '0 0 0 1000px #3A506B inset', 'important');
  };

  const enforceDarkInputBlurStyle = e => {
    if (!darkMode) return;
    const target = e.currentTarget;
    clearOtherSelections(target);
    target.style.setProperty('background-color', '#3A506B', 'important');
    target.style.setProperty('color', '#ffffff', 'important');
    target.style.setProperty('border-color', '#556B8D', 'important');
    target.style.setProperty('box-shadow', 'none', 'important');
    target.style.setProperty('-webkit-box-shadow', 'none', 'important');
    if (typeof target.setSelectionRange === 'function') {
      const end = target.value ? target.value.length : 0;
      target.setSelectionRange(end, end);
    }
  };

  // Compile form data and dispatch creation action
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
      <div
        ref={formContainerRef}
        className={`${styles.formContainer} ${darkMode ? styles.darkModeForm : ''} ${
          suppressInitialFocus ? styles.suppressInitialFocus : ''
        } ${!hasUserFocused ? styles.noFocusShadow : ''}`}
      >
        <Form
          onSubmit={LessonFormSubmit}
          onFocusCapture={blockInitialFocus}
          onMouseDownCapture={clearSelectionGlobal}
          onTouchStartCapture={clearSelectionGlobal}
        >
          <div className="WriteLessonAndTagDiv">
            {/* Title Input */}
            <Form.Group className="LessonFrom" controlId="exampleForm.ControlTextarea1">
              <Form.Label className={`${styles.lessonLabel} ${darkMode ? 'text-light' : ''}`}>
                Lesson Title
              </Form.Label>
              <span className="red-asterisk">* </span>
              <Form.Control
                required
                ref={lessonTitleRef}
                className={`LessonTitle ${darkMode ? styles.darkModeInput : ''}`}
                type="text"
                placeholder="Enter title here"
                onChange={handleLessonTitleInput}
                onFocus={enforceDarkInputStyle}
                onBlur={enforceDarkInputBlurStyle}
                onMouseDown={allowFocusOnUserAction}
                onTouchStart={allowFocusOnUserAction}
                onKeyDown={allowFocusOnUserAction}
                tabIndex={suppressInitialFocus ? -1 : 0}
                maxLength={40}
                autoComplete="new-password"
                name="lessonTitle"
              />
            </Form.Group>

            {/* Content Input */}
            <Form.Group className="LessonForm" controlId="exampleForm.ControlTextarea1">
              <Form.Label className={`${styles.lessonLabel} ${darkMode ? 'text-light' : ''}`}>
                Write a Lesson
              </Form.Label>
              <span className="red-asterisk">* </span>
              <Form.Control
                required
                ref={lessonTextRef}
                className={`${styles.lessonPlaceholderText} ${
                  darkMode ? styles.darkModeInput : ''
                }`}
                as="textarea"
                placeholder="Enter the lesson you learn..."
                rows={10}
                onChange={handleLessonInput}
                onFocus={enforceDarkInputStyle}
                onBlur={enforceDarkInputBlurStyle}
                onMouseDown={allowFocusOnUserAction}
                onTouchStart={allowFocusOnUserAction}
                onKeyDown={allowFocusOnUserAction}
                tabIndex={suppressInitialFocus ? -1 : 0}
              />
            </Form.Group>

            {/* Tag Selection Area */}
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
                  onMouseDown={allowFocusOnUserAction}
                  onTouchStart={allowFocusOnUserAction}
                  onKeyDown={e => {
                    allowFocusOnUserAction();
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
            {/* Project Selection */}
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

            {/* Role View Selection */}
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

          {/* File Upload / Drag & Drop Zone */}
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
              type="button"
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
