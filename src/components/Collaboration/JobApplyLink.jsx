import { Route, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../utils/URL';

//import { ApiEndpoint } from '../../utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';
import styles from '../Collaboration/JobApplyLink.module.css';

function JobApplyLink() {
  //  const { templateId } = useParams();
  const { formId } = useParams();

  const [jobTemplate, setJobTemplate] = useState([]);
  const [jobForms, setJobForms] = useState([]);

  const [loading, setLoading] = useState(false);

  const getTemplateDetails = async () => {
    console.log(`templateId: ${templateId}`);

    try {
      setLoading(true);
      console.log(`res is ${ENDPOINTS.APIEndpoint()}/templates/${templateId}`);
      const response = await fetch(`${ENDPOINTS.APIEndpoint()}/templates/${templateId}`, {
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

      setJobTemplate(data);
      // console.log(jobTemplate);
      // console.log(jobTemplate.template.fields.length);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching Templates');
    }
  };

  const getJobForms = async () => {
    console.log(`formId: ${formId}`);

    try {
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
    getTemplateDetails();
    getJobForms();
    loading === false ? console.log(jobTemplate) : console.log('loading');
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
      {/*<h1> {jobTemplate.template && jobTemplate.template.name}</h1>
      <form onSubmit={handleSubmit}>
        {jobTemplate.template &&
        jobTemplate.template.fields &&
        jobTemplate.template.fields.length > 0
          ? jobTemplate.template.fields.map(field => (
              <div key={field._id}>
                <h3> {field.questionText}</h3>
                <p> Testing {field.questionType}</p>

                {field.questionType === 'textbox' ? (
                  <input type="text" name={field._id} />
                ) : field.questionType === 'textarea' ? (
                  <textarea name={field._id} rows={5} />
                ) : field.questionType === 'checkbox' ? (
                  <fieldset>
                    {field.options && field.options.length > 0
                      ? field.options.map(option => (
                          <>
                            <span> {option} </span>
                            <input key={option} type="checkbox"></input>
                          </>
                        ))
                      : null}
                  </fieldset>
                ) : field.questionType === 'radio' ? (
                  <fieldset>
                    {field.options && field.options.length > 0
                      ? field.options.map(option => (
                          <>
                            <input key={option} type="radio" name={field._id} />
                            <span> {option} </span>
                          </>
                        ))
                      : null}
                  </fieldset>
                ) : field.questionType === 'date' ? (
                  <input type="date" name={field._id} />
                ) : field.questionType === 'dropdown' ? (
                  <select name={field._id}>
                    {field.options && field.options.length > 0
                      ? field.options.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))
                      : null}
                  </select>
                ) : (
                  <p> another field type </p>
                )}
              </div>
            ))
          : 'no fields available'}
        <div className={styles.buttonGroup}>
          <button type="submit" className="btn-primary">
            Submit
          </button>
          <button type="cancel" onClick={resetForm}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  ) : (
    'Loading '
  ); */}
      <h1> {jobForms.form && jobForms.form.desc}</h1>
      <form onSubmit={handleSubmit}>
        {jobForms.form && jobForms.form.questions && jobForms.form.questions.length > 0
          ? jobForms.form.questions.map(question => (
              <div key={question._id}>
                <h3> {question.label}</h3>

                {question.type === 'text' ? (
                  <input type="text" name={question._id} />
                ) : question.type === 'textarea' ? (
                  <textarea name={question._id} rows={5} />
                ) : question.type === 'checkbox' ? (
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
                ) : question.type === 'radio' ? (
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
                ) : question.type === 'email' ? (
                  <input type="email" name={question._id} />
                ) : question.type === 'date' ? (
                  <input type="date" name={question._id} />
                ) : question.type === 'file' ? (
                  <input type="file" name={question._id} />
                ) : question.type === 'dropdown' ? (
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
                  <p> another field type {question.type}</p>
                )}
              </div>
            ))
          : 'no fields available'}
        <div className={styles.buttonGroup}>
          <button type="submit" className="btn-primary">
            Submit
          </button>
          <button type="cancel" onClick={resetForm}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  ) : (
    'Loading '
  );
}
export default JobApplyLink;
