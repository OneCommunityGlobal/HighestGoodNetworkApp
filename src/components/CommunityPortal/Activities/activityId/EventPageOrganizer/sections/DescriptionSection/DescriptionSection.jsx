import { ImageIcon, XIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import styles from './DescriptionSection.module.css';

const genId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const a = new Uint32Array(4);
    crypto.getRandomValues(a);
    return [...a].map(x => x.toString(16).padStart(8, '0')).join('');
  }

  return `id_${Date.now().toString(36)}_${Math.trunc(performance.now()).toString(36)}`;
};

const MEDIA_STORAGE_KEY = id => `hgn_event_mock_v1:${id}:media`;

function loadPersistedMedia(activityId) {
  try {
    const raw = localStorage.getItem(MEDIA_STORAGE_KEY(activityId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePersistedMedia(activityId, mediaList) {
  try {
    localStorage.setItem(MEDIA_STORAGE_KEY(activityId), JSON.stringify(mediaList));
  } catch {
    // storage quota exceeded — fail silently
  }
}

export const DescriptionSection = ({
  activityId = 'test-event',
  initialDescription = '',
  onSaveDescription = async () => {},
  uploadMediaFn = null,
}) => {
  const [selectedMedia, setSelectedMedia] = useState(() => loadPersistedMedia(activityId));
  const [description, setDescription] = useState(initialDescription);
  const darkMode = useSelector(state => state.theme.darkMode);
  const fileInputRef = useRef(null);

  const containerClassName = `${styles.container} ${darkMode ? styles.containerDark : ''}`;
  const textareaClassName = `${styles.textarea} ${darkMode ? styles.textareaDark : ''}`;
  const mediaButtonClassName = `${styles.mediaButton} ${darkMode ? styles.mediaButtonDark : ''}`;
  const addMediaLabelClassName = `${styles.buttonLabel} ${darkMode ? styles.buttonLabelDark : ''}`;

  const fileToDataUrl = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileChange = async e => {
    const MAX_SIZE_MB = 5;
    const allFiles = Array.from(e.target.files);
    e.target.value = '';
    const files = allFiles.filter(f => {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${f.name} exceeds the ${MAX_SIZE_MB}MB limit and was skipped.`);
        return false;
      }
      return true;
    });
    if (!files.length) return;

    try {
      const newMedia = await Promise.all(
        files.map(async f => ({
          id: genId(),
          url: await fileToDataUrl(f),
          name: f.name,
          size: f.size,
        })),
      );
      setSelectedMedia(prev => {
        const next = [...prev, ...newMedia];
        savePersistedMedia(activityId, next);
        return next;
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('uploadMedia failed', err);
      }
    }

    if (uploadMediaFn) {
      try {
        await Promise.all(files.map(f => uploadMediaFn(activityId, f)));
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('uploadMediaFn failed', err);
        }
      }
    }
  };

  const handleAddMedia = () => fileInputRef.current?.click();

  const handleRemoveMedia = mediaId => {
    setSelectedMedia(prev => {
      const updatedMedia = prev.filter(media => media.id !== mediaId);
      savePersistedMedia(activityId, updatedMedia);
      return updatedMedia;
    });
  };

  return (
    <section className={containerClassName}>
      <div className={styles.content}>
        <Textarea
          placeholder="Create description here"
          className={textareaClassName}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        {selectedMedia.length > 0 && (
          <div className={styles.mediaPreviewList}>
            {selectedMedia.map(media => (
              <div key={media.id} className={styles.mediaThumbnailWrapper}>
                <img src={media.url} alt={media.name} className={styles.mediaThumbnail} />
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(media.id)}
                  className={styles.mediaRemoveButton}
                  aria-label={`Remove ${media.name}`}
                >
                  <XIcon className={styles.mediaRemoveIcon} />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className={styles.hiddenFileInput}
          onChange={handleFileChange}
        />

        <div className={styles.actions}>
          <Button variant="secondary" className={mediaButtonClassName} onClick={handleAddMedia}>
            <ImageIcon className="w-5 h-5" />
            <span className={addMediaLabelClassName}>Add media</span>
          </Button>

          <Button
            className={styles.postButton}
            onClick={async () => {
              try {
                await onSaveDescription(description);
              } catch (err) {
                if (process.env.NODE_ENV === 'development') {
                  // eslint-disable-next-line no-console
                  console.error('save description failed', err);
                }
              }
            }}
          >
            Post description
          </Button>
        </div>
      </div>
    </section>
  );
};

DescriptionSection.propTypes = {
  activityId: PropTypes.string,
  initialDescription: PropTypes.string,
  onSaveDescription: PropTypes.func,
  uploadMediaFn: PropTypes.func,
};
