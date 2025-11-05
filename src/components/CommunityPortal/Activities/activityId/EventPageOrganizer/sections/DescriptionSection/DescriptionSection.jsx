import { ImageIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react';
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

  // Open file picker and upload via provided uploadMediaFn (if any)
  const handleAddMedia = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';

    input.onchange = async e => {
      const files = Array.from(e.target.files);

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
        // fallback: use local preview URLs
        const newMedia = files.map(file => ({
          id: genId(),
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        }));
        setSelectedMedia(prev => [...prev, ...newMedia]);
      }
    };

    input.click();
  };

  const handleRemoveMedia = mediaId => {
    setSelectedMedia(prev => {
      const updatedMedia = prev.filter(media => media.id !== mediaId);
      // Revoke the URL to prevent memory leaks
      const removedMedia = prev.find(media => media.id === mediaId);
      if (removedMedia) {
        try {
          URL.revokeObjectURL(removedMedia.url);
        } catch (e) {
          // ignore
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
          // some URLs may be blob URLs created locally
          URL.revokeObjectURL(media.url);
        } catch (e) {
          /* ignore */
        }
      });
    };
  }, [selectedMedia]);

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <Textarea
          placeholder="Create description here"
          className={styles.textarea}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        {selectedMedia.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4">
            {selectedMedia.map(media => (
              <div key={media.id} className="relative group">
                <img
                  src={media.url}
                  alt={media.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveMedia(media.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="secondary" className={styles.mediaButton} onClick={handleAddMedia}>
            <ImageIcon className="w-5 h-5" />
            <span className="font-navigation font-[number:var(--navigation-font-weight)] text-black text-[length:var(--navigation-font-size)] tracking-[var(--navigation-letter-spacing)] leading-[var(--navigation-line-height)] [font-style:var(--navigation-font-style)]">
              Add media
            </span>
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
            <span className="font-navigation font-[number:var(--navigation-font-weight)] text-[#f2f2f2] text-[length:var(--navigation-font-size)] tracking-[var(--navigation-letter-spacing)] leading-[var(--navigation-line-height)] [font-style:var(--navigation-font-style)]">
              Post description
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
};
