import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './JobAdsCreation.module.css';
import { toast } from 'react-toastify';
import { Editor } from '@tinymce/tinymce-react';
import { ENDPOINTS } from '../../utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';
import { createCollaborationAds } from '../../actions/collaborationAdsActions';
import { validateJobAdsForm } from './jobAdsCreationValidation';

const getJobAdsTinyMceInit = (darkMode, { withMedia = false } = {}) => ({
  license_key: 'gpl',
  menubar: false,
  plugins: withMedia
    ? 'autolink autoresize lists link help wordcount preview media'
    : 'autolink autoresize lists link help wordcount preview ',
  toolbar: withMedia
    ? 'bold italic underline link removeformat | bullist numlist outdent indent | styleselect fontsizeselect | forecolor backcolor | help | preview | media'
    : 'bold italic underline link removeformat | bullist numlist outdent indent | styleselect fontsizeselect | forecolor backcolor | help | preview ',
  branding: false,
  toolbar_mode: 'sliding',
  min_height: 180,
  max_height: 600,
  width: 700,
  autoresize_bottom_margin: 1,
  content_style: darkMode
    ? 'body { background-color: #2a2a2a; color: #e0e0e0; cursor: text !important; }'
    : 'body { background-color: #fff; color: #000; cursor: text !important; }',
  ...(darkMode
    ? { skin: 'oxide-dark', content_css: 'dark' }
    : { skin: 'oxide', content_css: 'default' }),
});

