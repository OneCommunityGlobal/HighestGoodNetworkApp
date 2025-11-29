import { Route, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';

import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import { ENDPOINTS } from '../../utils/URL';

import OneCommunityImage from '../../assets/images/logo2.png';
import styles from '../Collaboration/JobDetailsLink.module.css';
import JobApplyLink from './JobApplyLink';

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

  const [resumeFile, setResumeFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState();
  const [uploadSuccess, setUploadSuccess] = useState(false);
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

  const handleApplyNow = e => {
    // eslint-disable-next-line no-console
    console.log('handleApplyNow clicked');
    //const templateId = jobsDetailById.applyLink.split('templates/')[1];
    //console.log(templateId);
    //window.location.href = `/JobApplyLink/${templateId}`;
    // eslint-disable-next-line no-console
    console.log(jobsDetailById.applyLink);
    const formId = jobsDetailById.applyLink.split('jobforms/')[1];
    // eslint-disable-next-line no-console
    console.log(formId);
    window.location.href = `/JobApplyLink/${formId}`;

    //JobApplyLink/templateId;
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
        /* headers: {
          Authorization: localStorage.getItem('token'),
        }, */
      });
      // eslint-disable-next-line no-console
      console.log(response);
      if (!response.ok) throw new Error(`Failed to fetch all jobForms : ${response.statusText}`);

      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log(data);

      setJobForms(data);
      /* setFormData({
        formId,
        questions: data.questions,
        answers: {}, // reset answers when form changes
      });*/
      //setLoading(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error');
      // eslint-disable-next-line no-console
      console.log(error);
      toast.error('Error fetching JobForms');
    }
  };

  useEffect(() => {
    // getJobDetails(category, position);
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
    // console.log('getValue');
    // console.log(name);
    if (!Array.isArray(formData.answers)) return ''; // ✅ fallback
    const found = formData.answers?.find(a => a.questionId === name || a.label === name);
    return found ? found.answer : '';
  };
  const handleChange = (event, idx) => {
    const { id, name, value } = event.target;
    /* console.log(`idx is ${idx}`);
    console.log(`id is ${id}`);

    console.log(`value is ${value}`);
    console.log(`name  is ${name}`); */
    //  if (!event.target.files[0]) setResumeFile(event.target.files[0]);

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
    if (selFile.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit. Please choose a smaller file. ');
      selFile.value = null;
      return;
    }
    if (
      ![
        'application/pdf',
        'application/doc',
        'application/docx',
        'image/jpeg',
        'image/png',
        'image/bmp',
      ].includes(selFile.type)
    ) {
      toast.error('Invalid file type. Please upload a PDF, DOC, DOCX, JPG, PNG, or BMP file.');
      selFile.value = null;

      return;
    }
    //setUploadingFiles(prev => ({ ...prev, [name]: true }));
    //    console.log(uploadingFiles);

    /* setUploadSuccess(false);
    console.log('Selected file:', selFile.name);
    setResumeFile(selFile); commented out */
    // setResumeFile(event.target.files[0]);
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
      /* commented setUploadedFile(responseData?.data);
    setUploadSuccess(true);
    */
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

  const handleUpload = async () => {
    alert('Handle Upload');
    console.log(resumeFile);
    // if (!resumeFile) return alert('select a file');
    const formResumeData = new FormData();
    formResumeData.append('file', resumeFile);
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
    console.log(responseData.data.url);
    alert(`data.url`);
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

      const response = await axios.post(`${ENDPOINTS.APIEndpoint()}/jobforms/responses`, formData);
      // eslint-disable-next-line no-console
      console.log('response');
      // eslint-disable-next-line no-console
      console.log(response);

      /*if (!response.ok)
        throw new Error(`Failed to submit the form responses: ${response.statusText}`);
      */
      const data = await response.data;
      // eslint-disable-next-line no-console
      console.log('data');
      // eslint-disable-next-line no-console
      console.log(data);

      setLoading(false);
      setFormData({ ...initialState });
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
    console.log('jobForms.questions.length');
    console.log(jobForms.form.questions.length);
    console.log(formData.answers.length);
    if (!jobForms?.form?.questions || !formData?.answers) {
      console.error('Missing form structure or answers data.');
      return false;
    }
    console.log('heree');
    //    if (formData.answers.map(a => a.answer).includes('')) return false;
    console.log(formData.answers.length);
    // loop through jobForms.form.questions and check if each questionId is present in formsData.answers
    for (let i = 0; i < jobForms.form.questions.length; i++) {
      console.log(`i is ${i}`);
      console.log(jobForms.form.questions[i]);
      console.log(jobForms.form.questions[i].isRequired);

      const questionId = jobForms.form.questions[i]._id;
      const answerObj = formData.answers.find(a => a.questionId === questionId);
      if ((!answerObj || !answerObj.answer) && jobForms.form.questions[i].isRequired) {
        //    if (jobForms.form.questions[0].questionId !== formData.answers[0]?.questionId) {
        // const firstEmptyIndex = formData?.answers?.findIndex(a => !a.answer);
        // const question = jobForms?.form?.questions[firstEmptyIndex];

        setErrors({
          [jobForms.form.questions[i]
            .questionText]: `${jobForms.form.questions[i].questionText} is required`,
        });
        console.log('errors');
        console.log(errors);
        toast.error(`${jobForms.form.questions[i].questionText} is required`);

        return false;
      } else {
        setErrors({
          [jobForms.form.questions[i].questionText]: ``,
        });
      }
    }
    return true;
  };

  const handleSubmit = e => {
    console.log(formData);

    e.preventDefault();
    // inputValidation();
    if (!inputValidation()) {
      // toast.error('Please fill all the fields before submitting the form.');
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
          <img
            className={styles['job-details-image-card']}
            src={jobsDetailById.imageUrl}
            alt="Job Details"
          />
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
          ;
          <form onSubmit={handleSubmit} className={styles['job-form-questions']}>
            {jobForms.form && jobForms.form.questions && jobForms.form.questions.length > 0
              ? jobForms.form.questions.map((question, index) => (
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
                      <fieldset>
                        {question.options && question.options.length > 0
                          ? question.options.map((option, optIndex) => (
                              <>
                                <span> {option} </span>
                                <input
                                  type="checkbox"
                                  id={`${question.questionText}-${optIndex}`}
                                  name={question.questionText}
                                  key={option}
                                  value={option}
                                  checked={
                                    formData.answers
                                      .find(a => a.questionId === question.questionText)
                                      ?.answer?.includes(option) || false
                                  }
                                  onChange={e => handleChange(e, index)}
                                ></input>
                              </>
                            ))
                          : null}
                      </fieldset>
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
                                    formData.answers.find(
                                      a => a.questionId === question.questionText,
                                    )?.answer === option
                                  }
                                  onChange={e => handleChange(e, index)}
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
                          accept=".pdf,.doc,.docx,.jpg,.png,.bmp"
                          onChange={e => handleFileChange(e, index)}
                        />

                        {uploadingFiles[question.questionText] ? (
                          <p style={{ color: 'blue' }}> Uploading </p>
                        ) : formData?.answers?.find(a => a.questionId === question._id)?.answer ? (
                          <>
                            <p style={{ color: 'green' }}>File Uploaded Successfully </p>
                            <a
                              href={
                                formData?.answers?.find(a => a.questionId === question._id)?.answer
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
                    <p className={styles['error-message']}>
                      {errors?.[jobForms?.form?.questions[index]?.questionText]}
                    </p>
                  </div>
                ))
              : 'no Questions available'}
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
      )}
    </div>
  );
}

export default JobDetailsLink;
