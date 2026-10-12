import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import { ENDPOINTS } from '../../utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';
import styles from '../Collaboration/JobDetailsLink.module.css';
import JobFormQuestionField, { isAllowedUploadMimeType } from './jobFormQuestionField';

const DETAIL_HTML_FIELDS = ['description', 'requirements', 'projects', 'ourCommunity'];

function JobDetailsLink() {
  const { givenId } = useParams();
  const initialState = { formId: '', answers: [] };
  const [formData, setFormData] = useState({ ...initialState });
  const darkMode = useSelector(state => state.theme.darkMode);
  const [jobsDetailById, setJobsDetailById] = useState({});
  const [loading, setLoading] = useState(true);
  const [jobForms, setJobForms] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [errors, setErrors] = useState({});

  const getJobDetailsById = async id => {
    setLoading(true);
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/${id}`, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }
      const data = await response.json();
      setJobsDetailById(data);
    } catch (error) {
      toast.error(`Error fetching jobs Details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getJobForms = async applyLink => {
    const formId = applyLink.split('jobforms/')[1];
    try {
      const response = await fetch(`${ENDPOINTS.APIEndpoint()}/jobforms/${formId}`, {
        method: 'get',
      });
      if (!response.ok) throw new Error(`Failed to fetch all jobForms : ${response.statusText}`);
      const data = await response.json();
      setJobForms(data);
    } catch (error) {
      toast.error(`Error fetching JobForms: ${error.message}`);
    }
  };

  useEffect(() => {
    void getJobDetailsById(givenId);
  }, [givenId]);

  useEffect(() => {
    if (!loading && jobsDetailById?.applyLink) {
      void getJobForms(jobsDetailById.applyLink);
      const applyLinkFormId = jobsDetailById.applyLink.split('jobforms/')[1];
      setFormData(prev => ({ ...prev, formId: applyLinkFormId }));
    }
  }, [loading, jobsDetailById?.applyLink]);

  const getValue = name => {
    if (!Array.isArray(formData.answers)) return '';
    const found = formData.answers.find(a => a.questionId === name || a.label === name);
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

  const handleFileChange = async (event, index) => {
    const { id, name } = event.target;
    const selFile = event.target.files[0];
    if (!selFile) return;
    if (selFile.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit. Please choose a smaller file. ');
      return;
    }
    if (!isAllowedUploadMimeType(selFile.type)) {
      toast.error('Invalid file type. Please upload a PDF, DOC, DOCX, JPG, PNG, or BMP file.');
      return;
    }
    try {
      setUploadingFiles(prev => ({ ...prev, [name]: true }));
      const formResumeData = new FormData();
      formResumeData.append('file', selFile);
      const formResumeDataResponse = await axios.post(
        `${ENDPOINTS.APIEndpoint()}/jobforms/responses/upload`,
        formResumeData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      const dropboxLink = formResumeDataResponse.data?.data?.url;
      setFormData(prev => ({
        ...prev,
        answers: Array.isArray(prev.answers)
          ? [
              ...prev.answers.filter(a => a.questionId !== id),
              { questionId: id, questionText: name, answer: dropboxLink, order: index },
            ]
          : [{ questionId: id, questionText: name, answer: dropboxLink, order: index }],
      }));
    } catch (err) {
      let errorMessage = 'File upload failed.';
      if (err.response) {
        errorMessage = err.response.data?.message || `Server error (${err.response.status})`;
      } else if (err.request) {
        errorMessage = 'No response from server. Check your connection.';
      } else {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [name]: false }));
    }
  };

  const submitJobforms = async () => {
    try {
      setLoading(true);
      await axios.post(`${ENDPOINTS.APIEndpoint()}/jobforms/responses`, formData);
      setFormData({ ...initialState });
      toast.success('Responses submitted successfully');
    } catch (error) {
      if (error.response) {
        toast.error(error.response.status);
      } else if (error.request) {
        toast.error('No response from server. Check your connection.');
      } else {
        toast.error(`Failed to submit responses: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputValidation = () => {
    const questions = jobForms.form?.questions;
    if (!questions || !formData?.answers) {
      return false;
    }

    for (const question of questions) {
      const answerObj = formData.answers.find(a => a.questionId === question._id);
      if (!answerObj?.answer && question.isRequired) {
        setErrors({
          [question.questionText]: `${question.questionText} is required`,
        });
        toast.error(`${question.questionText} is required`);
        return false;
      }
      setErrors({ [question.questionText]: '' });
    }
    return true;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!inputValidation()) return;
    void submitJobforms();
  };

  const resetForm = e => {
    e.preventDefault();
    setFormData({ ...initialState });
    setErrors({});
  };

  if (loading) {
    return (
      <div className={`${styles['job-details-landing']} ${darkMode ? styles['dark-mode'] : ''}`}>
        Loading
      </div>
    );
  }

  const questions = jobForms.form?.questions ?? [];

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
        {DETAIL_HTML_FIELDS.map(
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
          {questions.length > 0
            ? questions.map((question, index) => (
                <div key={question._id} className={styles['input-error']}>
                  <h3>{question.questionText}</h3>
                  <JobFormQuestionField
                    question={question}
                    index={index}
                    getValue={getValue}
                    onChange={handleChange}
                    onFileChange={handleFileChange}
                    answers={formData.answers}
                    uploadingFiles={uploadingFiles}
                  />
                  <p className={styles['error-message']}>{errors?.[question.questionText]}</p>
                </div>
              ))
            : 'no Questions available'}
          <div className={styles.buttonGroup}>
            <button type="submit" className="btn-primary">
              Submit
            </button>
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JobDetailsLink;
