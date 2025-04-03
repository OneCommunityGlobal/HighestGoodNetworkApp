import { useHistory } from 'react-router-dom';

function TSAFormPage7() {
  const history = useHistory();

  const handleNextClick = () => {
    const requiredRadios = ['agreementseven', 'agreementeight'];
    let isValid = true;

    // Validate radios
    for (const group of requiredRadios) {
      const checked = document.querySelector(`input[name="${group}"]:checked`);
      if (!checked) {
        isValid = false;
        break;
      }
    }

    // Validate text input
    const signature = document.querySelector('input[name="sign"]');
    if (!signature || !signature.value.trim()) {
      isValid = false;
    }

    if (!isValid) {
      alert('Please complete all required (*) fields before proceeding.');
      return;
    }

    history.push('/tsaformpage8');
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
          Dispute Resolution & Agreement Of Terms
        </div>
        <div style={{ padding: '35px', fontSize: '16px', lineHeight: '1.6', textAlign: 'justify' }}>
          <label
            htmlFor="certifications"
            style={{ display: 'block', marginBottom: '20px', fontWeight: 'bold' }}
          >
            7.0 DISPUTE RESOLUTION
          </label>
          <label
            htmlFor="certifications"
            style={{ display: 'block', marginBottom: '20px', fontWeight: 'normal' }}
          >
            7.1 Any dispute arising out of your participation is to be first submitted to
            Arbitration.
            <br />
            <br />
            7.2 The terms of this letter shall be interpreted and governed by the laws in force in
            the United States of America. Each party hereby agrees to submit to the jurisdiction of
            the courts of the USA and to waive any objections based upon venue.
            <br />
            <br />
            7.3 You agree to waive all injunctive relief and to only seek monetary damages up to US
            $1,000 (one thousand US dollars) should a dispute arise from your participation with One
            Community.
            <br />
            <br />
            7.4 You understand as a Consultant/Volunteer that no “partnership” or “joint venture”
            between you and One Community is or will be created; that no such intent was ever
            intended or manifested by either party; and that if any such partnership or joint
            venture has been created it is hereby terminated.
          </label>
        </div>
      </div>

      {/* Agreement 7 */}
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
          htmlFor="agreementseven"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>Mark below that you have read and agree to the section above.</span>
          <span style={{ color: 'red' }}>*</span>
        </label>

        <label
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'normal' }}
        >
          <input
            type="radio"
            id="agreementseven"
            name="agreementseven"
            value="agree"
            required
            style={{
              marginRight: '10px',
              width: '15px',
              height: '15px',
              accentColor: '#4d87a1',
            }}
          />
          I agree
        </label>
      </div>

      {/* Agreement of Terms */}
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
          8.0 AGREEMENT OF TERMS
        </label>
        <label
          htmlFor="certifications"
          style={{ display: 'block', marginBottom: '20px', fontWeight: 'normal' }}
        >
          8.1 Once it has been agreed, and during the course of your participation, this letter
          SHALL be the overriding agreement between you and One Community, have binding effect, and
          remain effective until it is replaced.
          <br />
          <br />
          8.2 PROVIDED that One Community reserves the right to, from time to time, review and/or
          replace the terms of this letter as situation(s) may warrant, and communicate same to you
          for acceptance.
          <br />
          <br />
          8.3 If you find the arrangement acceptable, please indicate you do by marking "I agree"
          below and adding your digital signature below.
        </label>
      </div>

      {/* Agreement 8 */}
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
          htmlFor="agreementeight"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>Mark below that you have read and agree to the section above.</span>
          <span style={{ color: 'red' }}>*</span>
        </label>

        <label
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'normal' }}
        >
          <input
            type="radio"
            id="agreementeight"
            name="agreementeight"
            value="agree"
            required
            style={{
              marginRight: '10px',
              width: '15px',
              height: '15px',
              accentColor: '#4d87a1',
            }}
          />
          I agree
        </label>
      </div>

      {/* Digital Signature */}
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
          htmlFor="digitalsignatures"
          style={{ display: 'block', marginBottom: '20px', fontWeight: 'bold' }}
        >
          DIGITAL SIGNATURE
        </label>
        <label
          htmlFor="digitalsignatures"
          style={{ display: 'block', marginBottom: '20px', fontWeight: 'normal' }}
        >
          I confirm that I have read and understood the contents of this letter and agree that it
          accurately reflects my fair understanding of the services that I agree to undertake.
        </label>
      </div>

      {/* Sign your name */}
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
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          <label htmlFor="sign" style={{ margin: 0 }}>
            Sign your full name as your digital signature:
          </label>
          <span style={{ color: 'red' }}>*</span>
        </div>

        <input
          type="text"
          id="sign"
          name="sign"
          placeholder="Your answer"
          required
          style={{
            width: '100%',
            padding: '10px 0',
            fontSize: '16px',
            border: 'none',
            borderBottom: '1px solid #ccc',
            outline: 'none',
            backgroundColor: 'transparent',
          }}
          onFocus={e => (e.target.style.borderBottom = '2px solid #4d87a1')}
          onBlur={e => (e.target.style.borderBottom = '1px solid #ccc')}
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
          onClick={() => history.push('/tsaformpage6')}
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

        {/* Submit Button */}
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
          Submit
        </button>
      </div>
    </div>
  );
}

export default TSAFormPage7;
