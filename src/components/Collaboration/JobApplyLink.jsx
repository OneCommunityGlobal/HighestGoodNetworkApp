import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';
import styles from '../Collaboration/JobApplyLink.module.css';

function QuestionOptions({ options, renderOption }) {
  if (!options?.length) return null;
  return options.map(option => renderOption(option));
}

function ApplyQuestionField({ question }) {
  const { questionType, _id: questionId, options } = question;

  switch (questionType) {
    case 'textbox':
      return <input type="text" name={questionId} />;
    case 'textarea':
      return <textarea name={questionId} rows={5} />;
    case 'email':
      return <input type="email" name={questionId} />;
    case 'date':
      return <input type="date" name={questionId} />;
    case 'file':
      return <input type="file" name={questionId} />;
    case 'checkbox':
      return (
        <fieldset>
          <QuestionOptions
            options={options}
            renderOption={option => (
              <label key={option} htmlFor={`${questionId}-${option}`}>
                <span>{option}</span>
                <input id={`${questionId}-${option}`} type="checkbox" />
              </label>
            )}
          />
        </fieldset>
      );
    case 'radio':
      return (
        <fieldset>
          <QuestionOptions
            options={options}
            renderOption={option => (
              <label key={option} htmlFor={`${questionId}-${option}`}>
                <input id={`${questionId}-${option}`} type="radio" name={questionId} />
                <span>{option}</span>
              </label>
            )}
          />
        </fieldset>
      );
    case 'dropdown':
      return (
        <select name={questionId}>
          <QuestionOptions
            options={options}
            renderOption={option => (
              <option key={option} value={option}>
                {option}
              </option>
            )}
          />
        </select>
      );
    default:
      return <p>another field type {questionType}</p>;
  }
}

function JobApplyLink() {
  const [jobFormsAll, setJobFormsAll] = useState([]);
  const [jobForms, setJobForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applyLink, setApplyLink] = useState('');
  const darkMode = useSelector(state => state.theme.darkMode);

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
    } catch (error) {
      toast.error(`Error fetching JobForms: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchJobFormsAll();
  }, []);

  useEffect(() => {
    void getJobForms();
  }, [applyLink]);

  if (loading) {
    return 'Loading ';
  }

  const questions = jobForms.form?.questions ?? [];

  return (
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
        onChange={event => setApplyLink(event.target.value)}
        name="applyLink"
      >
        <option value="">Select from job forms</option>
        {jobFormsAll.map(({ _id, title }) => (
          <option key={_id} value={`${ENDPOINTS.APIEndpoint()}/jobforms/${_id}`}>
            {title}
          </option>
        ))}
      </select>

      <h1>{jobForms.form?.title}</h1>
      <h5>{jobForms.form?.description}</h5>

      <form
        onSubmit={e => {
          e.preventDefault();
        }}
      >
        {questions.length > 0
          ? questions.map(question => (
              <div key={question._id}>
                <h3>{question.questionText}</h3>
                <ApplyQuestionField question={question} />
              </div>
            ))
          : 'no fields available'}
      </form>
    </div>
  );
}

export default JobApplyLink;
