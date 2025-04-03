import { useHistory } from 'react-router-dom';

function TSAFormPage2() {
  const history = useHistory();

  const handleNextClick = () => {
    const requiredGroups = [
      'interested',
      'availability',
      'BuildingInfrastructure',
      'FoodInfrastructure',
      'Energyinfrastructure',
      'Stewardshipinfrastructure',
    ];

    let isValid = true;

    for (const group of requiredGroups) {
      const checked = document.querySelector(`input[name="${group}"]:checked`);
      if (!checked) {
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      alert('Please complete all required (*) fields before proceeding.');
      return;
    }

    history.push('/tsaformpage3');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#e6f5fb',
        fontFamily: 'Arial, sans-serif',
        overflowY: 'auto',
        zIndex: 1000,
        padding: '40px 0',
      }}
    >
      {/* Banner */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: 'auto',
          marginBottom: '15px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '200px',
            backgroundImage:
              'url(https://dl.dropboxusercontent.com/scl/fi/7yk7oe0no1bafbfvx9t3f/Tech-Support-Team-Header.jpeg?rlkey=fgohfmxihock6610ez8fuj1uo)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </div>

      {/* Title + Intro */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: 'auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            backgroundColor: '#4d87a1',
            color: '#fff',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '12px 16px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          }}
        >
          Interests and Involvement
        </div>
        <div style={{ padding: '35px', fontSize: '16px', lineHeight: '1.6', textAlign: 'justify' }}>
          <p>
            These questions help us understand your general availability and preferred areas to
            help.
          </p>
          <p
            style={{
              borderTop: '1px solid #ccc',
              margin: '30px 0 0 0',
              padding: '10px 0 0 0',
              color: 'red',
              fontSize: '14px',
            }}
          >
            * Indicates required question
          </p>
        </div>
      </div>

      {/* Overall Interest */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
        }}
      >
        <label
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>How interested would you consider yourself overall in helping?</span>
          <span style={{ color: 'red' }}>*</span>
        </label>

        {['Somewhat Interested', 'Moderately Interested', 'Very Interested'].map(
          (option, index) => (
            <label
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
                cursor: 'pointer',
                fontWeight: 'normal',
              }}
            >
              <input
                type="radio"
                name="interested"
                value={option}
                required
                style={{
                  marginRight: '10px',
                  width: '15px',
                  height: '15px',
                  accentColor: '#4d87a1',
                }}
              />
              {option}
            </label>
          ),
        )}
      </div>

      {/* Availability */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
        }}
      >
        <label
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>How available do you see yourself being for the foreseeable future?</span>
          <span style={{ color: 'red' }}>*</span>
        </label>
        {[
          'Limited Availability (My availability is unpredictable and/or likely to change)',
          'Somewhat Available (My availability is limited, but I am happy to help a few hours when I can)',
          'Moderately Available (I am busy but can provide a couple of hours a week for areas I am interested)',
          'Very Available (My schedule is consistent, I have more than a few hours a week to help, and this is not expected to change)',
          'Other:',
        ].map((option, index) => (
          <div
            key={index}
            style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start' }}
          >
            <input
              type="radio"
              name="availability"
              value={option}
              required
              style={{
                marginTop: '4px',
                marginRight: '10px',
                width: '15px',
                height: '15px',
                accentColor: '#4d87a1',
              }}
            />
            <div style={{ flex: 1 }}>
              {option}
              {option === 'Other:' && (
                <input
                  type="text"
                  name="otherAvailability"
                  placeholder="Please specify"
                  style={{
                    marginTop: '8px',
                    width: 'calc(100% - 20px)',
                    padding: '8px 0',
                    fontSize: '16px',
                    border: 'none',
                    borderBottom: '1px solid #ccc',
                    outline: 'none',
                    backgroundColor: 'transparent',
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Area of Interest Section */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Title Bar */}
        <div
          style={{
            backgroundColor: '#4d87a1',
            color: '#fff',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '12px 16px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          }}
        >
          Areas of Interest
        </div>

        {/* Content */}
        <div
          style={{
            padding: '35px',
            fontSize: '16px',
            lineHeight: '1.6',
            textAlign: 'justify',
          }}
        >
          <p>
            How interested are you in the following open source development areas of our project?
          </p>
        </div>
      </div>
      {/* Building Infrastructure Interest Rating */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
        }}
      >
        <label
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>
            Building infrastructure?{' '}
            <span style={{ fontWeight: 'normal' }}>
              (Duplicable City Center, Earthbag Village, Strawbale Classroom, etc.)
            </span>
          </span>
          <span style={{ color: 'red' }}>*</span>
        </label>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Not Interested At All</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Extremely Interested</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <label key={i + 1}>
              <input
                type="radio"
                name="BuildingInfrastructure"
                value={i + 1}
                required
                style={{
                  margin: '0 5px',
                  width: '15px',
                  height: '15px',
                  accentColor: '#4d87a1',
                }}
              />
              <div style={{ textAlign: 'center', fontSize: '12px' }}>{i + 1}</div>
            </label>
          ))}
        </div>
      </div>
      {/* Food Infrastructure Interest Rating */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
        }}
      >
        <label
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>
            Food infrastructure?{' '}
            <span style={{ fontWeight: 'normal' }}>
              (Tropical Atrium, Aquapini/Zenapini In-ground Growing Structures, Vermi-Composting
              Toilet, etc.)
            </span>
          </span>
          <span style={{ color: 'red' }}>*</span>
        </label>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Not Interested At All</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Extremely Interested</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <label key={i + 1}>
              <input
                type="radio"
                name="FoodInfrastructure"
                value={i + 1}
                required
                style={{
                  margin: '0 5px',
                  width: '15px',
                  height: '15px',
                  accentColor: '#4d87a1',
                }}
              />
              <div style={{ textAlign: 'center', fontSize: '12px' }}>{i + 1}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Energy infrastructure Interest Rating */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
        }}
      >
        <label
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>
            Energy infrastructure?{' '}
            <span style={{ fontWeight: 'normal' }}>(Solar, Wind, Micro-hydro, etc.)</span>
          </span>
          <span style={{ color: 'red' }}> *</span>
        </label>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Not Interested At All</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Extremely Interested</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <label key={i + 1}>
              <input
                type="radio"
                name="Energyinfrastructure"
                value={i + 1}
                required
                style={{
                  margin: '0 5px',
                  width: '15px',
                  height: '15px',
                  accentColor: '#4d87a1',
                }}
              />
              <div style={{ textAlign: 'center', fontSize: '12px' }}>{i + 1}</div>
            </label>
          ))}
        </div>
      </div>
      {/* Stewardship infrastructure Interest Rating */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
        }}
      >
        <label
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>
            Stewardship infrastructure ?{' '}
            <span style={{ fontWeight: 'normal' }}>
              {' '}
              (Recycling, Maintenance and Upkeep Plans, etc.){' '}
            </span>
          </span>

          <span style={{ color: 'red' }}> *</span>
        </label>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Not Interested At All</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Extremely Interested</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <label key={i + 1}>
              <input
                type="radio"
                name="Stewardshipinfrastructure"
                value={i + 1}
                required
                style={{
                  margin: '0 5px',
                  width: '15px',
                  height: '15px',
                  accentColor: '#4d87a1',
                }}
              />
              <div style={{ textAlign: 'center', fontSize: '12px' }}>{i + 1}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          margin: '40px auto 0',
          maxWidth: '800px',
          padding: '0 20px',
        }}
      >
        {/* Back Button */}
        <button
          type="button"
          onClick={() => history.push('/tsaformpage1')}
          style={{
            backgroundColor: '#4d87a1',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 24px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            transition: 'background-color 0.2s ease-in-out',
          }}
          onMouseOver={e => (e.target.style.backgroundColor = '#3b6f87')}
          onMouseOut={e => (e.target.style.backgroundColor = '#4d87a1')}
        >
          Back
        </button>

        {/* Next Button */}
        <button
          type="submit"
          onClick={handleNextClick}
          style={{
            backgroundColor: '#4d87a1',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 24px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            transition: 'background-color 0.2s ease-in-out',
          }}
          onMouseOver={e => (e.target.style.backgroundColor = '#3b6f87')}
          onMouseOut={e => (e.target.style.backgroundColor = '#4d87a1')}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default TSAFormPage2;
