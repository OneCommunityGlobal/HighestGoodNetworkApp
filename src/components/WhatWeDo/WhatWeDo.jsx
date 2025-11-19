import React from 'react';
import styles from './WhatWeDo.module.css';

const sections = [
  {
    src: 'https://onecommunityglobal.org/wp-content/uploads/2016/04/Duplicable-City-Center-150.png',
    title: 'Duplicable City Center',
    description:
      'The Duplicable City Center saves resources by functioning as a community dining hall, laundry facility, recreation center, and more.',
    link: 'https://onecommunityglobal.org/duplicable-city-center/',
  },
  {
    src: 'https://onecommunityglobal.org/wp-content/uploads/2016/05/HG-Society-150.png',
    title: 'Highest Good Society',
    description:
      "Highest Good society: is a model for cooperative and collaborative living for The Highest Good of All. It addresses the very roots of our species' socio-economic challenges while teaching others how to address these challenges too.",
    link: 'https://onecommunityglobal.org/highest-good-society/',
  },
  {
    src: 'https://onecommunityglobal.org/wp-content/uploads/2016/05/HG-Economics-150.png',
    title: 'Highest Good Economics',
    description:
      'Highest Good Economics: The One Community Non-profit, For-profit, and Entrepreneurialism Open Source Portal for forward thinking and duplicable Highest Good economics creation.',
    link: 'https://onecommunityglobal.org/highest-good-economics/',
  },
  {
    src:
      'https://onecommunityglobal.org/wp-content/uploads/2016/10/Highest-Good-Education_150x150.png',
    title: 'Highest Good Education',
    description:
      'Highest Good Education: The Education for Life program is an open source and free-shared education program designed to be applied in homeschooling environments, community environments, and traditional learning environments. It is designed for all ages and purposed to meet or exceed all educational standards from pre-school through college.',
    link: 'https://onecommunityglobal.org/highest-good-education/',
  },
  {
    src: 'https://onecommunityglobal.org/wp-content/uploads/2016/04/HG-Housing-150.png',
    title: 'Highest Good Housing',
    description:
      'Highest Good Housing: Sustainable and affordable living solutions through innovative and duplicable housing models.',
    link: 'https://onecommunityglobal.org/highest-good-housing/',
  },
  {
    src: 'https://onecommunityglobal.org/wp-content/uploads/2016/04/HG-Energy-150.png',
    title: 'Highest Good Energy',
    description:
      'Highest Good Energy: Renewable and conscientious use of the air, water, and land that we all share.',
    link: 'https://onecommunityglobal.org/highest-good-energy/',
  },
  {
    src: 'https://onecommunityglobal.org/wp-content/uploads/2011/09/highest-good-Food_100x100.png',
    title: 'Highest Good Food',
    description:
      'Highest Good Food: Sustainable, more bio-diverse, fresher, more nutritious, and grown without the use of toxic chemicals.',
    link: 'https://onecommunityglobal.org/highest-good-food/',
  },
  {
    src: 'https://onecommunityglobal.org/wp-content/uploads/2016/04/HG-Stewardship-150.png',
    title: 'Highest Good Stewardship',
    description:
      'Highest Good Stewardship: For The Highest Good of All is our #1 value. It is conscientious stewardship defined by us as non-dogmatic and specifically and simultaneously good for people, business, and the planet.',
    link: 'https://onecommunityglobal.org/for-the-highest-good-of-all/',
  },
];

function WhatWeDoSection() {
  return (
    <div className={styles.whatWeDoContainer}>
      <h2>What We Do</h2>
      <div className={styles.whatWeDoGrid}>
        {sections.map((section, idx) => (
          <a
            key={idx}
            href={section.link}
            className={styles.whatWeDoItem}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={section.src}
              alt={section.title}
              onError={e => {
                // console.log(`Failed to load image: ${section.src}`);
                e.target.style.display = 'none';
              }}
            />
            <div className={styles.whatWeDoText}>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default WhatWeDoSection;
