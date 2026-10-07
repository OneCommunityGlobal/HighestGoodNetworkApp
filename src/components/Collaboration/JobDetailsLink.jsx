import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';

import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import { ENDPOINTS } from '../../utils/URL';

import OneCommunityImage from '../../assets/images/logo2.png';
import styles from '../Collaboration/JobDetailsLink.module.css';
import {
  isDegreeMajorQuestion,
  isTechnologyExperienceQuestion,
  missingTechnologyYearMessages,
  selectedTechnologyNames,
  serializeTechnologyAnswer,
  syncTechnologyDetails,
} from './jobQuestionFollowUps';

const ALLOWED_UPLOAD_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]);
const ALLOWED_UPLOAD_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

function JobDetailsLink() {
  const { givenId } = useParams();
  const initialState = {
    formId: '',
    //    questions: [],
    answers: [],
  };
  const [formData, setFormData] = useState({ ...initialState });

  const darkMode = useSelector(state => state.theme.darkMode);
  const [jobsDetail, setJobsDetail] = useState([]);

  const [jobsDetailById, setJobsDetailById] = useState([]);
  const [loading, setLoading] = useState();

  const [jobForms, setJobForms] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [errors, setErrors] = useState({});

  const [technologyExperience, setTechnologyExperience] = useState({});
  const getJobDetails = async (givenCategory, givenPosition) => {
    setLoading(true);
    // Note: route params from the jobDetailsLink are URL-encoded (e.g. %26, %2F).
    // We decode them to get plain text values ("Creative & Media", "Photoshop/Graphic Designer")
    // and then re-encode once when building the API URL to avoid double-encoding (e.g. %252F).

    const decodedCategory = decodeURIComponent(givenCategory);
    const decodedPosition = decodeURIComponent(givenPosition);
    // eslint-disable-next-line no-console
    console.log(`category: ${decodeURIComponent(givenCategory)}`);
    // eslint-disable-next-line no-console
    console.log(`position: ${decodeURIComponent(givenPosition)}`);

    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs?
        category=${encodeURIComponent(decodedCategory)}
        &position=${encodeURIComponent(decodedPosition)}`,
        {
          method: 'GET',
        },
      );
      // eslint-disable-next-line no-console
      console.log(response);
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log(data.jobs);
      setJobsDetail(data.jobs);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching jobs Details');
    }
  };

  const getJobDetailsById = async id => {
    setLoading(true);

    const givenIdDecoded = decodeURIComponent(givenId);
    // eslint-disable-next-line no-console
    console.log(`givenIdDecoded: ${decodeURIComponent(givenIdDecoded)}`);

    try {
      const response = await fetch(`${ApiEndpoint}/jobs/${id}`, {
        method: 'GET',
      });
      // eslint-disable-next-line no-console
      console.log(response);
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log(data);
      setJobsDetailById(data);

      //      getJobForms(jobsDetailById.applyLink);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching jobs Details');
    }
  };

  const getJobForms = async applyLink => {
    // eslint-disable-next-line no-console
    console.log(applyLink);
    const formId = applyLink.split('jobforms/')[1];
    // eslint-disable-next-line no-console
    console.log(formId);
    // eslint-disable-next-line no-console
    console.log(`formId: ${formId}`);

    try {
      // setLoading(true);
      // eslint-disable-next-line no-console
      console.log(`res is ${ENDPOINTS.APIEndpoint()}/jobforms/${formId}`);
      const response = await fetch(`${ENDPOINTS.APIEndpoint()}/jobforms/${formId}`, {
        method: 'get',
      });
      // eslint-disable-next-line no-console
      console.log(response);
      if (!response.ok) throw new Error(`Failed to fetch all jobForms : ${response.statusText}`);

      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log(data);

      setJobForms(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error');
      // eslint-disable-next-line no-console
      console.log(error);
      toast.error('Error fetching JobForms');
    }
  };

  useEffect(() => {
    getJobDetailsById(givenId);
    if (!loading && jobsDetailById?.applyLink) getJobForms(jobsDetailById.applyLink);
  }, []);

  useEffect(() => {
    if (!loading && jobsDetailById?.applyLink) getJobForms(jobsDetailById.applyLink);
  }, [loading, jobsDetailById.applyLink]);

  useEffect(() => {
    if (!loading && jobsDetailById?.applyLink) {
      const applyLinkFormId = jobsDetailById?.applyLink.split('jobforms/')[1];
      // eslint-disable-next-line no-console
      console.log(applyLinkFormId);
      setFormData(prev => ({ ...prev, formId: applyLinkFormId }));
    }
  }, [loading, jobsDetailById.applyLink]);

  const getValue = name => {
    if (!Array.isArray(formData.answers)) return ''; // ✅ fallback
    const found = formData.answers?.find(a => a.questionId === name || a.label === name);
    return found ? found.answer : '';
  };
  const handleChange = (event, idx) => {
    const { id, name, value } = event.target;

    setFormData(prev => ({
      ...prev,
      answers: Array.isArray(prev.answers)
        ? [
            ...prev.answers.filter(a => a.questionId !== id),
            { questionId: id, questionText: name, answer: value, order: idx },
          ]
        : [{ questionId: id, questionText: name, answer: value, order: idx }],
    }));
  };

  const handleFileChange = async event => {
    const { id, name } = event.target;
    console.log(`name  is ${event.target.name}`);

    console.log(`name  is ${event.target.files[0].name}`);
    const selFile = event.target.files[0];
    if (!selFile) return;
    const extension = selFile.name.includes('.')
      ? selFile.name.slice(selFile.name.lastIndexOf('.')).toLowerCase()
      : '';
    if (selFile.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit. Please choose a smaller file.');
      event.target.value = '';
      return;
    }
    if (!ALLOWED_UPLOAD_TYPES.has(selFile.type) && !ALLOWED_UPLOAD_EXTENSIONS.includes(extension)) {
      toast.error('Invalid file type. Please upload a PDF, DOC, DOCX, JPG, or PNG file.');
      event.target.value = '';
      return;
    }
    try {
      setUploadingFiles(prev => ({ ...prev, [name]: true }));
      console.log(uploadingFiles);

      const formResumeData = new FormData();
      formResumeData.append('file', selFile);
      // eslint-disable-next-line no-console
      console.log(`res is ${ENDPOINTS.APIEndpoint()}/jobforms/responses/upload`);

      const formResumeDataResponse = await axios.post(
        `${ENDPOINTS.APIEndpoint()}/jobforms/responses/upload`,
        formResumeData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      // eslint-disable-next-line no-console
      console.log('formResumeDataResponse');
      // eslint-disable-next-line no-console
      console.log(formResumeDataResponse);

      const responseData = await formResumeDataResponse.data;
      // eslint-disable-next-line no-console
      console.log('data');
      // eslint-disable-next-line no-console
      console.log(responseData);
      console.log(responseData?.data?.url);
      const dropboxLink = responseData?.data?.url;
      setFormData(prev => ({
        ...prev,
        answers: Array.isArray(prev.answers)
          ? [
              ...prev.answers.filter(a => a.questionId !== id),
              { questionId: id, questionText: name, answer: dropboxLink },
            ]
          : [{ questionId: id, questionText: name, answer: dropboxLink }],
      }));
      setUploadingFiles(prev => ({ ...prev, [name]: false }));
      console.log(uploadingFiles);
    } catch (err) {
      console.error('Upload failed', err);
      let errorMessage = 'File upload failed.';
      if (err.response) {
        console.log('Backend response', err.response.data);
        errorMessage = err.response.data?.message || `Server error (${err.response.status})`;
        toast.error(errorMessage);
      } else if (err.request) {
        console.log('No response received');
        errorMessage = 'No response from server. Check your connection.';
      } else {
        console.error('Request Error', err.request);
        errorMessage = err.message;
      }
      console.log('err');
      console.log(err);
      toast.error(errorMessage);
      setUploadingFiles(prev => ({ ...prev, [name]: false }));
      console.log(uploadingFiles);
    }
  };

  const submitJobforms = async () => {
    // eslint-disable-next-line no-console
    console.log('inside submitJobForms');
    // eslint-disable-next-line no-console
    console.log(formData);

    try {
      setLoading(true);

      // eslint-disable-next-line no-console
      console.log(`res is ${ENDPOINTS.APIEndpoint()}/jobforms/responses`);

      const answers = (formData.answers || []).map(answer => {
        const details = technologyExperience[answer.questionId];
        if (!details) return answer;
        return {
          ...answer,
          answer: serializeTechnologyAnswer(answer.answer, details),
        };
      });
      const response = await axios.post(`${ENDPOINTS.APIEndpoint()}/jobforms/responses`, {
        ...formData,
        answers,
      });
      // eslint-disable-next-line no-console
      console.log('response');
      // eslint-disable-next-line no-console
      console.log(response);

      const data = await response.data;
      // eslint-disable-next-line no-console
      console.log('data');
      // eslint-disable-next-line no-console
      console.log(data);

      setLoading(false);
      setFormData({ ...initialState });
      setTechnologyExperience({});
      toast.success('Responses submitted successfully');
    } catch (error) {
      // If server responded with error (4xx or 5xx)
      if (error.response) {
        console.error(error.response.status);
        console.error(error.response.data);
        toast.error(error.response.status);
      } else if (error.request) {
        console.error('No response:', error.request);
        toast.error('No response from server. Check your connection.');
      } else {
        console.log(error);
        toast.error('Failed to submit responses');
      }
    }
  };
  const inputValidation = () => {
    //check all the inputs are filled
    if (!jobForms?.form?.questions || !formData?.answers) {
      toast.error('Missing form structure or answers data.');
      return false;
    }
    const questions = jobForms.form.questions.filter(question => !isDegreeMajorQuestion(question));
    for (let i = 0; i < questions.length; i += 1) {
      const question = questions[i];
      const answerObj = formData.answers.find(a => a.questionId === question._id);
      const answerEmpty =
        !answerObj ||
        answerObj.answer == null ||
        answerObj.answer === '' ||
        (Array.isArray(answerObj.answer) && answerObj.answer.length === 0);
      if (answerEmpty && question.isRequired) {
        setErrors({
          [question.questionText]: `${question.questionText} is required`,
        });
        toast.error(`${question.questionText} is required`);
        return false;
      }
      if (isTechnologyExperienceQuestion(question)) {
        const missingYears = missingTechnologyYearMessages(
          answerObj?.answer,
          technologyExperience[question._id],
        );
        if (missingYears.length > 0) {
          toast.error(`${missingYears[0]} is required`);
          return false;
        }
      }
      setErrors({
        [question.questionText]: '',
      });
    }
    return true;
  };

  const setAnswer = (question, idx, answer) => {
    setFormData(prev => ({
      ...prev,
      answers: [
        ...(Array.isArray(prev.answers)
          ? prev.answers.filter(a => a.questionId !== question._id)
          : []),
        {
          questionId: question._id,
          questionText: question.questionText,
          answer,
          order: idx,
        },
      ],
    }));
  };

  const toggleCheckbox = (question, idx, option) => {
    const current = selectedTechnologyNames(
      formData.answers.find(a => a.questionId === question._id)?.answer,
    );
    const next = current.includes(option)
      ? current.filter(item => item !== option)
      : [...current, option];
    setAnswer(question, idx, next);
    if (isTechnologyExperienceQuestion(question)) {
      setTechnologyExperience(prev => ({
        ...prev,
        [question._id]: syncTechnologyDetails(prev[question._id], next),
      }));
    }
  };

  const updateTechnologyDetail = (questionId, technology, patch) => {
    setTechnologyExperience(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [technology]: {
          fullTime: false,
          years: '',
          ...(prev[questionId]?.[technology] || {}),
          ...patch,
        },
      },
    }));
  };

  const handleSubmit = e => {
    console.log(formData);

    e.preventDefault();
    // inputValidation();
    if (!inputValidation()) {
      return;
    }
    submitJobforms();
  };
  const resetForm = e => {
    alert('form cancelled');
  };
  useEffect(() => {
    console.log('updated errors:', errors);
  }, [errors]);

  return (
    <div className={`${styles['job-details-landing']} ${darkMode ? styles['dark-mode'] : ''}`}>
      <div className={styles['job-details-header']}>
        <a
          href="https://www.onecommunityglobal.org/collaboration/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={OneCommunityImage} alt="One Community Logo" />
        </a>
      </div>
      {!loading ? (
        <div className={styles['job-details-container']}>
          {jobsDetailById.imageUrl &&
            !/example\.com|placeholder\.com/i.test(jobsDetailById.imageUrl) && (
              <img
                className={styles['job-details-image-card']}
                src={jobsDetailById.imageUrl}
                alt="Job Details"
                onError={e => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          <h2>
            {`Job Details for Category: ${jobsDetailById.category},
           Position: ${jobsDetailById.title}`}
          </h2>
          {['description', 'requirements', 'projects', 'ourCommunity'].map(
            key =>
              jobsDetailById[key] && (
                <div
                  key={key}
                  className={styles['job-details-card']}
                  dangerouslySetInnerHTML={{ __html: jobsDetailById[key] }}
                />
              ),
          )}
          <form onSubmit={handleSubmit} className={styles['job-form-questions']}>
            {jobForms.form && jobForms.form.questions && jobForms.form.questions.length > 0
              ? jobForms.form.questions
                  .filter(question => !isDegreeMajorQuestion(question))
                  .map((question, index) => (
                    <div key={question._id} className={styles['input-error']}>
                      <h3> {question.questionText}</h3>
                      {question.questionType === 'text' || question.questionType === 'textbox' ? (
                        <input
                          type="textbox"
                          name={question.questionText}
                          id={question._id}
                          key={index}
                          value={getValue(question._id)}
                          onChange={e => handleChange(e, index)}
                        />
                      ) : question.questionType === 'textarea' ? (
                        <textarea
                          rows={5}
                          name={question.questionType}
                          id={question._id}
                          key={index}
                          value={getValue(question._id)}
                          onChange={e => handleChange(e, index)}
                        />
                      ) : question.questionType === 'dropdown' ? (
                        <select
                          name={question.questionType}
                          id={question._id}
                          value={getValue(question._id)}
                          onChange={e => handleChange(e, index)}
                        >
                          <option value="">-- Select an option --</option>
                          {question.options && question.options.length > 0
                            ? question.options.map(option => (
                                <option key={option.value} value={option}>
                                  {option}
                                </option>
                              ))
                            : null}
                        </select>
                      ) : question.questionType === 'checkbox' ? (
                        <>
                          <fieldset>
                            {question.options && question.options.length > 0
                              ? question.options.map(option => (
                                  <label key={String(option)}>
                                    <input
                                      type="checkbox"
                                      name={question._id}
                                      value={option}
                                      checked={selectedTechnologyNames(
                                        formData.answers.find(a => a.questionId === question._id)
                                          ?.answer,
                                      ).includes(String(option))}
                                      onChange={() =>
                                        toggleCheckbox(question, index, String(option))
                                      }
                                    />{' '}
                                    {option}
                                  </label>
                                ))
                              : null}
                          </fieldset>
                          {isTechnologyExperienceQuestion(question) &&
                            selectedTechnologyNames(
                              formData.answers.find(a => a.questionId === question._id)?.answer,
                            ).map(technology => (
                              <div key={technology} className={styles.technologyFollowUp}>
                                <span className={styles.technologyName}>{technology}</span>
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={Boolean(
                                      technologyExperience[question._id]?.[technology]?.fullTime,
                                    )}
                                    onChange={e =>
                                      updateTechnologyDetail(question._id, technology, {
                                        fullTime: e.target.checked,
                                      })
                                    }
                                  />{' '}
                                  full-time
                                </label>
                                <label>
                                  Years
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    className={styles.yearsInput}
                                    value={
                                      technologyExperience[question._id]?.[technology]?.years ?? ''
                                    }
                                    onChange={e =>
                                      updateTechnologyDetail(question._id, technology, {
                                        years: e.target.value,
                                      })
                                    }
                                    aria-label={`Years of experience in ${technology}`}
                                  />
                                </label>
                              </div>
                            ))}
                        </>
                      ) : question.questionType === 'radio' ? (
                        <fieldset>
                          {question.options && question.options.length > 0
                            ? question.options.map((option, optIndex) => (
                                <>
                                  <input
                                    type="radio"
                                    key={option}
                                    id={`${question.questionText}-${optIndex}`}
                                    name={question.questionText}
                                    value={option} // what’s sent when selected
                                    checked={
                                      formData.answers.find(a => a.questionId === question._id)
                                        ?.answer === String(option)
                                    }
                                    onChange={() => setAnswer(question, index, String(option))}
                                  />
                                  <span> {option} </span>
                                </>
                              ))
                            : null}
                        </fieldset>
                      ) : question.questionType === 'email' ? (
                        <input
                          type="email"
                          key={index}
                          name={question.questionText}
                          id={question._id}
                          value={getValue(question._id)}
                          onChange={e => handleChange(e, index)}
                        />
                      ) : question.questionType === 'date' ? (
                        <input
                          type="date"
                          name={question.questionText}
                          id={question._id}
                          key={index}
                          value={getValue(question._id)}
                          onChange={e => handleChange(e, index)}
                        />
                      ) : question.questionType === 'file' ? (
                        <div className={styles['user-input']}>
                          <input
                            type="file"
                            name={question.questionText}
                            id={question._id}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={e => handleFileChange(e, index)}
                          />

                          {uploadingFiles[question.questionText] ? (
                            <p style={{ color: 'blue' }}> Uploading </p>
                          ) : formData?.answers?.find(a => a.questionId === question._id)
                              ?.answer ? (
                            <>
                              <p style={{ color: 'green' }}>File Uploaded Successfully </p>
                              <a
                                href={
                                  formData?.answers?.find(a => a.questionId === question._id)
                                    ?.answer
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View File
                              </a>
                            </>
                          ) : null}
                        </div>
                      ) : (
                        <p> another field type {question.type}</p>
                      )}
                      <p className={styles['error-message']}>{errors?.[question.questionText]}</p>
                    </div>
                  ))
              : 'no Questions available'}
            <div className={styles.buttonGroup}>
              <button type="submit" className="btn-primary">
                Submit now
              </button>
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        'Loading '
      )}
    </div>
  );
}

export default JobDetailsLink;
