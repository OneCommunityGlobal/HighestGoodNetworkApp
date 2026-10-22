import { render, screen } from '@testing-library/react';
import App from '~/components/App';

// The Announcements page drives its own tabs off the URL and pushes sub-paths
// like /announcements/email/templates. Registering /announcements as `exact`
// meant none of those matched, so they fell through to the catch-all
// NotFoundPage and the email dashboard's two entry buttons led nowhere.
const announcementsSubPaths = [
  '/announcements/email',
  '/announcements/email/send',
  '/announcements/email/outbox',
  '/announcements/email/templates',
];

describe('routes', () => {
  it.each(announcementsSubPaths)('resolves %s instead of falling through to Not Found', path => {
    window.history.pushState({}, '', path);

    render(<App />);

    // A signed-out visitor is bounced to login by ProtectedRoute; the failure
    // this guards against is the 404 page, which means no route matched at all.
    expect(screen.queryByRole('heading', { name: /page not found/i })).not.toBeInTheDocument();
  });
});
