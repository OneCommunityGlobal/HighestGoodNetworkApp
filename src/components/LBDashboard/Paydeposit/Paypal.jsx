import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';

// Utility function to dynamically load the PayPal SDK script
function loadPaypalScript(clientId) {
  return new Promise((resolve, reject) => {
    if (document.getElementById('paypal-js')) {
      resolve(window.paypal);
      return;
    }
    const script = document.createElement('script');
    // Include intent=capture and the card-fields component
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&intent=capture&components=buttons,card-fields`;
    script.id = 'paypal-js';
    script.onload = () => resolve(window.paypal);
    script.onerror = () =>
      reject(new Error('PayPal SDK could not be loaded.'));
    document.body.appendChild(script);
  });
}

const PaypalCardFields = forwardRef((props, ref) => {
  const [paypalSDK, setPaypalSDK] = useState(null);
  const [cardFieldsInstance, setCardFieldsInstance] = useState(null);
  // Replace with your actual sandbox client ID
  const clientId =
    'AalIs4YeSzGFOA-cIQ10-KQIr7sE3KlVasZcjvwZ-5wSHcf2oIwRYZJdADqkSsGBBjGTnUDSmXvxh2ri';

  // Refs to container elements for each card field
  const nameFieldContainer = useRef(null);
  const numberFieldContainer = useRef(null);
  const expiryFieldContainer = useRef(null);
  const cvvFieldContainer = useRef(null);

  // Callback to create an order (dummy for testing)
  const createOrder = () => {
    return Promise.resolve('TEST_ORDER_ID');
  };

  // Callback when the card is approved
  const onApprove = (data) => {
    console.log('Card approved:', data);
  };

  // Callback for errors
  const onError = (err) => {
    console.error('Error with card fields:', err);
  };

  // Callback when the payer cancels the card fields (e.g., closes 3D Secure modal)
  const onCancel = () => {
    console.log('Card fields canceled by the payer.');
  };

  // Load the PayPal SDK on mount
  useEffect(() => {
    loadPaypalScript(clientId)
      .then((paypal) => {
        console.log('PayPal SDK loaded:', paypal);
        setPaypalSDK(paypal);
      })
      .catch((err) => {
        console.error('Error loading PayPal SDK:', err);
      });
  }, [clientId]);

  // Initialize the card fields once the SDK is loaded
  useEffect(() => {
    if (paypalSDK && !cardFieldsInstance) {
      const cardFields = paypalSDK.CardFields({
        // Updated style settings to match your other input fields
        style: {
          input: {
            'font-size': '14px',
            'color': '#202020',
            'background': '#fff',           // White background
            'padding': '8px',
            'border': '1px solid #ccc',
            'border-radius': '4px',
            'box-shadow': 'none',
            'outline': 'none',
            'width': '200px',               // Force width to 200px
          },
          ':focus': {
            'box-shadow': 'none',           // No shadow on focus
            'border': '1px solid #ccc',     // Keep the border the same on focus
            'background': '#fff'            // Keep background white on focus
          },
          '.valid': {
            'color': 'green',
          },
          '.invalid': {
            'color': 'red',
          },
        },
        createOrder: createOrder,
        onApprove: onApprove,
        onError: onError,
        onCancel: onCancel,
        inputEvents: {
          onChange: (event) => {
            console.log('Input event:', event);
          },
        },
      });

      // Render the NameField (optional)
      const nameField = cardFields.NameField({
        placeholder: 'Enter your full name as it appears on your card',
        inputEvents: {
          onChange: (event) => {
            console.log('Name field change:', event);
          },
        },
        style: {
          input: {
            'color': '#202020',
            'background': 'white',
            'border': '1px solid #ccc',
            'border-radius': '4px',
            'padding': '8px',
          },
          '.invalid': {
            'color': 'red',
          },
        },
      });
      nameField.render(nameFieldContainer.current);

      // Render the NumberField (required)
      const numberField = cardFields.NumberField({
        placeholder: 'Card Number',
        inputEvents: {
          onChange: (event) => {
            console.log('Number field change:', event);
          },
        },
      });
      numberField.render(numberFieldContainer.current);

      // Render the ExpiryField (required)
      const expiryField = cardFields.ExpiryField({
        placeholder: 'MM/YY',
        inputEvents: {
          onChange: (event) => {
            console.log('Expiry field change:', event);
          },
        },
      });
      expiryField.render(expiryFieldContainer.current);

      // Render the CVVField (required)
      const cvvField = cardFields.CVVField({
        placeholder: 'CVV',
        inputEvents: {
          onChange: (event) => {
            console.log('CVV field change:', event);
          },
        },
      });
      cvvField.render(cvvFieldContainer.current);

      // Save the instance for submission later
      setCardFieldsInstance(cardFields);
    }
  }, [paypalSDK, cardFieldsInstance]);

  // Expose a submit method via ref so the parent can trigger submission
  useImperativeHandle(ref, () => ({
    submit: () => {
      if (cardFieldsInstance) {
        return cardFieldsInstance.submit();
      }
      return Promise.reject(new Error('Card fields not initialized'));
    },
  }));

  return (
    <div>
      {/* 
        Each container is given a fixed max-width to match your design.
        Adjust the maxWidth value as needed.
      */}
      <div
        ref={nameFieldContainer}
        id="card-name-field-container"
        style={{ marginBottom: '10px', maxWidth: '300px', width: '100%' }}
      ></div>
      <div
        ref={numberFieldContainer}
        id="card-number-field-container"
        style={{ marginBottom: '10px', maxWidth: '300px', width: '100%' }}
      ></div>
      <div
        ref={expiryFieldContainer}
        id="card-expiry-field-container"
        style={{ marginBottom: '10px', maxWidth: '300px', width: '100%' }}
      ></div>
      <div
        ref={cvvFieldContainer}
        id="card-cvv-field-container"
        style={{ marginBottom: '10px', maxWidth: '300px', width: '100%' }}
      ></div>
    </div>
  );
});

export default PaypalCardFields;