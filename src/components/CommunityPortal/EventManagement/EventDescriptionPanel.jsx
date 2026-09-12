import styles from './EventPage.module.css';

function EventDescriptionPanel({
  darkMode,
  description,
  descriptionError,
  descriptionPosted,
  onDescriptionChange,
  onMediaUpload,
  onPostDescription,
}) {
  return (
    <div className={styles.eventDescription}>
      <textarea
        className={`${styles.textarea} ${darkMode ? styles.inputDark : ''}`}
        value={description}
        onChange={onDescriptionChange}
        placeholder="Enter event description..."
      />
      {descriptionError && (
        <p className={`${styles.errorText} ${darkMode ? styles.errorTextDark : ''}`}>
          {descriptionError}
        </p>
      )}
      {descriptionPosted && (
        <p className={`${styles.successText} ${darkMode ? styles.successTextDark : ''}`}>
          Description posted successfully!
        </p>
      )}
      <div className={styles.mediaUploadContainer}>
        <input
          type="file"
          accept="image/*"
          onChange={onMediaUpload}
          className={styles.descriptionMediaUpload}
        />
        <button
          type="button"
          className={`${styles.postBtn} ${darkMode ? styles.postBtnDark : ''}`}
          onClick={onPostDescription}
        >
          Post Description
        </button>
      </div>
    </div>
  );
}

export default EventDescriptionPanel;
