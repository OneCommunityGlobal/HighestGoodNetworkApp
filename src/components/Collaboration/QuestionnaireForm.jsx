import React, { useState } from 'react';
import styles from './QuestionnaireForm.module.css';

const QuestionnaireForm = () => {
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);
  const [pledgeTime, setPledgeTime] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('');
  const [location, setLocation] = useState('');
  const [technologyExperience, setTechnologyExperience] = useState({});

  // Available technologies
  const technologies = [
    'React.JS',
    'Adobe PhotoShop',
    'Python',
    'JavaScript',
    'Node.js',
    'Vue.js',
    'Angular',
    'Java',
    'C++',
    'C#',
    'PHP',
    'Ruby',
    'Go',
    'Swift',
    'Kotlin',
    'TypeScript',
    'HTML/CSS',
    'SQL',
    'MongoDB',
    'AWS',
    'Docker',
    'Kubernetes',
    'Git',
    'Figma',
    'Sketch',
    'Illustrator',
    'InDesign',
  ];

  const pledgeTimeOptions = [
    '1 month',
    '3 months',
    '6 months',
    '12 months',
    '18 months',
    '24 months',
    '36 months',
    '48+ months',
  ];

  const weeklyHoursOptions = [
    '1-5 hours',
    '6-10 hours',
    '11-15 hours',
    '16-20 hours',
    '21-25 hours',
    '26-30 hours',
    '31-35 hours',
    '36-40 hours',
    '40+ hours',
  ];

  const locationOptions = [
    'North America - EST (UTC-5)',
    'North America - PST (UTC-8)',
    'North America - CST (UTC-6)',
    'North America - MST (UTC-7)',
    'Europe - GMT (UTC+0)',
    'Europe - CET (UTC+1)',
    'Europe - EET (UTC+2)',
    'Asia - IST (UTC+5:30)',
    'Asia - JST (UTC+9)',
    'Asia - CST (UTC+8)',
    'Asia - KST (UTC+9)',
    'Australia - AEST (UTC+10)',
    'Australia - AWST (UTC+8)',
    'South America - BRT (UTC-3)',
    'Africa - CAT (UTC+2)',
    'Other',
  ];

  const handleTechnologyChange = tech => {
    const newSelected = selectedTechnologies.includes(tech)
      ? selectedTechnologies.filter(t => t !== tech)
      : [...selectedTechnologies, tech];

    setSelectedTechnologies(newSelected);

    const newExperience = { ...technologyExperience };
    if (!newSelected.includes(tech)) {
      delete newExperience[tech];
    } else if (!newExperience[tech]) {
      newExperience[tech] = { isFullTime: false, years: 0 };
    }
    setTechnologyExperience(newExperience);
  };

  const handleExperienceChange = (tech, field, value) => {
    setTechnologyExperience(prev => ({
      ...prev,
      [tech]: {
        ...prev[tech],
        [field]: value,
      },
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    const formData = {
      selectedTechnologies,
      pledgeTime,
      weeklyHours,
      location,
      technologyExperience,
    };

    // Replace with backend call
    // console.log('Form submitted:', formData);
  };

  return (
    <div className={styles.questionnaireContainer}>
      <div className={styles.questionnaireForm}>
        <div className={styles.header}>
          <h1 className={styles.title}>Questionnaire</h1>
          <p className={styles.subtitle}>Please fill this to let us suggest you roles</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Question 1: Technologies */}
          <div className={styles.questionGroup}>
            <label className={styles.questionLabel} htmlFor="technologies">
              Which of the following technologies do you have full time experience in?
            </label>
            <div id="technologies" className={styles.technologyGrid}>
              {technologies.map(tech => (
                <div key={tech} className={styles.technologyItem}>
                  <input
                    id={`tech-${tech}`}
                    type="checkbox"
                    checked={selectedTechnologies.includes(tech)}
                    onChange={() => handleTechnologyChange(tech)}
                    className={styles.checkbox}
                  />
                  <label htmlFor={`tech-${tech}`} className={styles.checkboxLabel}>
                    <span className={styles.checkboxText}>{tech}</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Dynamic Experience Fields */}
            {selectedTechnologies.map(tech => (
              <div key={`${tech}-experience`} className={styles.experienceGroup}>
                <h4 className={styles.techTitle}>{tech} Experience:</h4>
                <div className={styles.experienceFields}>
                  <input
                    id={`${tech}-fulltime`}
                    type="checkbox"
                    checked={technologyExperience[tech]?.isFullTime || false}
                    onChange={e => handleExperienceChange(tech, 'isFullTime', e.target.checked)}
                    className={styles.checkbox}
                  />
                  <label htmlFor={`${tech}-fulltime`} className={styles.experienceLabel}>
                    <span className={styles.checkboxText}>Full-time</span>
                  </label>

                  <label htmlFor={`${tech}-years`} className={styles.experienceLabel}>
                    <span className={styles.yearsLabel}>Years of experience:</span>
                  </label>
                  <input
                    id={`${tech}-years`}
                    type="number"
                    min="0"
                    max="50"
                    value={technologyExperience[tech]?.years || 0}
                    onChange={e =>
                      handleExperienceChange(tech, 'years', parseInt(e.target.value) || 0)
                    }
                    className={styles.yearsInput}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Question 2: Pledge Time */}
          <div className={styles.questionGroup}>
            <label className={styles.questionLabel} htmlFor="pledgeTime">
              What is the minimum length of time (in months) you are willing to pledge?
            </label>
            <select
              id="pledgeTime"
              value={pledgeTime}
              onChange={e => setPledgeTime(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">Select pledge time</option>
              {pledgeTimeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Question 3: Weekly Hours */}
          <div className={styles.questionGroup}>
            <label className={styles.questionLabel} htmlFor="weeklyHours">
              How many hours a week can you give towards this role?
            </label>
            <select
              id="weeklyHours"
              value={weeklyHours}
              onChange={e => setWeeklyHours(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">Select weekly hours</option>
              {weeklyHoursOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Question 4: Location/Time Zone */}
          <div className={styles.questionGroup}>
            <label className={styles.questionLabel} htmlFor="location">
              What is your location and time zone?
            </label>
            <select
              id="location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">Select location and time zone</option>
              {locationOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className={styles.submitGroup}>
            <button type="submit" className={styles.submitButton}>
              Submit Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionnaireForm;
