import { useState } from 'react';
import styles from './topics.module.css';

const Topics = () => {
  const data = [
    {
      subject: 'Mathematics',
      atoms: [
        {
          name: 'Algebra Fundamentals',
          description: 'Basic algebraic operations',
          tag: 'Top 3',
        },
        {
          name: 'Geometry Basics',
          description: 'Shapes and spatial relationships',
          tag: 'Shortlisted',
        },
        {
          name: 'Statistics Introduction',
          description: 'Data analysis and probability',
          tag: 'New',
        },
      ],
    },

    {
      subject: 'Science',
      atoms: [
        {
          name: 'Introduction to Biology',
          description: 'Cells, living organisms, and ecosystems',
          tag: 'Recommended',
        },
        {
          name: 'Fundamentals of Physics',
          description: 'Motion, forces, and basic physical laws',
        },
        {
          name: 'Chemistry Basics',
          description: 'Chemical reactions and periodic table concepts',
          tag: 'Popular',
        },
        {
          name: 'Earth & Space Science',
          description: 'Planets, stars, and earth systems',
        },
      ],
    },

    {
      subject: 'English',
      atoms: [
        {
          name: 'Reading Comprehension',
          description: 'Understanding written texts effectively',
        },
        {
          name: 'Creative Writing',
          description: 'Storytelling, poetry, and expressive writing',
          tag: 'Top Pick',
        },
        {
          name: 'Grammar Essentials',
          description: 'Core English grammar and structure',
        },
        {
          name: 'Public Speaking Skills',
          description: 'Confidence and clarity in communication',
        },
      ],
    },

    {
      subject: 'Arts/Trades',
      atoms: [
        {
          name: 'Digital Art Basics',
          description: 'Foundations of drawing using digital tools',
        },
        {
          name: 'Music & Rhythm',
          description: 'Understanding beats, notes, and musical expression',
          tag: 'New',
        },
        {
          name: 'Woodworking Fundamentals',
          description: 'Tools, safety, and basic construction methods',
        },
        {
          name: 'Theater & Drama',
          description: 'Performance skills, expression, and acting basics',
        },
      ],
    },
  ];

  const [activeSubject, setActiveSubject] = useState('Mathematics');
  const [search, setSearch] = useState('');

  const activeAtoms = data.find(d => d.subject === activeSubject)?.atoms || [];

  return (
    <div className={styles.wrapper}>
      <h3>Select Learning Topics</h3>
      <p>Choose atoms from your saved interests to include in this lesson plan.</p>

      <div className={styles.templateDescriptor}>
        <h6>Selected Template: Creative Communicator</h6>
        <p>Building expression through arts, writing, and presentation.</p>
      </div>

      <div className={styles.subjectTabs}>
        {data.map(d => (
          <button
            key={d.subject}
            className={`${styles.subjectTab} ${
              activeSubject === d.subject ? styles.activeTab : ''
            }`}
            onClick={() => setActiveSubject(d.subject)}
          >
            {d.subject}
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
            <div key={atom.name} className={styles.atomCard}>
              <div className={styles.atomTitle}>{atom.name}</div>
              <p>{atom.description}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Topics;