function JobAdsCreation() {
  const dispatch = useDispatch();
  const userRole = useSelector(state => state.auth?.user?.role);
  const canCreateCollabJobAds = userRole === 'Owner' || userRole === 'Administrator';

  const textareaFields = [
    { key: 'description', display: 'Description' },
    { key: 'requirements', display: 'Requirements' },
    { key: 'projects', display: 'Projects' },
    { key: 'ourCommunity', display: 'Our Community' },
  ];

  const formFields = [
    { key: 'imageUrl', display: 'Image Url' },
    { key: 'location', display: 'Location' },
  ];

  const initialState = {
    title: '',
    category: '',
    requirements: '',
    projects: '',
    ourCommunity: '',
    description: '',
    imageUrl: '',
    location: 'remote',
    applyLink: '',
    jobDetailsLink: '',
  };
  const [formData, setFormData] = useState({ ...initialState });
  const [categories, setCategories] = useState([]);
  const [positions, setPositions] = useState([]);
  const [jobFormsAll, setJobFormsAll] = useState([]);
  const [errors, setErrors] = useState({});
  const darkMode = useSelector(state => state.theme.darkMode);
  const textareaRef = useRef(null);

  const tinyMceInitMedia = useMemo(() => getJobAdsTinyMceInit(darkMode, { withMedia: true }), [
    darkMode,
  ]);

  const submitJobAds = async () => {
    try {
      await dispatch(createCollaborationAds(formData));
      setFormData({ ...initialState });
    } catch (error) {
      toast.error(`Failed to submit jobs: ${error.message}`);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${ENDPOINTS.JOB_CATEGORIES}`, { method: 'GET' });
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);

      const data = await response.json();
      const sortedCategories = data.categories.sort((a, b) => a.localeCompare(b));
      setCategories(sortedCategories);
    } catch (error) {
      toast.error(`Error fetching categories: ${error.message}`);
    }
  };

  const fetchJobFormsAll = async () => {
    try {
      const response = await fetch(`${ENDPOINTS.GET_ALL_JOB_FORMS}`, {
        method: 'GET',
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch all jobForms: ${response.statusText}`);
      const data = await response.json();
      setJobFormsAll(data.forms);
    } catch (error) {
      toast.error(`Error fetching jobFormsAll: ${error.message}`);
    }
  };

  const fetchPositions = async categoryInput => {
    try {
      const response = await fetch(
        `${ENDPOINTS.JOB_POSITIONS}/?category=${encodeURIComponent(categoryInput)}`,
        {
          method: 'GET',
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch positions: ${response.statusText}`);
      }

      const data = await response.json();
      const sortedPositions = data.positions.sort((a, b) => a.localeCompare(b));
      setPositions(sortedPositions);
    } catch (error) {
      toast.error(`Error fetching positions: ${error.message}`);
    }
  };

  const handleSubmit = event => {
    event.preventDefault();
    const validationError = validateJobAdsForm(formData);
    if (validationError) {
      setErrors({ [validationError.field]: validationError.message });
      toast.error(validationError.message);
      textareaRef.current?.focus();
      return;
    }

    setErrors({});
    void submitJobAds();
  };

  const handleCancel = event => {
    event.preventDefault();
    const emptyMsg = '';
    setErrors(emptyMsg);
    setFormData({ ...initialState });
  };

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this specific field automatically
    setErrors(prev => ({
      ...prev,
      [name]: '',
    }));
    if (name === 'category') {
      if (value === '') {
        setPositions([]);
        return;
      }
      void fetchPositions(value);
    }
  };

  useEffect(() => {
    void fetchCategories();
    void fetchJobFormsAll();
  }, []);

  if (!canCreateCollabJobAds) {
    return (
      <div
        className={`${styles['jobAds-creation']} ${
          darkMode ? styles['user-collaboration-dark-mode'] : ''
        }`}
      >
        <div>You do not have permission to create Collaboration Job Ads.</div>
      </div>
    );
  }

  return (
    <div
      className={`${styles['jobAds-creation']} ${
        darkMode ? styles['user-collaboration-dark-mode'] : ''
      }`}
    >
      <div className={styles['jobAds-header']}>
        <a
          href="https://www.onecommunityglobal.org/collaboration/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={OneCommunityImage} alt="One Community Logo" />
        </a>
      </div>
      <div className={styles['title-header']}>
        <h3> Collaboration Ads Creation </h3>
      </div>

      <form className={styles['jobAds-creation-container']} onSubmit={handleSubmit}>
        <div className={styles['input-error']}>
          <label className={styles['input-label']} htmlFor="category">
            Category
          </label>
          <select
            className={styles['jobAds-input']}
            id="category"
            value={formData.category}
            onChange={handleChange}
            name="category"
          >
            <option value="">Select from Categories</option>
            {categories.map(specificCategory => (
              <option key={specificCategory} value={specificCategory}>
                {specificCategory}
              </option>
            ))}
          </select>
        </div>

        {!errors.category ? null : <div className={styles.error}>{errors.category}</div>}

        <div className={styles['input-error']}>
          <label className={styles['input-label']} htmlFor="title">
            Title
          </label>
          <select
            className={styles['jobAds-input']}
            value={formData.title}
            name="title"
            id="title"
            onChange={handleChange}
          >
            <option value="">Select from Positions</option>
            {positions.map(specificPosition => (
              <option key={specificPosition} value={specificPosition}>
                {specificPosition}
              </option>
            ))}
          </select>
        </div>

        {!errors.title ? null : <div className={styles.error}>{errors.title}</div>}
        {textareaFields.map(field => (
          <div key={field.key}>
            <div className={styles['input-error']}>
              <label className={styles['input-label']} htmlFor={field.key}>
                {field.display}
              </label>

              <Editor
                key={`${field.key}-${darkMode ? 'dark' : 'light'}`}
                className={`${styles['jobAds-input']} ${styles['jobAds-editor']}`}
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                init={tinyMceInitMedia}
                id={field.key}
                value={formData[field.key] || ''}
                onEditorChange={newVal => setFormData(prev => ({ ...prev, [field.key]: newVal }))}
              />
            </div>
            {!errors[field.key] ? null : <div className={styles.error}>{errors[field.key]}</div>}
          </div>
        ))}
        {formFields.map((field, idx) => (
          <div key={field.key}>
            <div className={styles['input-error']}>
              <label className={styles['input-label']} htmlFor={field.key}>
                {field.display}
              </label>
              <input
                className={styles['jobAds-input']}
                id={field.key}
                value={formData[field.key] || ''}
                placeholder={`Enter the ${field.display}`}
                onChange={handleChange}
                name={field.key}
                disabled={idx === 1}
              />
            </div>
            {errors[field.key] && <div className={styles.error}>{errors[field.key]}</div>}
          </div>
        ))}
        <div className={styles['input-error']}>
          <label className={styles['input-label']} htmlFor="applyLinktest2">
            Apply Link
          </label>
          <select
            className={styles['jobAds-input']}
            id="applyLink"
            value={formData.applyLink}
            onChange={handleChange}
            name="applyLink"
          >
            <option value="">Select from job forms</option>
            {jobFormsAll.map(({ _id, title }) => {
              return (
                <option key={_id} value={`${ENDPOINTS.APIEndpoint()}/jobforms/${_id}`}>
                  {title}
                </option>
              );
            })}
          </select>
        </div>

        {!errors.applyLink ? null : <div className={styles.error}>{errors.applyLink}</div>}

        <div className={styles['jobAds-creation-button-group']}>
          <button type="submit" className={`${styles['submit-button']} btn-primary`}>
            Submit
          </button>
          <button
            type="button"
            className={`${styles['cancel-button']} btn-secondary`}
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default JobAdsCreation;
