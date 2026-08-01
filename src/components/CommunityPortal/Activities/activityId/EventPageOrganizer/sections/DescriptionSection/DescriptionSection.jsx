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

export const DescriptionSection = ({
  activityId = 'test-event',
  initialDescription = '',
  onSaveDescription = async () => {},
  uploadMediaFn = null,
}) => {
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [description, setDescription] = useState(initialDescription);
  const darkMode = useSelector(state => state.theme.darkMode);
  const fileInputRef = useRef(null);

  const containerClassName = `${styles.container} ${darkMode ? styles.containerDark : ''}`;
  const textareaClassName = `${styles.textarea} ${darkMode ? styles.textareaDark : ''}`;
  const mediaButtonClassName = `${styles.mediaButton} ${darkMode ? styles.mediaButtonDark : ''}`;
  const addMediaLabelClassName = `${styles.buttonLabel} ${darkMode ? styles.buttonLabelDark : ''}`;

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

    if (uploadMediaFn) {
      try {
        const uploads = await Promise.all(files.map(f => uploadMediaFn(activityId, f)));
        const newMedia = uploads.map(u => ({
          id: genId(),
          url: u.url,
          name: u.name,
          size: u.size,
        }));
        setSelectedMedia(prev => [...prev, ...newMedia]);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('uploadMedia failed', err);
        }
      }
    } else {
      const newMedia = files.map(file => ({
        id: genId(),
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      }));
      setSelectedMedia(prev => [...prev, ...newMedia]);
    }
  };

  const handleAddMedia = () => fileInputRef.current?.click();

  const handleRemoveMedia = mediaId => {
    setSelectedMedia(prev => {
      const updatedMedia = prev.filter(media => media.id !== mediaId);
      // Revoke the URL to prevent memory leaks
      const removedMedia = prev.find(media => media.id === mediaId);
      if (removedMedia) {
        try {
          URL.revokeObjectURL(removedMedia.url);
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error('revokeObjectURL failed', e);
          }
        }
      }
      return updatedMedia;
    });
  };

  // Cleanup blob URLs if any (best-effort)
  React.useEffect(() => {
    return () => {
      selectedMedia.forEach(media => {
        try {
          URL.revokeObjectURL(media.url);
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error('revokeObjectURL cleanup failed', e);
          }
        }
      });
    };
  }, [selectedMedia]);

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
