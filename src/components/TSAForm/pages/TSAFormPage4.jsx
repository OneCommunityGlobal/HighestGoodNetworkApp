import { useHistory } from 'react-router-dom';
import { useState } from 'react';

function TSAFormPage4() {
  const history = useHistory();
  const [errors, setErrors] = useState({
    interested: false,
    availability: false,
    BuildingInfrastructure: false,
    FoodInfrastructure: false,
    EnergyInfrastructure: false,
    StewardshipInfrastructure: false,
  });

  const clearError = field => {
    setErrors(prev => ({ ...prev, [field]: false }));
  };
  const handleNextClick = () => {
    const requiredGroups = [
      'EstablishingRequirements',
      'ConceptualDesigns',
      'PreliminaryDesignReview',
      'DesignVerification',
      'FinalDesignReview',
      'Detaileddrawings',
    ];
    const newErrors = {};
    let firstInvalid = null;

    requiredGroups.forEach(group => {
      const isChecked = document.querySelector(`input[name="${group}"]:checked`);
      newErrors[group] = !isChecked;
      if (!isChecked && !firstInvalid) {
        firstInvalid = group;
      }
    });

    setErrors(newErrors);

    if (firstInvalid) {
      const el = document.querySelector(`[name="${firstInvalid}"]`);
      if (el?.scrollIntoView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    history.push('/tsaformpage5');
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
          Your Design Preferences
        </div>
        <div style={{ padding: '35px', fontSize: '16px', lineHeight: '1.6', textAlign: 'justify' }}>
          <p>
            This section covers which areas of the design, construction & implementation process you
            can and most want to contribute to. If you are not sure about an area, just rate it a 1.
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

      {/* Establishing requirements */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.EstablishingRequirements ? '2px solid red' : 'none',
        }}
      >
        <label
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>
            Establishing requirements:{' '}
            <span style={{ fontWeight: 'normal' }}>
              Helping with document requirements that designs need to satisfy.
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
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Can&apos;t or don&apos;t want
            <br /> to help here
          </span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Very much can and
            <br /> want to help here
          </span>
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
                name="EstablishingRequirements"
                value={i + 1}
                onChange={() => clearError('EstablishingRequirements')}
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
        {errors.EstablishingRequirements && (
          <div style={{ color: 'red', fontSize: '14px' }}>This field is required</div>
        )}
      </div>

      {/* Conceptual Designs */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.ConceptualDesigns ? '2px solid red' : 'none',
        }}
      >
        <label
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>
            Conceptual Designs:{' '}
            <span style={{ fontWeight: 'normal' }}>
              Helping develop high-level concepts to satisfy the requirements.
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
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Can&apos;t or don&apos;t want
            <br /> to help here
          </span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Very much can and
            <br /> want to help here
          </span>
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
                name="ConceptualDesigns"
                value={i + 1}
                onChange={() => clearError('ConceptualDesigns')}
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
        {errors.ConceptualDesigns && (
          <div style={{ color: 'red', fontSize: '14px' }}>This field is required</div>
        )}
      </div>

      {/* Preliminary Design Review */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.PreliminaryDesignReview ? '2px solid red' : 'none',
        }}
      >
        <label
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>
            Preliminary Design Review:{' '}
            <span style={{ fontWeight: 'normal' }}>
              Helping review preliminary design and provide feedback to the design team.
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
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Can&apos;t or don&apos;t want
            <br /> to help here
          </span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Very much can and
            <br /> want to help here
          </span>
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
                name="PreliminaryDesignReview"
                value={i + 1}
                onChange={() => clearError('PreliminaryDesignReview')}
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
        {errors.PreliminaryDesignReview && (
          <div style={{ color: 'red', fontSize: '14px' }}>This field is required</div>
        )}
      </div>

      {/* Design Verification/Analysis */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.DesignVerification ? '2px solid red' : 'none',
        }}
      >
        <label
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>
            Design Verification/Analysis:{' '}
            <span style={{ fontWeight: 'normal' }}>
              {' '}
              Helping with Mechanical and Structural FEA to verify/validate the design concepts,
              design loads, materials and strength calculations.
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
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Can&apos;t or don&apos;t want
            <br /> to help here
          </span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Very much can and
            <br /> want to help here
          </span>
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
                name="DesignVerification"
                value={i + 1}
                onChange={() => clearError('DesignVerification')}
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
        {errors.DesignVerification && (
          <div style={{ color: 'red', fontSize: '14px' }}>This field is required</div>
        )}
      </div>

      {/* Final Design Review */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.FinalDesignReview ? '2px solid red' : 'none',
        }}
      >
        <label
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>
            Final Design Review:{' '}
            <span style={{ fontWeight: 'normal' }}>
              {' '}
              Helping review a final design for completeness and accuracy.
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
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Can&apos;t or don&apos;t want
            <br /> to help here
          </span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Very much can and
            <br /> want to help here
          </span>
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
                name="FinalDesignReview"
                value={i + 1}
                onChange={() => clearError('FinalDesignReview')}
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
        {errors.FinalDesignReview && (
          <div style={{ color: 'red', fontSize: '14px' }}>This field is required</div>
        )}
      </div>

      {/* Detailed drawings and/or statement of work (SOW) */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.Detaileddrawings ? '2px solid red' : 'none',
        }}
      >
        <label
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>
            Detailed drawings and/or statement of work (SOW):{' '}
            <span style={{ fontWeight: 'normal' }}>
              {' '}
              Helping generate and check detailed design, fabrication and/or construction
              drawings/SOW.
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
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Can&apos;t or don&apos;t want
            <br /> to help here
          </span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Very much can and
            <br /> want to help here
          </span>
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
                name="Detaileddrawings"
                value={i + 1}
                onChange={() => clearError('Detaileddrawings')}
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
        {errors.Detaileddrawings && (
          <div style={{ color: 'red', fontSize: '14px' }}>This field is required</div>
        )}
      </div>

      {/* Anything else */}
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
          htmlFor="certifications"
          style={{ display: 'block', marginBottom: '20px', fontWeight: 'bold' }}
        >
          Anything else? <span style={{ fontWeight: 'normal' }}>(and your score for it)</span>
        </label>
        <input
          type="text"
          id="certifications"
          name="certifications"
          placeholder="Your answer"
          style={{
            width: 'calc(100% - 20px)',
            marginLeft: '0px',
            padding: '10px 0',
            fontSize: '16px',
            border: 'none',
            borderBottom: '1px solid #ccc',
            outline: 'none',
            backgroundColor: 'transparent',
          }}
          onFocus={e => {
            e.target.style.backgroundColor = '#3b6f87';
          }}
          onBlur={e => {
            e.target.style.borderBottom = '1px solid #ccc';
          }}
        />
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
          onClick={() => history.push('/tsaformpage3')}
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
          onMouseOver={e => {
            e.target.style.backgroundColor = '#3b6f87';
          }}
          onFocus={e => {
            e.target.style.backgroundColor = '#3b6f87';
          }}
          onMouseOut={e => {
            e.target.style.backgroundColor = '#4d87a1';
          }}
          onBlur={e => {
            e.target.style.backgroundColor = '#4d87a1';
          }}
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
          onMouseOver={e => {
            e.target.style.backgroundColor = '#3b6f87';
          }}
          onFocus={e => {
            e.target.style.backgroundColor = '#3b6f87';
          }}
          onMouseOut={e => {
            e.target.style.backgroundColor = '#4d87a1';
          }}
          onBlur={e => {
            e.target.style.backgroundColor = '#4d87a1';
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default TSAFormPage4;
