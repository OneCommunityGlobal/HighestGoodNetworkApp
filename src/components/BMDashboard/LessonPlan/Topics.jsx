import { useState } from 'react';
import styles from './topics.module.css';

const Topics = ({ template, selectedAtoms, setSelectedAtoms }) => {
  const [activeSubject, setActiveSubject] = useState(template?.subjectTags?.[0]?.name || '');
  const [search, setSearch] = useState('');

  if (!template) return <p>Please select a template first.</p>;

  const activeAtoms = template.subjectTags.find(d => d.name === activeSubject)?.atomIds || [];

  const toggleAtom = atom => {
    setSelectedAtoms(prev =>
      prev.some(a => a._id === atom._id) ? prev.filter(a => a._id !== atom._id) : [...prev, atom],
    );
  };

  const isSelected = atom => selectedAtoms.some(a => a._id === atom._id);

  return (
    <div className={styles.wrapper}>
      <h3>Select Learning Topics</h3>
      <p>Choose atoms from your saved interests to include in this lesson plan.</p>

      {/* Selected Template Info */}
      <div className={styles.templateDescriptor}>
        <h6>Selected Template: {template.title}</h6>
        <p>{template.description}</p>
      </div>

      {/* Subject Tabs */}
      <div className={styles.subjectTabs}>
        {template.subjectTags.map(subject => (
          <button
            key={subject._id}
            className={`${styles.subjectTab} ${
              activeSubject === subject.name ? styles.activeTab : ''
            }`}
            onClick={() => setActiveSubject(subject.name)}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className={styles.searchBox}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search atoms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Atoms List */}
      <div className={styles.atomsList}>
        {activeAtoms
          .filter(atom => atom.name.toLowerCase().includes(search.toLowerCase()))
          .map(atom => (
            <button
              key={atom._id}
              type="button"
              className={`${styles.atomCard} ${isSelected(atom) ? styles.selectedAtom : ''}`}
              onClick={() => toggleAtom(atom)}
            >
              <div className={styles.atomTitle}>{atom.name}</div>
              <p>{atom.description}</p>
            </button>
          ))}
      </div>
    </div>
  );
};

export default Topics;
