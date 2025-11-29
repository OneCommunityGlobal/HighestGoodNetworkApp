import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './JobAdsCreation.module.css';
import { toast } from 'react-toastify';
import { Editor } from '@tinymce/tinymce-react';
import { ENDPOINTS } from '../../utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';
import { isValidDropboxImageUrl, isValidUrl } from '../../utils/checkValidURL';
import { createCollaborationAds } from '../../actions/collaborationAdsActions';
import getWordCount from '../../utils/getWordCount';
import hasPermission from '../../utils/permissions';

function JobAdsCreation() {
  const dispatch = useDispatch();
  // const canCreateCollabJobAds = hasPermission('createCollabJobAds');
  // console.log('canCreateCollabJobAds');
  // console.log(canCreateCollabJobAds);

  const [canCreateCollabJobAds, setCanCreateCollabJobAds] = useState(null);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await dispatch(hasPermission('createCollabJobAds'));
        console.log('createCollabJobAds permission:', result);
        setCanCreateCollabJobAds(Boolean(result));
      } catch (error) {
        console.error('Error checking permission', error);
        setCanCreateCollabJobAds(false);
      }
    };

    checkPermission();
  }, [dispatch]);

  // const canCreateCollabJobAdsDis = await dispatch(hasPermission('createCollabJobAds'));
  const [loading, setLoading] = useState('');
  //  const formFields = ['imageUrl', 'location', 'applyLink', 'jobDetailsLink'];
  const textareaFields = [
    { key: 'description', display: 'Description' },
    { key: 'requirements', display: 'Requirements' },
    //    { key: 'skills', display: 'Skills' },
    { key: 'projects', display: 'Projects' },
    //    { key: 'whoareyou', display: 'Who are you' },
    // apply: '',
    { key: 'ourCommunity', display: 'Our Community' },
    //        { key: 'whoweare', display: 'Who are we' },
  ];

  const formFields = [
    { key: 'imageUrl', display: 'Image Url' },
    { key: 'location', display: 'Location' },
    // { key: 'applyLink', display: 'Apply Link' },
    // { key: 'jobDetailsLink', display: 'Job Details Link' },
  ];

  const initialState = {
    title: '',
    category: '',
    /* new fields */
    // about: '',
    requirements: '',
    // skills: '',
    projects: '',
    // whoareyou: '',
    // apply: '',
    //  whoweare: '',
    ourCommunity: '',
    /* newly */
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
  const [jobTemplates, setJobTemplates] = useState([]);

  const [errors, setErrors] = useState({});
  const darkMode = useSelector(state => state.theme.darkMode);
  // const dispatch = useDispatch();
  const textareaRef = useRef(null);

  const TINY_MCE_INIT_OPTIONS = {
    license_key: 'gpl',
    menubar: false,
    //    placeholder: 'Description (10-word minimum) and reference link',
    // advlist
    plugins: 'autolink autoresize lists link help wordcount preview ',
    toolbar:
      // eslint-disable-next-line no-multi-str
      'bold italic underline link removeformat | bullist numlist outdent indent |\
                      styleselect fontsizeselect | forecolor backcolor |\
                      help | preview ',
    branding: false,
    toolbar_mode: 'sliding',
    min_height: 180,
    max_height: 600,
    width: 700,
    autoresize_bottom_margin: 1,
    content_style: 'body { cursor: text !important; }',
    // images_upload_handler: customImageUploadHandler,
    skin: darkMode ? 'oxide-dark' : 'oxide',
    content_css: darkMode ? 'dark' : 'default',
  };

  const TINY_MCE_INIT_OPTIONS_MEDIA = {
    license_key: 'gpl',
    menubar: false,
    //    placeholder: 'Description (10-word minimum) and reference link',
    // advlist
    plugins: 'autolink autoresize lists link help wordcount preview media',
    toolbar:
      // eslint-disable-next-line no-multi-str
      'bold italic underline link removeformat | bullist numlist outdent indent |\
                      styleselect fontsizeselect | forecolor backcolor |\
                      help | preview | media',
    branding: false,
    toolbar_mode: 'sliding',
    min_height: 180,
    max_height: 600,
    autoresize_bottom_margin: 1,
    content_style: 'body { cursor: text !important; }',
    // images_upload_handler: customImageUploadHandler,
    skin: darkMode ? 'oxide-dark' : 'oxide',
    content_css: darkMode ? 'dark' : 'default',
  };

  const submitJobAds = async () => {
    setLoading(true);
    try {
      /*
      const response = await axios.post(`${ENDPOINTS.JOBS}`, formData);
      console.log('response inside submitJobAds:');
      console.log(response);
      if (!response.status === 201) {
        throw new Error(`Failed to submit jobs: ${response.statusText}`);
      }

      const data = await response.data;
      console.log('data inside submitJobAds:');
      console.log(data);

      toast.success('Collaboration Ads created successfully');
      */
      dispatch(createCollaborationAds(formData));

      // const res = await createCollaborationAds(formData);
      // console.log(res);
      setLoading(false);
      setFormData({ ...initialState });
    } catch (error) {
      toast.error('Failed to submit jobs');
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
      toast.error('Error fetching categories');
    }
  };

  // Get all templates
  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${ENDPOINTS.GET_ALL_TEMPLATES}`, {
        method: 'GET',
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch all Templates: ${response.statusText}`);

      const data = await res.json();

      setJobTemplates(data.templates);
    } catch (error) {
      toast.error('Error fetching Templates');
    }
  };

  const fetchJobFormsAll = async () => {
    try {
      // eslint-disable-next-line no-console
      console.log(`${ENDPOINTS.GET_ALL_JOB_FORMS}`);
      const response = await fetch(`${ENDPOINTS.GET_ALL_JOB_FORMS}`, {
        method: 'GET',
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch all jobForms: ${response.statusText}`);
      // eslint-disable-next-line no-console
      console.log(response);
      const data = await response.json();
      setJobFormsAll(data.forms);
    } catch (error) {
      toast.error('Error fetching jobFormsAll');
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
      toast.error('Error fetching positions');
    }
  };

  const handleSubmit = event => {
    event.preventDefault();
    console.log('formData');
    console.log(formData);
    if (!formData.category) {
      setErrors({ category: 'Category is required' });
      toast.error('Category is required');
      return;
    }
    if (!formData.title) {
      setErrors({ title: 'Title is required' });
      toast.error('Title is required');
      return;
    }

    if (!formData.description) {
      setErrors({ description: 'Description is required' });
      toast.error('Description is required');
      return;
    }
    //
    const descriptionWordCount = getWordCount(formData.description);
    // eslint-disable-next-line no-console
    console.log(`word count ${descriptionWordCount}`);

    if (descriptionWordCount < 30) {
      setErrors({ description: 'Description must be at least 30 characters long' });
      toast.error('Description must be at least 30 characters long');
      textareaRef.current?.focus();
      return;
    }

    /* if (!formData.about) {
      setErrors({ about: 'About is required' });
      toast.error('About is required');
      return;
    }
    //
    const aboutWordCount = getWordCount(formData.about);
    // eslint-disable-next-line no-console
    console.log(`word count ${aboutWordCount}`);

    if (aboutWordCount < 30) {
      setErrors({ about: 'About must be at least 30 words long' });
      toast.error('About must be at least 30 words long');
      textareaRef.current?.focus();
      return;
    } */
    if (!formData.requirements) {
      setErrors({ requirements: 'Requirements is required' });
      toast.error('Requirements is required');
      return;
    }
    //
    const requirementsWordCount = getWordCount(formData.requirements);
    // eslint-disable-next-line no-console
    console.log(`word count ${requirementsWordCount}`);

    if (requirementsWordCount < 30) {
      setErrors({ requirements: 'Requirements must be at least 30 words long' });
      toast.error('Requirements must be at least 30 words long');
      textareaRef.current?.focus();
      return;
    }
    if (!formData.projects) {
      setErrors({ projects: 'Projects is required' });
      toast.error('Projects is required');
      return;
    }
    //
    const projectsWordCount = getWordCount(formData.projects);
    // eslint-disable-next-line no-console
    console.log(`word count ${projectsWordCount}`);

    if (projectsWordCount < 1) {
      setErrors({ projects: 'Projects must be at least 1 word long' });
      toast.error('Projects must be at least 1 word long');
      textareaRef.current?.focus();
      return;
    }
    if (!formData.ourCommunity) {
      setErrors({ ourCommunity: 'Our Community is required' });
      toast.error('Our Community is required');
      return;
    }
    //
    const ourCommunityWordCount = getWordCount(formData.ourCommunity);
    // eslint-disable-next-line no-console
    console.log(`word count ${ourCommunityWordCount}`);

    if (ourCommunityWordCount < 30) {
      setErrors({ ourCommunity: 'Our Community must be at least 30 words long' });
      toast.error('Our Community must be at least 30 words long');
      textareaRef.current?.focus();
      return;
    }

    if (!formData.imageUrl) {
      setErrors({ imageUrl: 'ImageURL is required' });
      toast.error('ImageURL is required');
      return;
    }

    if (!formData.imageUrl || !isValidDropboxImageUrl(formData.imageUrl)) {
      setErrors({ imageUrl: 'Enter a valid ImageURL' });
      toast.error('Enter a valid ImageURL');
      return;
    }
    if (!formData.location) {
      setErrors({ location: 'Location is required' });
      toast.error('Location is required');
      return;
    }
    if (formData.location !== 'remote') {
      setErrors({ location: 'Location should be remote only' });
      toast.error('Location should be remote only');
      return;
    }

    if (!formData.applyLink) {
      setErrors({ applyLink: 'Apply Link is required' });
      toast.error('Apply Link is required');
      return;
    }
    // eslint-disable-next-line no-console
    console.log('formData.applyLink');
    // eslint-disable-next-line no-console
    console.log(formData.applyLink);
    // eslint-disable-next-line no-console
    console.log(isValidUrl(applyLink));
    if (!formData.applyLink || !isValidUrl(formData.applyLink)) {
      setErrors({ applyLink: 'Enter the valid Apply Link' });
      toast.error('Enter the valid Apply Link');
      return;
    }
    // eslint-disable-next-line no-console
    console.log(formData.jobDetailsLink);
    // eslint-disable-next-line no-console
    console.log(isValidUrl(formData.jobDetailsLink));

    const emptyMsg = '';
    setErrors(emptyMsg);
    submitJobAds();
    setFormData({ ...initialState });
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
    if (name === 'category') {
      if (value === '') {
        setPositions([]);
        return;
      }
      fetchPositions(value);
    }
    if (name === 'applyLink') {
      // eslint-disable-next-line no-console
      console.log('APPLYLINK');

      // eslint-disable-next-line no-console
      console.log(value);
    }
  };

  useEffect(() => {
    fetchCategories();
    //  fetchPositions();
    fetchJobFormsAll();
    fetchTemplates();
  }, []);

  return (
    <div
      className={`${styles['jobAds-creation']} ${
        darkMode ? styles['user-collaboration-dark-mode'] : ''
      }`}
    >
      {canCreateCollabJobAds === false ? (
        <div>You do not have permission to create Collaboration Job Ads.</div>
      ) : canCreateCollabJobAds === true ? (
        <>
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

          <form className={styles['user-collaboration-container']} onSubmit={handleSubmit}>
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
              {!errors.category ? null : <div className={styles.error}>{errors.category}</div>}
            </div>

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
              {!errors.title ? null : <div className={styles.error}>{errors.title}</div>}
            </div>
            {textareaFields.map((field, display, idx) => (
              <div className={styles['input-error']} key={field.key}>
                <label className={styles['input-label']} htmlFor={field.key}>
                  {field.display}
                </label>

                <Editor
                  className={styles['jobAds-input']}
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  init={TINY_MCE_INIT_OPTIONS_MEDIA}
                  id={field.key}
                  value={formData[field.key] || ''}
                  onEditorChange={newVal => setFormData(prev => ({ ...prev, [field.key]: newVal }))}
                />
                {!errors[field.key] ? null : (
                  <div className={styles.error}>{errors[field.key]}</div>
                )}
              </div>
            ))}
            {formFields.map((field, display, idx) => (
              <div className={styles['input-error']} key={field.key}>
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
              {!errors.applyLink ? null : <div className={styles.error}>{errors.applyLink}</div>}
            </div>

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
        </>
      ) : (
        ''
      )}
    </div>
  );
}

export default JobAdsCreation;
