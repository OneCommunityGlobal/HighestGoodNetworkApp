import { useState } from 'react';
import styles from './topics.module.css';

const Topics = ({ template }) => {
  const [activeSubject, setActiveSubject] = useState(template?.subjectTags?.[0]?.name || '');
  const [search, setSearch] = useState('');

  const activeAtoms = template?.subjectTags?.find(d => d.name === activeSubject)?.atomIds || [];

  if (!template) return <p>Please select a template first.</p>;

  return (
    <div className={styles.wrapper}>
      <h3>Select Learning Topics</h3>
      <p>Choose atoms from your saved interests to include in this lesson plan.</p>

      <div className={styles.templateDescriptor}>
        <h6>Selected Template: {template.title}</h6>
        <p>{template.description}</p>
      </div>

      <div className={styles.subjectTabs}>
        {template.subjectTags.map(d => (
          <button
            key={d._id}
            className={`${styles.subjectTab} ${activeSubject === d.name ? styles.activeTab : ''}`}
            onClick={() => setActiveSubject(d.name)}
          >
            {d.name}
          </button>
        ))}
      </div>

      <div className={styles.searchBox}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search atoms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.atomsList}>
        {activeAtoms
          .filter(atom => atom.name.toLowerCase().includes(search.toLowerCase()))
          .map(atom => (
            <div key={atom._id} className={styles.atomCard}>
              <div className={styles.atomTitle}>{atom.name}</div>
              <p>{atom.description}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Topics;
