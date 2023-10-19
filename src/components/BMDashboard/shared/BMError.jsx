// The component provides users with information about the error
// and the ability to refresh the page to reattempt their request.
// The component takes in an axios error as props.
// If the error is client-side, the status and statusText fields are
// extracted from the response object and used on the page.
// If the error is server-side, such as if the backend web service is offline,
// there will be no response object and a generic 503 error is used instead.

import { Button } from 'reactstrap';
import { BiErrorCircle } from 'react-icons/bi';

import './BMError.css';

export default function BMError({ errors }) {
  return (
    <section>
      <p className="error_text">
        <BiErrorCircle />
        There was an error processing your request:{' '}
        {errors.response
          ? `${errors.response.status}(${errors.response.statusText})`
          : '503 (The server is temporarily offline. Please try again later.)'}
      </p>
      <p>Please try again.</p>
      <Button outline color="primary" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </section>
  );
}
