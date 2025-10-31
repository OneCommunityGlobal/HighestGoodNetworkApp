import { useHistory } from 'react-router-dom';
import { useState } from 'react';

function TSAFormPage3() {
  const history = useHistory();

  const [errors, setErrors] = useState({
    meetingAvailability: false,
    creativeProcessParticipation: false,
    collabCallsParticipation: false,
    designReviewInterest: false,
    techConsultationInterest: false,
    VirtualReviewInterest: false,
    DetailedVirtualReviewInterest: false,
    DesignAndCalc: false,
    ConceptualDesign: false,
    VerifyingAnalyses: false,
    timeCommitment: false,
  });

  const clearError = field => {
    setErrors(prev => ({ ...prev, [field]: false }));
  };
  const handleNextClick = () => {
    const requiredGroups = [
      'meetingAvailability',
      'creativeProcessParticipation',
      'collabCallsParticipation',
      'designReviewInterest',
      'techConsultationInterest',
      'VirtualReviewInterest',
      'DetailedVirtualReviewInterest',
      'DesignAndCalc',
      'ConceptualDesign',
      'VerifyingAnalyses',
      'timeCommitment',
    ];

    const newErrors = {};
    let firstInvalidField = null;

    requiredGroups.forEach(group => {
      const checkedInputs = document.querySelectorAll(`input[name="${group}"]:checked`);
      const isValid = checkedInputs.length > 0;

      newErrors[group] = !isValid;

      if (!isValid && !firstInvalidField) {
        firstInvalidField = document.querySelector(`input[name="${group}"]`);
      }
    });

    setErrors(newErrors);

    if (firstInvalidField) {
      firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalidField.focus();
      return;
    }

    history.push('/tsaformpage4');
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
          Your Participation Preferences
        </div>
        <div style={{ padding: '35px', fontSize: '16px', lineHeight: '1.6', textAlign: 'justify' }}>
          <p>
            This section covers how interested you are in helping with the specific processes
            related to your areas of interest from the previous page. If you aren&apos;t sure about
            an area, just rate it a 1.
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

      {[
        {
          name: 'creativeProcessParticipation',
          question: 'Participation in the complete creative/development process?',
        },
        {
          name: 'collabCallsParticipation',
          question: 'Participation in virtual collaborative calls and meetings?',
        },
      ].map(item => (
        <div
          key={item.name}
          style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            maxWidth: '800px',
            margin: '15px auto',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            padding: '30px',
            fontSize: '16px',
            border: errors[item.name] ? '2px solid red' : 'none',
          }}
        >
          <label style={{ display: 'block', marginBottom: '20px', fontWeight: 'bold' }}>
            {item.question} <span style={{ color: 'red' }}>*</span>
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
                  name={item.name}
                  value={i + 1}
                  onChange={() => clearError(item.name)}
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
          {errors[item.name] && (
            <div
              style={{
                color: 'red',
                fontSize: '14px',
                marginTop: '10px',
                textAlign: 'left',
                width: '100%',
              }}
            >
              Please select a rating
            </div>
          )}
        </div>
      ))}

      {/* Checkbox Question Section */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',

          border: errors.meetingAvailability ? '2px solid red' : 'none',
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
          If you answered a 7 or above in the previous question, what&apos;s your availability?{' '}
          <span style={{ color: 'red' }}>*</span>
        </label>

        {[
          'N/A (My interest is below a 7)',
          "Can meet if needed (Send me your questions and I'll schedule a meeting if I can help)",
          'Happy to meet but not very available (Would love to help with 1-2 meetings a month)',
          'I think meetings are important and enjoy them, contact me with your questions and we can set up a schedule. (Several meetings a month, scheduled as needed)',
          "I think meetings are essential, fun and I love to collaborate. Let's coordinate a regular weekly call! (Weekly scheduled meetings with set times and required attendance of all team members)",
        ].map((option, index) => (
          <div key={option} style={{ marginBottom: '12px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                cursor: 'pointer',
                fontWeight: 'normal',
                lineHeight: '1.5',
              }}
            >
              <input
                type="checkbox"
                name="meetingAvailability"
                value={option}
                onChange={() => clearError('meetingAvailability')}
                required={index === 0}
                style={{
                  marginRight: '10px',
                  marginTop: '4px',
                  width: '15px',
                  height: '15px',
                  accentColor: '#4d87a1',
                  flexShrink: 0,
                }}
              />
              <span style={{ display: 'inline-block' }}>{option}</span>
            </label>
          </div>
        ))}

        {/* Other Option */}
        <div style={{ marginTop: '12px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              cursor: 'pointer',
              fontWeight: 'normal',
            }}
          >
            <input
              type="checkbox"
              name="meetingAvailability"
              onChange={() => clearError('meetingAvailability')}
              value="Other"
              style={{
                marginRight: '10px',
                marginTop: '4px',
                width: '15px',
                height: '15px',
                accentColor: '#4d87a1',
                flexShrink: 0,
              }}
            />
            <span style={{ display: 'inline-block' }}>Other:</span>
          </label>
          <input
            type="text"
            name="meetingAvailabilityOther"
            placeholder="Please specify"
            style={{
              width: 'calc(100% - 20px)',
              marginTop: '8px',
              padding: '10px 0',
              fontSize: '16px',
              border: 'none',
              borderBottom: '1px solid #ccc',
              outline: 'none',
              backgroundColor: 'transparent',
            }}
          />
        </div>
        {errors.meetingAvailability && (
          <div
            style={{
              color: 'red',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Please select an option
          </div>
        )}
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.designReviewInterest ? '2px solid red' : 'none',
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
            Participate in design reviews?{' '}
            <span style={{ fontWeight: 'normal' }}>
              (Meet to evaluate a design and provide feedback)
            </span>{' '}
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
                name="designReviewInterest"
                onChange={() => clearError('designReviewInterest')}
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
        {errors.designReviewInterest && (
          <div
            style={{
              color: 'red',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Please select a rating
          </div>
        )}
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.techConsultationInterest ? '2px solid red' : 'none',
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
            Technical consultation?{' '}
            <span style={{ fontWeight: 'normal' }}>
              (A resource for electricians, plumbers, structural engineers, etc.)
            </span>{' '}
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
                name="techConsultationInterest"
                onChange={() => clearError('techConsultationInterest')}
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
        {errors.techConsultationInterest && (
          <div
            style={{
              color: 'red',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Please select a rating
          </div>
        )}
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.VirtualReviewInterest ? '2px solid red' : 'none',
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
            Virtual review of written reports?{' '}
            <span style={{ fontWeight: 'normal' }}>(tutorials, instructional, etc.)</span>{' '}
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
                name="VirtualReviewInterest"
                onChange={() => clearError('VirtualReviewInterest')}
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
        {errors.VirtualReviewInterest && (
          <div
            style={{
              color: 'red',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Please select a rating
          </div>
        )}
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.DetailedVirtualReviewInterest ? '2px solid red' : 'none',
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
            Detailed virtual review of drawings and plans?{' '}
            <span style={{ fontWeight: 'normal' }}>(red-marking, design suggestions, etc.)</span>{' '}
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
                name="DetailedVirtualReviewInterest"
                onChange={() => clearError('DetailedVirtualReviewInterest')}
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
        {errors.DetailedVirtualReviewInterest && (
          <div
            style={{
              color: 'red',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Please select a rating
          </div>
        )}
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.DesignAndCalc ? '2px solid red' : 'none',
        }}
      >
        <label
          htmlFor="question"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>Detailed design and calculations supporting/verifying layouts? </span>
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
                name="DesignAndCalc"
                onChange={() => clearError('DesignAndCalc')}
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
        {errors.DesignAndCalc && (
          <div
            style={{
              color: 'red',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Please select a rating
          </div>
        )}
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.ConceptualDesign ? '2px solid red' : 'none',
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
            Conceptual design of systems?{' '}
            <span style={{ fontWeight: 'normal' }}>
              (Vermiculture toilet, net-zero bathroom, heat recycling showers, etc.)
            </span>{' '}
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
                name="ConceptualDesign"
                onChange={() => clearError('ConceptualDesign')}
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
        {errors.ConceptualDesign && (
          <div
            style={{
              color: 'red',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Please select a rating
          </div>
        )}
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.VerifyingAnalyses ? '2px solid red' : 'none',
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
            Verifying analyses?{' '}
            <span style={{ fontWeight: 'normal' }}>(Google Sheets and other calculations)</span>{' '}
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
                name="VerifyingAnalyses"
                onChange={() => clearError('VerifyingAnalyses')}
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
        {errors.VerifyingAnalyses && (
          <div
            style={{
              color: 'red',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Please select a rating
          </div>
        )}
      </div>

      {/* Anything Else Box */}
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
          htmlFor="question"
          style={{ display: 'block', marginBottom: '20px', fontWeight: 'bold' }}
        >
          Anything else? (and your score for it)
        </label>
        <input
          type="text"
          name="otherInterest"
          placeholder="Your answer"
          style={{
            width: 'calc(100% - 20px)',
            padding: '10px 0',
            fontSize: '16px',
            border: 'none',
            borderBottom: '1px solid #ccc',
            outline: 'none',
            backgroundColor: 'transparent',
          }}
        />
      </div>

      {/* Availability Time Commitment Box */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.timeCommitment ? '2px solid red' : 'none',
        }}
      >
        <label
          htmlFor="question"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>For the areas you marked above, how available are you to help? </span>
          <span style={{ color: 'red' }}>*</span>
        </label>

        {[
          '1-5 hours a month',
          '5-10 hours a month',
          '2-3 hours a week',
          '3-5 hours a week',
          '5+ hours a week',
          '10+ hours a week',
        ].map(option => (
          <div key={option} style={{ marginBottom: '12px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                cursor: 'pointer',
                fontWeight: 'normal',
                lineHeight: '1.5',
              }}
            >
              <input
                type="checkbox"
                name="timeCommitment"
                onChange={() => clearError('timeCommitment')}
                value={option}
                style={{
                  marginRight: '10px',
                  marginTop: '4px',
                  width: '18px',
                  height: '18px',
                  accentColor: '#4d87a1',
                  flexShrink: 0,
                }}
              />
              <span style={{ display: 'inline-block' }}>{option}</span>
            </label>
          </div>
        ))}

        {/* Other Option */}
        <div style={{ marginTop: '12px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              cursor: 'pointer',
              fontWeight: 'normal',
            }}
          >
            <input
              type="checkbox"
              name="timeCommitment"
              onChange={() => clearError('timeCommitment')}
              value="Other"
              style={{
                marginRight: '10px',
                marginTop: '4px',
                width: '18px',
                height: '18px',
                accentColor: '#4d87a1',
                flexShrink: 0,
              }}
            />
            <span style={{ display: 'inline-block' }}>Other:</span>
          </label>
          <input
            type="text"
            name="timeCommitmentOther"
            placeholder="Please specify"
            style={{
              width: 'calc(100% - 20px)',
              marginTop: '8px',
              padding: '10px 0',
              fontSize: '16px',
              border: 'none',
              borderBottom: '1px solid #ccc',
              outline: 'none',
              backgroundColor: 'transparent',
            }}
          />
        </div>
        {errors.timeCommitment && (
          <div
            style={{
              color: 'red',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Please select an option
          </div>
        )}
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
          onClick={() => history.push('/tsaformpage2')}
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

export default TSAFormPage3;
