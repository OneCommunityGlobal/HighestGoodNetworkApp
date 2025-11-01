import { Route, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';

import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import { ENDPOINTS } from '../../utils/URL';

import OneCommunityImage from '../../assets/images/logo2.png';
import styles from '../Collaboration/JobDetailsLink.module.css';
import { de } from 'date-fns/locale';
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
        headers: {
          Authorization: localStorage.getItem('token'),
        },
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

  // Get current value for controlled inputs
  /* const getValue = name => {
    const found = formData.answers.find(a => a.name === name);
    return found ? found.value : '';
  }; */
  const getValue = name => {
    // console.log('getValue');
    // console.log(name);
    if (!Array.isArray(formData.answers)) return ''; // ✅ fallback
    const found = formData.answers?.find(a => a.questionId === name || a.label === name);
    return found ? found.answer : '';
  };
  const handleChange = event => {
    const { name, value } = event.target;
    console.log(`name  is ${name}`);
    console.log(`value is ${value}`);
    //  if (!event.target.files[0]) setResumeFile(event.target.files[0]);

    setFormData(prev => ({
      ...prev,
      answers: Array.isArray(prev.answers)
        ? [...prev.answers.filter(a => a.questionId !== name), { questionId: name, answer: value }]
        : [{ questionId: name, answer: value }],
    }));
  };

  const handleFileChange = async event => {
    const name = event.target.name;
    console.log(`name  is ${event.target.name}`);

    console.log(`name  is ${event.target.files[0].name}`);
    const selFile = event.target.files[0];
    if (!selFile) return;

    setUploadingFiles(prev => ({ ...prev, [name]: true }));
    console.log(uploadingFiles);
    /* setUploadSuccess(false);
    console.log('Selected file:', selFile.name);
    setResumeFile(selFile); commented out */
    // setResumeFile(event.target.files[0]);
    try {
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
              ...prev.answers.filter(a => a.questionId !== name),
              { questionId: name, answer: dropboxLink },
            ]
          : [{ questionId: name, answer: dropboxLink }],
      }));
      setUploadingFiles(prev => ({ ...prev, [name]: false }));
      console.log(uploadingFiles);
    } catch (err) {
      console.error('Upload failed', err);
      setUploadingFiles(prev => ({ ...prev, [name]: false }));
      console.log(uploadingFiles);
    }
  };

  /*useEffect(() => {
    const qname =
      '12.) If you have one, please attach your Resumé, CV, Brochure, etc. in PDF or JPG format.';
    console.log('uploadSuccess');
    console.log(uploadSuccess);
    console.log(qname);
    console.log(uploadedFile);
    console.log(uploadedFile?.url);
    if (uploadSuccess && uploadedFile?.url) {
      console.log('inside');
      setFormData(prev => ({
        ...prev,
        answers: Array.isArray(prev.answers)
          ? [
              ...prev.answers.filter(a => a.questionId !== qname),
              { questionId: qname, answer: uploadedFile?.url },
            ]
          : [{ questionId: qname, answer: uploadedFile?.url }],
      }));
      console.log(formData);
    }
  }, [uploadSuccess, uploadedFile]);
*/
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
    let testData = {
      formId: '68fba186bc0a73e90e5f19c6',

      answers: [
        {
          questionId: 'Name',
          answer: 'Swami',
        },
      ],
    };
    // eslint-disable-next-line no-console
    console.log(testData);
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
  const handleSubmit = e => {
    e.preventDefault();
    submitJobforms();
    alert('form submitted');
  };
  const resetForm = e => {
    alert('form cancelled');
  };

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
          <form onSubmit={handleSubmit}>
            {jobForms.form && jobForms.form.questions && jobForms.form.questions.length > 0
              ? jobForms.form.questions.map((question, index) => (
                  <div key={question._id} className={styles['input-error']}>
                    <h3> {question.label}</h3>
                    {question.type === 'text' ? (
                      <input
                        type="text"
                        name={question.label}
                        id={question.label}
                        value={getValue(question.label)}
                        onChange={handleChange}
                      />
                    ) : question.type === 'textarea' ? (
                      <textarea
                        rows={5}
                        name={question.label}
                        id={question.label}
                        value={getValue(question.label)}
                        onChange={handleChange}
                      />
                    ) : question.type === 'checkbox' ? (
                      <fieldset>
                        {question.options && question.options.length > 0
                          ? question.options.map(option => (
                              <>
                                <span> {option} </span>
                                <input
                                  key={option}
                                  type="checkbox"
                                  name={question.label}
                                  id={question.label}
                                  value={getValue(question.label)}
                                  onChange={handleChange}
                                ></input>
                              </>
                            ))
                          : null}
                      </fieldset>
                    ) : question.type === 'radio' ? (
                      <fieldset>
                        {question.options && question.options.length > 0
                          ? question.options.map(option => (
                              <>
                                <input
                                  key={option}
                                  type="radio"
                                  name={question.label}
                                  id={question.label}
                                  value={getValue(question.label)}
                                  onChange={handleChange}
                                />
                                <span> {option} </span>
                              </>
                            ))
                          : null}
                      </fieldset>
                    ) : question.type === 'email' ? (
                      <input
                        type="email"
                        name={question.label}
                        id={question.label}
                        value={getValue(question.label)}
                        onChange={handleChange}
                      />
                    ) : question.type === 'date' ? (
                      <input
                        type="date"
                        name={question.label}
                        id={question.label}
                        value={getValue(question.label)}
                        onChange={handleChange}
                      />
                    ) : question.type === 'file' ? (
                      <div className={styles['user-input']}>
                        <input
                          type="file"
                          name={question.label}
                          id={question.label}
                          accept=".pdf,.doc,.docx,.jpg,.png,.bmp"
                          onChange={handleFileChange}
                        />

                        {uploadingFiles[question.label] ? (
                          <p style={{ color: 'blue' }}> Uploading </p>
                        ) : formData?.answers?.find(a => a.questionId === question.label)
                            ?.answer ? (
                          <>
                            <p style={{ color: 'green' }}>File Uploaded Successfully </p>
                            <a
                              href={
                                formData?.answers?.find(a => a.questionId === question.label)
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
                    ) : question.type === 'dropdown' ? (
                      <select
                        name={question.label}
                        id={question.label}
                        value={getValue(question.label)}
                        onChange={handleChange}
                      >
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
