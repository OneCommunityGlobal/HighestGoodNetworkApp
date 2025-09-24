import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './JobAdsCreation.module.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ApiEndpoint } from '~/utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';
function JobAdsCreation() {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  //const [description, setDescription] = useState('');
  const [loading, setLoading] = useState('');
  const initalState = { title: title, category: category, description: '' };
  const [formData, setFormData] = useState({ ...initalState });
  const [categories, setCategories] = useState([]);
  const [positions, setPositions] = useState([]);
  const [errors, setErrors] = useState({});
  const darkMode = useSelector(state => state.theme.darkMode);

  const submitJobAds = async () =>
    //givenSearchTerm, givenCategory, givenPosition
    {
      setLoading(true);
      console.log(formData);
      try {
        const response = await axios.post(`${ApiEndpoint}/jobs`, formData);

        console.log(response);
        if (!response.ok) {
          throw new Error(`Failed to submit jobs: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.log(error);
        toast.error('Failed to submit jobs');
      }
    };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/categories`, { method: 'GET' });
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);

      const data = await response.json();
      const sortedCategories = data.categories.sort((a, b) => a.localeCompare(b));
      setCategories(sortedCategories);
    } catch (error) {
      toast.error('Error fetching categories');
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/positions`, { method: 'GET' });
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
    alert('handleSubmit');
    submitJobAds();
  };

  const handleCancel = event => {
    event.preventDefault();
    alert('handleCancel');
    const emptyMsg = '';
    setErrors(emptyMsg);
    setFormData({ ...initalState });
  };

  const handleCategoryChange = event => {
    const selectedValue = event.target.value;

    setCategory(selectedValue);
    setFormData(prev => ({ ...prev, category: selectedValue }));
  };

  const handlePositionChange = event => {
    const selectedValue = event.target.value;

    setTitle(selectedValue);
    setFormData(prev => ({ ...prev, title: selectedValue }));
    //    fetchSummaries(searchTerm, category, selectedValue);
    //    fetchJobAds(searchTerm, category, selectedValue);
  };

  const handleDescriptionChange = event => {
    const { name, value } = event.target;

    // setCategory(selectedValue);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchCategories();
    fetchPositions();
  }, []); // Re-fetch job ads when page or category changes

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
        <label className={styles['input-item']}>
          <span className={styles['input-label']}>Title</span>
          <select
            className={styles['jobAds-input']}
            value={formData.title}
            name="SelectPosition"
            onChange={handlePositionChange}
          >
            <option value="">Select from Positions</option>
            {positions.map(specificPosition => (
              <option key={specificPosition} value={specificPosition}>
                {specificPosition}
              </option>
            ))}
          </select>
        </label>
        <label className={styles['input-item']}>
          <span className={styles['input-label']}>Category</span>
          <select
            className={styles['jobAds-input']}
            value={formData.category}
            onChange={handleCategoryChange}
            name="selectCategory"
          >
            <option value="">Select from Categories</option>
            {categories.map(specificCategory => (
              <option key={specificCategory} value={specificCategory}>
                {specificCategory}
              </option>
            ))}
          </select>
        </label>
        <label className={styles['input-item']}>
          <span className={styles['input-label']}>Description</span>
          <textarea
            className={styles['jobAds-input']}
            value={formData.description}
            placeholder="Enter the description"
            onChange={handleDescriptionChange}
            name="description"
          />
        </label>
        <div className={styles['jobAds-creation-button-group']}>
          <button type="submit" className={styles['submit-button']}>
            Submit Collab Ads
          </button>
          <button type="button" className={styles['cancel-button']} onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default JobAdsCreation;
