import { useHistory } from 'react-router-dom';

function TSAFormPage1() {
  const history = useHistory();
  const handleNextClick = () => {
    const requiredFields = ['email', 'fullname', 'professionaltitle'];
    const radios = document.querySelector('input[name="professionalExperience"]:checked');
    const checkboxes = document.querySelectorAll('input[name="areaofExpertise"]:checked');

    let isValid = true;

    requiredFields.forEach(field => {
      const input = document.querySelector(`input[name="${field}"]`);
      if (!input || !input.value.trim()) {
        isValid = false;
      }
    });

    if (!radios || checkboxes.length === 0) {
      isValid = false;
    }

    if (!isValid) {
      alert('Please complete all required (*) fields before proceeding.');
      return;
    }

    history.push('/tsaformpage2');
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
      {/* Banner Box */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
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

      {/* Introduction Content Box */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Title Bar inside content box */}
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
          Technical Support and Advisory Volunteer Agreement
        </div>

        {/* Content */}
        <div style={{ padding: '35px', fontSize: '16px', lineHeight: '1.6', textAlign: 'justify' }}>
          <p>
            This questionnaire is for those interested in helping support One Community as a member
            of the all-volunteer Sustainable Infrastructure Technical Support and Advisory Team. It
            includes an assessment of your strengths, interests, and availability, followed by our
            standard volunteer agreement.
          </p>
          <p>It contains these 6 parts:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>General Questions</li>
            <li>Interests and Involvement</li>
            <li>Your Participation Preferences</li>
            <li>Your Design Preferences</li>
            <li>Scope and Rights of Termination</li>
            <li>Open Source Agreements</li>
            <li>Dispute Resolution and Agreement of Terms</li>
          </ul>
          <p>
            We are only interested in working with people who are serious about helping and making a
            difference, so please take your time to complete this accurately. All answers are
            required and it could take as much as an hour.
          </p>
          <p>
            Your answers here will help our interns and volunteers identify if you'd be a good
            person to ask for input on their specific projects and/or designs.
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
      {/* Title + Intro */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
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
          General Questions
        </div>
        <div style={{ padding: '35px', fontSize: '16px', lineHeight: '1.6', textAlign: 'justify' }}>
          <p>These are the basics we need to understand your experience and areas of expertise.</p>
        </div>
      </div>

      {/* Email */}
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
          <span>Email</span>
          <span style={{ color: 'red' }}>*</span>
        </label>
        <input
          type="text"
          name="email"
          placeholder="Your answer"
          style={{
            width: '100%',
            padding: '10px 0',
            fontSize: '16px',
            border: 'none',
            borderBottom: '1px solid #ccc',
            outline: 'none',
            backgroundColor: 'transparent',
          }}
        />
      </div>

      {/* Full Name */}
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
          <span>Your Full Name:</span>
          <span style={{ color: 'red' }}>*</span>
        </label>
        <input
          type="text"
          name="fullname"
          placeholder="Your answer"
          style={{
            width: '100%',
            padding: '10px 0',
            fontSize: '16px',
            border: 'none',
            borderBottom: '1px solid #ccc',
            outline: 'none',
            backgroundColor: 'transparent',
          }}
        />
      </div>

      {/* Professional Tile */}
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
          <span>Professional Title:</span>
          <span style={{ color: 'red' }}>*</span>
        </label>
        <input
          type="text"
          name="professionaltitle"
          placeholder="Your answer"
          style={{
            width: '100%',
            padding: '10px 0',
            fontSize: '16px',
            border: 'none',
            borderBottom: '1px solid #ccc',
            outline: 'none',
            backgroundColor: 'transparent',
          }}
        />
      </div>

      {/* Years of Professional Experience */}
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
          <span>Years of Professional Experience:</span>
          <span style={{ color: 'red' }}>*</span>
        </label>

        {['1-5', '5-7', '7-9', '10-14', '15-24', '25+'].map((option, index) => (
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
              name="professionalExperience"
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
        ))}
      </div>

      {/* Areas of Expertise */}
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontWeight: 'bold' }}>
            Areas of Expertise: <span style={{ fontWeight: 'normal' }}>(Check all that apply)</span>
          </span>

          <span style={{ color: 'red' }}>*</span>
        </div>

        {[
          '3D CAD modeling, drawings and assembly design',
          'Architecture',
          'Civil Engineering',
          'Construction',
          'Electrical Engineering',
          'Design and Planning Infrastructure Projects',
          'Fabrication Methods and Estimating',
          'HVAC',
          'Licensed Electrician',
          'Master Electrician',
          'Licensed Plumber',
          'Plumbing Design',
          'Master Plumber',
          'Master Carpenter',
          'Mechanical Analysis',
          'Mechanical Design',
          'Solar/Renewable/Clean Energy',
          'Structural and Design Calculations',
          'Structural Analysis',
          'Structural Design',
          'Other:',
        ].map((option, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: 'normal',
              }}
            >
              <input
                type="checkbox"
                name="areaofExpertise"
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
            {option === 'Other:' && (
              <input
                type="text"
                name="otherExpertise"
                placeholder="Please specify"
                style={{
                  marginLeft: '28px',
                  marginTop: '8px',
                  width: 'calc(100% - 45px)',
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
        ))}
      </div>

      {/* Next Button */}
      <div
        style={{
          textAlign: 'right',
          margin: '40px auto 0',
          maxWidth: '800px',
          padding: '0 20px',
        }}
      >
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

export default TSAFormPage1;
