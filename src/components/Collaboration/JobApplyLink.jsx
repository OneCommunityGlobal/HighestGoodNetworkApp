import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../utils/URL';

import OneCommunityImage from '../../assets/images/logo2.png';
import styles from '../Collaboration/JobApplyLink.module.css';

function JobApplyLink() {
  const [jobFormsAll, setJobFormsAll] = useState([]);
  const [jobForms, setJobForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applyLink, setApplyLink] = useState('');

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
      toast.error('Error fetching jobFormsAll');
    }
  };
  useEffect(() => {
    void fetchJobFormsAll();
  }, []);

  const getJobForms = async () => {
    if (!applyLink) return;

    try {
      setLoading(true);
      const selectedFormId = new URL(applyLink).pathname.split('/').pop();
      const response = await fetch(`${ENDPOINTS.APIEndpoint()}/jobforms/${selectedFormId}`, {
        method: 'get',
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch all Templates: ${response.statusText}`);

      const data = await response.json();
      setJobForms(data);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching JobForms');
      setLoading(false);
    }
  };

  const darkMode = useSelector(state => state.theme.darkMode);

  const handleSubmit = e => {
    e.preventDefault();
  };
  const handleChange = event => {
    const { value } = event.target;
    setApplyLink(value);
  };
  useEffect(() => {
    void getJobForms();
  }, [applyLink]);
  return !loading ? (
    <div className={darkMode ? styles.darkModeContainer : styles.lightModeContainer}>
      <div className={styles['ApplyLink-header']}>
        <a
          href="https://www.onecommunityglobal.org/collaboration/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={OneCommunityImage} alt="One Community Logo" />
        </a>
      </div>
      <select
        className={styles['jobAds-input']}
        id="applyLink"
        value={applyLink}
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

      <h1> {jobForms.form && jobForms.form.title}</h1>
      <h5> {jobForms.form && jobForms.form.description}</h5>

      <form onSubmit={handleSubmit}>
        {jobForms.form && jobForms.form.questions && jobForms.form.questions.length > 0
          ? jobForms.form.questions.map(question => (
              <div key={question._id}>
                <h3> {question.questionText}</h3>

                {question.questionType === 'textbox' ? (
                  <input type="text" name={question._id} />
                ) : question.questionType === 'textarea' ? (
                  <textarea name={question._id} rows={5} />
                ) : question.questionType === 'checkbox' ? (
                  <fieldset>
                    {question.options && question.options.length > 0
                      ? question.options.map(option => (
                          <>
                            <span> {option} </span>
                            <input key={option} type="checkbox"></input>
                          </>
                        ))
                      : null}
                  </fieldset>
                ) : question.questionType === 'radio' ? (
                  <fieldset>
                    {question.options && question.options.length > 0
                      ? question.options.map(option => (
                          <>
                            <input key={option} type="radio" name={field._id} />
                            <span> {option} </span>
                          </>
                        ))
                      : null}
                  </fieldset>
                ) : question.questionType === 'email' ? (
                  <input type="email" name={question._id} />
                ) : question.questionType === 'date' ? (
                  <input type="date" name={question._id} />
                ) : question.questionType === 'file' ? (
                  <input type="file" name={question._id} />
                ) : question.questionType === 'dropdown' ? (
                  <select name={question._id}>
                    {question.options && question.options.length > 0
                      ? question.options.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))
                      : null}
                  </select>
                ) : (
                  <p> another field type {question.questionType}</p>
                )}
              </div>
            ))
          : 'no fields available'}
      </form>
    </div>
  ) : (
    'Loading '
  );
}
export default JobApplyLink;
