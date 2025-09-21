import React, { useState, useEffect } from 'react';
import { TagCloud } from 'react-tagcloud';
import Select from 'react-select';
import styles from './ReviewWordCloud.module.css';

const ReviewWordCloud = ({ darkMode }) => {
  // Sample reviews data
  const reviewsData = [
    'The Mountain View property in Eco Village has excellent solar panels and a beautiful community garden. Sustainable living at its best with amazing views!',
    'Lakeside Cottage in Forest Retreat needs maintenance on the water system, but the natural surroundings and hiking trails are wonderful. The eco-friendly design is innovative.',
    'Desert Oasis Tiny Home exceeded expectations with its passive cooling system and welcoming community. The rainwater collection system works perfectly year-round.',
    'Riverside Cabin in River Valley has potential but needs improvements to renewable energy systems. Location is perfect for nature lovers and the composting toilet works great.',
    'Urban Garden Apartment in City Sanctuary offers perfect sustainable urban living with impressive vertical gardens and efficient rainwater harvesting systems.',
  ];

  // Village options
  const villageOptions = [
    { value: 'Eco Village', label: 'Eco Village' },
    { value: 'Forest Retreat', label: 'Forest Retreat' },
    { value: 'Desert Oasis', label: 'Desert Oasis' },
    { value: 'River Valley', label: 'River Valley' },
    { value: 'City Sanctuary', label: 'City Sanctuary' },
  ];

  // Property options grouped by village
  const propertyOptions = [
    {
      label: 'Eco Village',
      options: [
        { value: 'Mountain View', label: 'Mountain View' },
        { value: 'Solar Haven', label: 'Solar Haven' },
      ],
    },
    {
      label: 'Forest Retreat',
      options: [
        { value: 'Lakeside Cottage', label: 'Lakeside Cottage' },
        { value: 'Woodland Cabin', label: 'Woodland Cabin' },
      ],
    },
    {
      label: 'Desert Oasis',
      options: [
        { value: 'Tiny Home', label: 'Tiny Home' },
        { value: 'Earth Ship', label: 'Earth Ship' },
      ],
    },
    {
      label: 'River Valley',
      options: [
        { value: 'Riverside Cabin', label: 'Riverside Cabin' },
        { value: 'Floating House', label: 'Floating House' },
      ],
    },
    {
      label: 'City Sanctuary',
      options: [
        { value: 'Urban Garden Apartment', label: 'Urban Garden Apartment' },
        { value: 'Eco Loft', label: 'Eco Loft' },
      ],
    },
  ];

  // State for selected filters
  const [selectedVillages, setSelectedVillages] = useState(villageOptions);
  const [selectedProperties, setSelectedProperties] = useState([]);

  // State for word clouds
  const [villageWordCloud, setVillageWordCloud] = useState([]);
  const [propertyWordCloud, setPropertyWordCloud] = useState([]);

  // Select styles for dark mode
  const customSelectStyles = {
    control: provided => ({
      ...provided,
      backgroundColor: darkMode ? '#1C2541' : '#fff',
      borderColor: darkMode ? '#225163' : '#ccc',
      color: darkMode ? '#fff' : '#333',
    }),
    menu: provided => ({
      ...provided,
      backgroundColor: darkMode ? '#1C2541' : '#fff',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? darkMode
          ? '#3A506B'
          : '#f0f0f0'
        : darkMode
        ? '#1C2541'
        : '#fff',
      color: darkMode ? '#fff' : '#333',
    }),
    multiValue: provided => ({
      ...provided,
      backgroundColor: darkMode ? '#3A506B' : '#e2e3fc',
    }),
    multiValueLabel: provided => ({
      ...provided,
      color: darkMode ? '#fff' : '#333',
    }),
    singleValue: provided => ({
      ...provided,
      color: darkMode ? '#fff' : '#333',
    }),
    input: provided => ({
      ...provided,
      color: darkMode ? '#fff' : '#333',
    }),
  };

  // Process text to generate word cloud data
  const processText = text => {
    const stopWords = [
      'the',
      'and',
      'a',
      'an',
      'in',
      'on',
      'at',
      'with',
      'for',
      'to',
      'of',
      'is',
      'has',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'had',
      'do',
      'does',
      'did',
      'but',
      'its',
      "it's",
      'that',
      'this',
    ];

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));

    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);
  };

  // Generate word clouds based on filters
  useEffect(() => {
    // Filter reviews based on selected villages
    let filteredVillageReviews = reviewsData;
    if (selectedVillages.length > 0) {
      const villageNames = selectedVillages.map(v => v.value);
      filteredVillageReviews = reviewsData.filter(review =>
        villageNames.some(village => review.includes(village)),
      );
    }

    // Filter reviews based on selected properties
    let filteredPropertyReviews = reviewsData;
    if (selectedProperties.length > 0) {
      const propertyNames = selectedProperties.map(p => p.value);
      filteredPropertyReviews = reviewsData.filter(review =>
        propertyNames.some(property => review.includes(property)),
      );
    }

    // Generate word clouds
    setVillageWordCloud(processText(filteredVillageReviews.join(' ')));
    setPropertyWordCloud(processText(filteredPropertyReviews.join(' ')));
  }, [selectedVillages, selectedProperties]);

  // Cloud rendering options
  const cloudOptions = {
    luminosity: darkMode ? 'light' : 'dark',
    hue: darkMode ? 'blue' : 'blue',
    minSize: 20,
    maxSize: 40,
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.wordCloudsContainer} ${
          darkMode ? styles.darkWordCloudsContainer : ''
        }`}
      >
        {/* Left Word Cloud - Villages */}
        <div className={`${styles.wordCloudBox} ${darkMode ? styles.darkWordCloudBox : ''}`}>
          <div className={styles.filterBox}>
            <label
              htmlFor="villageFilter"
              className={`${styles.filterLabel} ${darkMode ? styles.darkFilterLabel : ''}`}
            >
              Filter by Villages:
            </label>
            <Select
              id="villageFilter"
              isMulti
              options={villageOptions}
              value={selectedVillages}
              onChange={setSelectedVillages}
              className={styles.select}
              placeholder="Select Villages"
              defaultValue={villageOptions}
              aria-labelledby="villageFilter"
              styles={customSelectStyles}
            />
          </div>

          <div className={`${styles.cloudContainer} ${darkMode ? styles.darkCloudContainer : ''}`}>
            {villageWordCloud.length > 0 ? (
              <TagCloud
                minSize={20}
                maxSize={40}
                tags={villageWordCloud}
                className={styles.wordCloud}
                colorOptions={cloudOptions}
              />
            ) : (
              <div className={`${styles.noData} ${darkMode ? styles.darkNoData : ''}`}>
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Right Word Cloud - Properties */}
        <div className={`${styles.wordCloudBox} ${darkMode ? styles.darkWordCloudBox : ''}`}>
          <div className={styles.filterBox}>
            <label
              htmlFor="propertyFilter"
              className={`${styles.filterLabel} ${darkMode ? styles.darkFilterLabel : ''}`}
            >
              Filter by Properties:
            </label>
            <Select
              id="propertyFilter"
              isMulti
              options={propertyOptions}
              value={selectedProperties}
              onChange={setSelectedProperties}
              className={styles.select}
              placeholder="Select Properties"
              defaultValue={[]}
              aria-labelledby="propertyFilter"
              styles={customSelectStyles}
            />
          </div>

          <div className={`${styles.cloudContainer} ${darkMode ? styles.darkCloudContainer : ''}`}>
            {propertyWordCloud.length > 0 ? (
              <TagCloud
                minSize={20}
                maxSize={40}
                tags={propertyWordCloud}
                className={styles.wordCloud}
                colorOptions={cloudOptions}
              />
            ) : (
              <div className={`${styles.noData} ${darkMode ? styles.darkNoData : ''}`}>
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewWordCloud;
