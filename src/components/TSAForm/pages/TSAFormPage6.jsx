import { useHistory } from 'react-router-dom';
import { useState } from 'react';

function TSAFormPage6() {
  const history = useHistory();
  const [errors, setErrors] = useState({
    agreementfive: false,
    agreementsix: false,
  });

  const clearError = field => {
    setErrors(prev => ({ ...prev, [field]: false }));
  };
  const handleNextClick = () => {
    const requiredGroups = ['agreementfive', 'agreementsix'];

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

    history.push('/tsaformpage7');
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
          Open Source Agreements
        </div>
        <div style={{ padding: '35px', fontSize: '16px', lineHeight: '1.6', textAlign: 'justify' }}>
          <label
            htmlFor="certifications"
            style={{ display: 'block', marginBottom: '20px', fontWeight: 'bold' }}
          >
            5.0 OPEN SOURCE
          </label>
          <label
            htmlFor="certifications"
            style={{ display: 'block', marginBottom: '20px', fontWeight: 'normal' }}
          >
            5.1 You agree that whatever you contribute to One Community during the course of your
            participation or during the subsistence of this agreement becomes part and parcel of the
            Open Source Creations of One Community.
            <br />
            <br />
            5.2 You acknowledge that any work done as part of your contribution to One
            Community&apos;s Open Source Creations is being created by you for use in a compilation
            and that each form of your contribution is being created by you as a “work made for
            hire” under the United States Copyright Act and, at all stages of development, your
            contribution shall be and remain the sole and exclusive property of One Community. At
            One Community’s sole, absolute and unfettered discretion, it may make any changes in,
            deletions from, or additions to your contribution. If for any reason the results and
            proceeds of your services hereunder are determined at any time not to be a work made for
            hire, you agree to transfer ownership of your contribution to One Community or, should
            that not be possible, you grant a non-exclusive license to One Community to use your
            contribution on a non-royalty basis.
            <br />
            <br />
            5.3 You warrant that any sounds, music, designs, pictures, or any other media used in
            your contribution are originally created by you except for portions for which you have
            obtained or will obtain permission.
            <br />
            <br />
            5.4 As part of One Community&apos;s goals, it shall grant you a non-exclusive license in
            all parts of its Open Source Creations notwithstanding any other agreement between One
            Community and you. This license will be free and permit the use and replication of all
            of One Community&apos;s Open Source Creations.
            <br />
            <br />
            5.5 You agree to indemnify and hold harmless One Community, its licensees, agents,
            consultants, board of directors, distributors, volunteers, and its successors from any
            and all claims, demands, losses, causes of action, damage, lawsuits, judgments,
            including attorneys&apos; fees and costs, whether or not a breach of these warranties is
            finally sustained, but only to the extent caused by, arising out of, or relating to your
            contribution. These warranties and indemnities shall survive the termination of this
            agreement.
          </label>
        </div>
      </div>

      {/* Agreement 5 */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.agreementfive ? '2px solid red' : 'none',
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
            id="agreementfive"
            name="agreementfive"
            onChange={() => clearError('agreementfive')}
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

      {/* Access to the Website */}
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
          6.0 ACCESS TO THE WEBSITE
        </label>
        <label
          htmlFor="certifications"
          style={{ display: 'block', marginBottom: '20px', fontWeight: 'normal' }}
        >
          6.1 During the subsistence of your engagement, you may be granted the necessary license
          required to access of one or more of One Community’s websites; including log-in rights,
          solely to aid the smooth execution of your tasks.
          <br />
          <br />
          6.2 PROVIDED ALWAYS AND AGREED THAT this license shall not in any circumstances be taken
          to engage in other actions contrary to as stated in (2.0) above, or actions that may cause
          harm to One Community.
          <br />
          <br />
          6.3 In the case of unapproved website or content, you agree to indemnify One Community
          against damage(s) caused by your acts, or as a result of your breach of the terms of this
          letter.
        </label>
      </div>

      {/* Agreement 6 */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '15px auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          fontSize: '16px',
          border: errors.agreementsix ? '2px solid red' : 'none',
        }}
      >
        <label
          htmlFor="agreementsix"
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
            id="agreementsix"
            name="agreementsix"
            onChange={() => clearError('agreementsix')}
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
          onClick={() => history.push('/tsaformpage5')}
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

export default TSAFormPage6;
