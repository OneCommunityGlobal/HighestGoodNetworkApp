import { Route, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../utils/URL';

//import { ApiEndpoint } from '../../utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';
import styles from '../Collaboration/JobApplyLink.module.css';

function JobApplyLink() {
  const { formId } = useParams();
  const [jobFormsAll, setJobFormsAll] = useState([]);

  const [jobForms, setJobForms] = useState([]);

  const [loading, setLoading] = useState(false);
  const [applyLink, setApplyLink] = useState('');
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
  useEffect(() => {
    fetchJobFormsAll();
  }, []);

  const getJobForms = async () => {
    // console.log(`formId: ${formId}`);
    console.log(`applyLink:${applyLink}`);
    const formId = new URL(applyLink).pathname.split('/').pop();

    try {
      setLoading(true);
      /*console.log(`res is ${ENDPOINTS.APIEndpoint()}/jobforms/${formId}`);
      const response = await fetch(`${ENDPOINTS.APIEndpoint()}/jobforms/${formId}`, {
        method: 'get',
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      */
      console.log(`res is ${ENDPOINTS.APIEndpoint()}/jobforms/${formId}`);
      const response = await fetch(`${ENDPOINTS.APIEndpoint()}/jobforms/${formId}`, {
        method: 'get',
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });

      console.log(response);
      if (!response.ok) throw new Error(`Failed to fetch all Templates: ${response.statusText}`);

      const data = await response.json();
      console.log(data);
      // console.log(data.template);
      // console.log(data.template.fields.length);

      setJobForms(data);
      // console.log(jobTemplate);
      // console.log(jobTemplate.template.fields.length);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching JobForms');
    }
  };

  useEffect(() => {
    console.log(`before calling getTemplate`);
    getJobForms();
  }, []);
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleSubmit = e => {
    e.preventDefault();
    alert('form submitted');
    /* try {
      setLoading(true);
      console.log(`res is ${ENDPOINTS.APIEndpoint()}/jobforms/${formId}`);
      const response = await fetch(`${ENDPOINTS.APIEndpoint()}/jobforms/${formId}`, {
        method: 'get',
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      console.log(response);
      if (!response.ok) throw new Error(`Failed to fetch all Templates: ${response.statusText}`);

      const data = await response.json();
      console.log(data);
      // console.log(data.template);
      // console.log(data.template.fields.length);
  }*/
  };
  const handleChange = event => {
    const { name, value } = event.target;
    // eslint-disable-next-line no-console
    console.log(value);
    setApplyLink(value);
  };
  useEffect(() => {
    console.log(`before calling getJobForms`);
    getJobForms();
  }, [applyLink]);

  const resetForm = e => {
    alert('form cancelled');
  };
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
