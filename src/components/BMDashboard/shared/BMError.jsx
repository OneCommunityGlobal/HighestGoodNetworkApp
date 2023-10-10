import { Button } from 'react-bootstrap';
import { BiErrorCircle } from 'react-icons/bi';

import './BMError.css';

export default function BMError({ error }) {
  return (
    <section>
      <p className="error_text">
        <BiErrorCircle />
        There was an error processing your request: {error.status} ({error.message})
      </p>
      <p>Please try again.</p>
      <Button outline onClick={() => window.location.reload()}>
        Reload
      </Button>
    </section>
  );
}
