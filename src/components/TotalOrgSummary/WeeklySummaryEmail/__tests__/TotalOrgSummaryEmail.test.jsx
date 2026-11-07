/* Version 1.0.0 */
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import TotalOrgSummaryEmail from '../TotalOrgSummaryEmail';

vi.mock('axios');

it('keeps dark email styles inside the page instead of leaving them on the app root', async () => {
  axios.get.mockResolvedValue({ data: { emailList: [] } });
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  const store = configureMockStore([])({ theme: { darkMode: true } });
  const { unmount } = render(
    <Provider store={store}>
      <TotalOrgSummaryEmail />
    </Provider>,
    { container: root },
  );
  await waitFor(() => expect(axios.get).toHaveBeenCalled());
  expect(screen.getByRole('heading', { name: 'Total Org Summary Email' })).toBeInTheDocument();
  expect(root).not.toHaveClass('text-light', 'bg-dark');
  unmount();
  expect(root).not.toHaveClass('text-light', 'bg-dark');
  root.remove();
});
