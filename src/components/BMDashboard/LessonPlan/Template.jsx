import TemplateCard from './TemplateCard';
import styles from './template.module.css';

const Template = ({ templates, loading, error, onSelectTemplate }) => {
  if (loading) return <p>Loading templates...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Choose a Lesson Plan Template</h2>
      <p className={styles.subheading}>
        Select a template that matches your learning goals and student age group.
      </p>

      <div className={styles.cardsContainer}>
        {templates.map(template => (
          <TemplateCard
            key={template._id}
            template={template}
            onSelectTemplate={onSelectTemplate} // pass down
          />
        ))}
      </div>
    </div>
  );
};

export default Template;
