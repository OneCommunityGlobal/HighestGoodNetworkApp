import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './JobAdsCreation.module.css';
import { toast } from 'react-toastify';

import { ENDPOINTS } from '../../utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';
import {
  isValidDropboxImageUrl,
  isValidDropboxDocUrl,
  isValidUrl,
} from '../../utils/checkValidURL';
import { createCollaborationAds } from '../../actions/collaborationAdsActions';
import getWordCount from '../../utils/getWordCount';

function JobAdsCreation() {
  const [loading, setLoading] = useState('');
  //  const formFields = ['imageUrl', 'location', 'applyLink', 'jobDetailsLink'];
  const formFields = [
    { key: 'imageUrl', display: 'Image Url' },
    { key: 'location', display: 'Location' },
    // { key: 'applyLink', display: 'Apply Link' },
    { key: 'jobDetailsLink', display: 'Job Details Link' },
  ];

  const initialState = {
    title: '',
    category: '',
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
  const dispatch = useDispatch();
  const textareaRef = useRef(null);

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
      console.log(error);
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

  const fetchJobFormsAll = async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('localStorage.getItem(access_token)');

      // eslint-disable-next-line no-console
      console.log(localStorage.getItem('token'));
      // eslint-disable-next-line no-console
      console.log(`${ENDPOINTS.GET_ALL_JOB_FORMS}`);
      const response = await fetch(`${ENDPOINTS.GET_ALL_JOB_FORMS}`, {
        method: 'GET',
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      // eslint-disable-next-line no-console
      console.log('response');
      // eslint-disable-next-line no-console
      console.log(response);
      // eslint-disable-next-line no-console
      console.log(response.ok);
      // eslint-disable-next-line no-console
      console.log(!response.ok);
      if (!response.ok) throw new Error(`Failed to fetch all jobForms: ${response.statusText}`);

      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log('fetchJobFormsAll');
      // eslint-disable-next-line no-console
      console.log(data.forms);
      //      const sortedJobFormsAll = data.forms.title.sort((a, b) => a.localeCompare(b));
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
    console.log('formData.applyLink');

    console.log(formData.applyLink);
    console.log(isValidUrl(applyLink));
    if (!formData.applyLink || !isValidUrl(formData.applyLink)) {
      setErrors({ applyLink: 'Enter the valid Apply Link' });
      toast.error('Enter the valid Apply Link');
      return;
    }

    if (!formData.jobDetailsLink) {
      setErrors({ jobDetailsLink: 'Job Details Link is required' });
      toast.error('Job Details Link is required');
      return;
    }

    if (!formData.jobDetailsLink || !isValidDropboxDocUrl(formData.jobDetailsLink)) {
      setErrors({ jobDetailsLink: 'Enter the valid Job Details Link' });
      toast.error('Enter the valid Job Details Link');
      return;
    }

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
  }, []);

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

      <form className={styles['user-collaboration-container']} onSubmit={handleSubmit}>
        <div className={styles['input-error']}>
          <div className={styles['input-item']}>
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
        </div>

        <div className={styles['input-error']}>
          <div className={styles['input-item']}>
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
        </div>

        <div className={styles['input-error']}>
          <div className={styles['input-item']}>
            <label className={styles['input-label']} htmlFor="description">
              Description
            </label>
            <textarea
              className={styles['jobAds-input']}
              value={formData.description}
              id="description"
              placeholder="Enter the description"
              onChange={handleChange}
              name="description"
              ref={textareaRef}
            />
          </div>
          {!errors.description ? null : <div className={styles.error}>{errors.description}</div>}
        </div>

        {formFields.map((field, display, idx) => (
          <div className={styles['input-error']} key={field.key}>
            <div className={styles['input-item']}>
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
          <div className={styles['input-item']}>
            <label className={styles['input-label']} htmlFor="applyLink">
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
    </div>
  );
}

export default JobAdsCreation;
