import { useHistory } from 'react-router-dom';
import { useState } from 'react';

function TSAFormPage5() {
  const history = useHistory();

  const [errors, setErrors] = useState({
    agreementone: false,
    agreementtwo: false,
    agreementthree: false,
    agreementfour: false,
  });

  const clearError = field => {
    setErrors(prev => ({ ...prev, [field]: false }));
  };
  const handleNextClick = () => {
    const requiredGroups = ['agreementone', 'agreementtwo', 'agreementthree', 'agreementfour'];

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

    history.push('/tsaformpage6');
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
          One Community Consultant / Volunteer Agreement
        </div>
        <div style={{ padding: '35px', fontSize: '16px', lineHeight: '1.6', textAlign: 'justify' }}>
          <p>
            On behalf of the Board of Directors of One Community, we are happy to extend this letter
            confirming the terms of your engagement as a consultant/volunteer of ONE COMMUNITY for
            good and valuable consideration and clarify the nature of the services you are to
            provide.
            <br />
            <br /> Please complete all of the following sections and add your digital signature at
            the end before completing any work with us.
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

      {/* Scope */}
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
          1.0 SCOPE OF THE ENGAGEMENT
        </label>
        <label
          htmlFor="certifications"
          style={{ display: 'block', marginBottom: '20px', fontWeight: 'normal' }}
        >
          1.1 As a consultant/volunteer with ONE COMMUNITY, and in the course of this engagement,
          you shall be under the supervision of your Project Team Leader and/or the Executive
          Director. <br />
          <br />
          1.2 During the course of this engagement, every policy decision must only be taken in
          consultation with your Project Team Leader and/or the Executive Director.
          <br />
          <br /> 1.3 One Community shall at all times, endeavor to facilitate a conducive working
          environment.
        </label>
      </div>

      {/* Agreement 1 */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.agreementone ? '2px solid red' : 'none',
        }}
      >
        <label
          htmlFor="agreement"
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
            id="agreementone"
            name="agreementone"
            value="agree"
            onChange={() => clearError('agreementone')}
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
        {errors.agreementone && (
          <div
            style={{
              color: 'red',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Please agree to move forward
          </div>
        )}
      </div>

      {/* Task */}
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
          2.0 TASK
        </label>
        <label
          htmlFor="certifications"
          style={{ display: 'block', marginBottom: '20px', fontWeight: 'normal' }}
        >
          2.1 As a consultant/volunteer you are agreeing to volunteer as per your availability and
          areas of interest indicated on page 1-3 of this form.
        </label>
      </div>

      {/* Agreement 2 */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.agreementtwo ? '2px solid red' : 'none',
        }}
      >
        <label
          htmlFor="agreementtwo"
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
            id="agreementtwo"
            name="agreementtwo"
            onChange={() => clearError('agreementtwo')}
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
        {errors.agreementtwo && (
          <div
            style={{
              color: 'red',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Please agree to move forward
          </div>
        )}
      </div>

      {/* Period of Engagement */}
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
          3.0 PERIOD OF ENGAGEMENT
        </label>
        <label
          htmlFor="certifications"
          style={{ display: 'block', marginBottom: '20px', fontWeight: 'normal' }}
        >
          3.1 Subject to parties’ rights of termination (below), this engagement is intended to run
          from the date of your engagement until the completion of your given tasks.
        </label>
      </div>

      {/* Agreement 3 */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.agreementthree ? '2px solid red' : 'none',
        }}
      >
        <label
          htmlFor="agreementthree"
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
            id="agreementthree"
            name="agreementthree"
            onChange={() => clearError('agreementthree')}
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
        {errors.agreementthree && (
          <div
            style={{
              color: 'red',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Please agree to move forward
          </div>
        )}
      </div>

      {/* Termination */}
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
          4.0 TERMINATION
        </label>
        <label
          htmlFor="certifications"
          style={{ display: 'block', marginBottom: '20px', fontWeight: 'normal' }}
        >
          4.1 At all times, either party shall have the right, with or without cause, to terminate
          this relationship by giving a written notice to the other party.
          <br />
          <br /> 4.2 PROVIDED that One Community shall not be under any duty whatsoever to
          recompense you, by whatever means, for anything you contribute to One Community during the
          course of your participation and/or during the subsistence of this agreement.
          <br />
          <br /> 4.3 You also agree that, in the event of termination, One Community will NOT be
          under any obligation to remove or delete any part of its Open Source Creations for the
          reason that they contain images, voice, descriptions or anything whatsoever accredited to
          your contribution during the course of your participation or during the subsistence of
          this agreement.
        </label>
      </div>

      {/* Agreement 4 */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.agreementfour ? '2px solid red' : 'none',
        }}
      >
        <label
          htmlFor="agreementfour"
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
            id="agreementfour"
            name="agreementfour"
            onChange={() => clearError('agreementfour')}
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
        {errors.agreementfour && (
          <div
            style={{
              color: 'red',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Please agree to move forward
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
          onClick={() => history.push('/tsaformpage4')}
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

export default TSAFormPage5;
