import TemplateCard from './TemplateCard';
import styles from './template.module.css';

const Template = () => {
  //mock data
  const templates = [
    {
      id: 1,
      title: 'STEM Explorer',
      level: 'intermediate',
      description: 'Integrated science, technology, engineering, and math exploration',
      details: {
        ageBand: '13–15 years',
        duration: '2 weeks',
        theme: 'Problem Solving',
      },
      subjects: ['Mathematics', 'Science', 'Tech & Innovation'],
    },

    {
      id: 2,
      title: 'Creative Communicator',
      level: 'intermediate',
      description: 'Building expression through arts, writing, and presentation',
      details: {
        ageBand: '14–16 years',
        duration: '3 weeks',
        theme: 'Self Expression',
      },
      subjects: ['English', 'Arts/Trades', 'Values'],
    },

    {
      id: 3,
      title: 'Global Citizen',
      level: 'advanced',
      description: 'Understanding world cultures, history, and social responsibility',
      details: {
        ageBand: '15–17 years',
        duration: '4 weeks',
        theme: 'Cultural Awareness',
      },
      subjects: ['Social Studies', 'Values', 'English'],
    },
  ];

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Choose a Lesson Plan Template</h2>
      <p className={styles.subheading}>
        Select a template that matches your learning goals and student age group.
      </p>

      <div className={styles.cardsContainer}>
        {templates.map(t => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </div>
  );
};

export default Template;
